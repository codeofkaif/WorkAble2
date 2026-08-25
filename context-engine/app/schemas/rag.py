from typing import List, Optional
from pydantic import BaseModel, Field

class RAGRequest(BaseModel):
    query: str
    limit: int = Field(default=5, ge=1, le=20)
    system_prompt: Optional[str] = None

class RAGResponse(BaseModel):
    query: str
    answer: str
    sources: List[str] = Field(default_factory=list)
