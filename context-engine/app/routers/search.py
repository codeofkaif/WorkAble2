import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import verify_api_key
from app.db.session import get_db
from app.schemas.search import SearchRequest, SearchResponse
from app.services.retrieval_service import retrieval_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_endpoint(
    request: SearchRequest,
    knowledge_base_id: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    try:
        results = await retrieval_service.search(
            db=db,
            knowledge_base_id=knowledge_base_id,
            query=request.query,
            limit=request.limit
        )
        return SearchResponse(query=request.query, results=results)
    except Exception as e:
        logger.error(f"Search endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "SEARCH_FAILED", "message": str(e), "details": None}
        )
