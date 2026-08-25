import logging
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth import verify_api_key
from app.db.models import Document
from app.db.session import get_db
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.ingestion_service import ingestion_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    knowledge_base_id: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        filename = file.filename or "document.txt"
        doc = await ingestion_service.ingest_file(
            db=db,
            knowledge_base_id=knowledge_base_id,
            filename=filename,
            content=content,
            content_type=file.content_type
        )
        return DocumentUploadResponse(
            id=doc.id,
            knowledge_base_id=doc.knowledge_base_id,
            filename=doc.filename,
            content_type=doc.content_type,
            chunks_count=len(doc.chunks),
            created_at=doc.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "DOCUMENT_UPLOAD_FAILED", "message": str(e), "details": None}
        )


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    knowledge_base_id: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    try:
        docs = db.query(Document).filter(Document.knowledge_base_id == knowledge_base_id).all()
        return [
            DocumentResponse(
                id=d.id,
                knowledge_base_id=d.knowledge_base_id,
                filename=d.filename,
                content_type=d.content_type,
                created_at=d.created_at
            )
            for d in docs
        ]
    except Exception as e:
        logger.error(f"List documents failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "LIST_DOCUMENTS_FAILED", "message": str(e), "details": None}
        )
