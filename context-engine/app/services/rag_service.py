from typing import Optional
from sqlalchemy.orm import Session
from app.services.retrieval_service import retrieval_service
from app.clients.llm_client import llm_client
from app.schemas.rag import RAGResponse

class RAGService:
    async def answer_query(
        self,
        db: Session,
        knowledge_base_id: str,
        query: str,
        limit: int = 5,
        system_prompt: Optional[str] = None
    ) -> RAGResponse:
        results = await retrieval_service.search(db, knowledge_base_id, query, limit=limit)
        sources = [r.content for r in results]

        context_text = "\n---\n".join(sources) if sources else "No context found."
        prompt = f"Context:\n{context_text}\n\nQuestion: {query}\n\nPlease provide an accurate answer based on the context above."

        sys_prompt = system_prompt or "You are a helpful knowledge assistant. Answer accurately based on context provided."
        answer = await llm_client.generate(prompt=prompt, system_prompt=sys_prompt)

        return RAGResponse(
            query=query,
            answer=answer,
            sources=sources
        )

rag_service = RAGService()
