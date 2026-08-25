from fastapi import Header, HTTPException, status
from app.config import settings

async def verify_api_key(
    x_api_key: str = Header(None, alias="X-API-Key"),
    knowledge_base_id: str = Header(None, alias="X-Knowledge-Base-Id")
) -> str:
    # If a static API key is set in production/testing, check it
    if settings.STATIC_API_KEY and settings.STATIC_API_KEY != "":
        if not x_api_key or x_api_key != settings.STATIC_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error_code": "UNAUTHORIZED", "message": "Invalid or missing API key", "details": None}
            )
    
    if not knowledge_base_id or knowledge_base_id.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": "MISSING_KNOWLEDGE_BASE_ID", "message": "X-Knowledge-Base-Id header is required", "details": None}
        )
        
    return knowledge_base_id
