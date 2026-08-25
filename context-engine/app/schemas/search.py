from typing import List, Optional
from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    query: str
    limit: int = Field(default=5, ge=1, le=50)

class SearchResultItem(BaseModel):
    chunk_id: str
    document_id: str
    content: str
    score: float

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
