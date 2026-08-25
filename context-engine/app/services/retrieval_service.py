from typing import List
import numpy as np
from sqlalchemy.orm import Session
from app.db.models import DocumentChunk
from app.schemas.search import SearchResultItem
from app.clients.embedding_client import embedding_client

class RetrievalService:
    async def search(
        self,
        db: Session,
        knowledge_base_id: str,
        query: str,
        limit: int = 5
    ) -> List[SearchResultItem]:
        chunks = db.query(DocumentChunk).filter(DocumentChunk.knowledge_base_id == knowledge_base_id).all()
        if not chunks:
            return []

        query_embedding = await embedding_client.get_embedding(query)
        q_vec = np.array(query_embedding)
        q_norm = np.linalg.norm(q_vec)

        scored = []
        for c in chunks:
            if c.embedding:
                c_vec = np.array(c.embedding)
                c_norm = np.linalg.norm(c_vec)
                sim = float(np.dot(q_vec, c_vec) / (q_norm * c_norm + 1e-9)) if q_norm > 0 and c_norm > 0 else 0.0
                scored.append((sim, c))
            else:
                scored.append((0.0, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored[:limit]

        return [
            SearchResultItem(
                chunk_id=c.id,
                document_id=c.document_id,
                content=c.content,
                score=score
            )
            for score, c in top_chunks
        ]

retrieval_service = RetrievalService()
