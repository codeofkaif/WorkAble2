import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Header, UploadFile, status
from sqlalchemy.orm import Session

from app.auth import verify_api_key
from app.db.models import ATSScoreModel, ParsedResumeModel
from app.db.session import get_db
from app.extractors.pdf_extractor import pdf_extractor
from app.schemas.resume_tools import (
    ATSScoreRequest,
    ATSScoreResult,
    JobMatchRequest,
    JobMatchResult,
    ParsedResume,
)
from app.services.ats_scoring_service import ats_scoring_service
from app.services.job_matching_service import job_matching_service
from app.services.resume_parser_service import resume_parser_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resume", tags=["resume_tools"])


@router.post("/parse", response_model=ParsedResume)
async def parse_resume_endpoint(
    file: UploadFile = File(...),
    knowledge_base_id: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        filename = file.filename or "resume.pdf"
        
        parsed = await resume_parser_service.parse_resume(content, filename)

        # Store in DB scoped by knowledge_base_id
        db_record = ParsedResumeModel(
            knowledge_base_id=knowledge_base_id,
            parsed_json=parsed.model_dump(),
            confidence_score=parsed.confidence_score,
            parsing_source=parsed.parsing_source
        )
        db.add(db_record)
        db.commit()

        return parsed
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume parsing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "PARSE_FAILED", "message": f"Resume parsing failed: {str(e)}", "details": None}
        )


@router.post("/ats-score", response_model=ATSScoreResult)
async def ats_score_endpoint(
    request: ATSScoreRequest,
    knowledge_base_id: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    try:
        parsed_resume = request.parsed_resume
        raw_text = request.raw_text or ""
        parsed_resume_id = request.parsed_resume_id

        # If parsed_resume_id is provided, retrieve from DB
        if parsed_resume_id and not parsed_resume:
            record = db.query(ParsedResumeModel).filter(
                ParsedResumeModel.id == parsed_resume_id,
                ParsedResumeModel.knowledge_base_id == knowledge_base_id
            ).first()
            if record:
                parsed_resume = ParsedResume(**record.parsed_json)

        if not parsed_resume:
            if raw_text:
                parsed_resume = await resume_parser_service.parse_resume(raw_text, "resume.txt")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error_code": "INVALID_INPUT", "message": "Either parsed_resume, parsed_resume_id, or raw_text must be provided", "details": None}
                )

        if not raw_text:
            raw_text = f"{parsed_resume.name}\n{parsed_resume.email}\n{' '.join(parsed_resume.skills)}\n" + \
                       "\n".join([f"{e.title} {e.company} {e.description}" for e in parsed_resume.experience])

        score_result = await ats_scoring_service.score_resume(
            parsed_resume=parsed_resume,
            raw_text=raw_text,
            pdf_word_positions=None,
            job_description=request.job_description
        )

        # Store ATS Score in DB scoped by knowledge_base_id
        ats_record = ATSScoreModel(
            knowledge_base_id=knowledge_base_id,
            parsed_resume_id=parsed_resume_id,
            overall_score=score_result.overall_score,
            details=score_result.model_dump()
        )
        db.add(ats_record)
        db.commit()

        return score_result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ATS scoring error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "ATS_SCORING_FAILED", "message": f"ATS scoring failed: {str(e)}", "details": None}
        )


@router.post("/match-job", response_model=JobMatchResult)
async def match_job_endpoint(
    request: JobMatchRequest,
    knowledge_base_id: str = Depends(verify_api_key)
):
    try:
        return await job_matching_service.match_resume_to_job(
            resume_skills=request.resume_skills,
            resume_text=request.resume_text,
            job_description=request.job_description,
            use_embeddings=request.use_embeddings
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job matching error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "MATCH_JOB_FAILED", "message": f"Job matching failed: {str(e)}", "details": None}
        )
