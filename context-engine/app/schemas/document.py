import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class DocumentUploadResponse(BaseModel):
    id: str
    knowledge_base_id: str
    filename: str
    content_type: Optional[str] = None
    chunks_count: int
    created_at: datetime.datetime

class DocumentResponse(BaseModel):
    id: str
    knowledge_base_id: str
    filename: str
    content_type: Optional[str] = None
    created_at: datetime.datetime
