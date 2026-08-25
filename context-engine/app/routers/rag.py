import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import verify_api_key
from app.db.session import get_db
from app.schemas.rag import RAGRequest, RAGResponse
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("", response_model=RAGResponse)
async def rag_endpoint(
    request: RAGRequest,
    knowledge_base_id: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    try:
        return await rag_service.answer_query(
            db=db,
            knowledge_base_id=knowledge_base_id,
            query=request.query,
            limit=request.limit,
            system_prompt=request.system_prompt
        )
    except Exception as e:
        logger.error(f"RAG endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "RAG_FAILED", "message": str(e), "details": None}
        )
