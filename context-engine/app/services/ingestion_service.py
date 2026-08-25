import os
from typing import Optional
from sqlalchemy.orm import Session
from app.db.models import Document, DocumentChunk
from app.extractors.pdf_extractor import pdf_extractor
from app.extractors.docx_extractor import docx_extractor
from app.extractors.txt_extractor import txt_extractor
from app.chunking.chunker import chunker
from app.clients.embedding_client import embedding_client

class IngestionService:
    async def ingest_file(
        self,
        db: Session,
        knowledge_base_id: str,
        filename: str,
        content: bytes,
        content_type: Optional[str] = None
    ) -> Document:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            raw_text = pdf_extractor.extract_text(content)
        elif ext in [".docx", ".doc"]:
            raw_text = docx_extractor.extract_text(content)
        else:
            raw_text = txt_extractor.extract_text(content)

        doc = Document(
            knowledge_base_id=knowledge_base_id,
            filename=filename,
            content_type=content_type or ext,
            raw_text=raw_text
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Chunk text
        chunks = chunker.chunk_text(raw_text)
        if chunks:
            embeddings = await embedding_client.get_embeddings(chunks)
            for idx, (chunk_text, emb) in enumerate(zip(chunks, embeddings)):
                db_chunk = DocumentChunk(
                    document_id=doc.id,
                    knowledge_base_id=knowledge_base_id,
                    chunk_index=idx,
                    content=chunk_text,
                    embedding=emb
                )
                db.add(db_chunk)
            db.commit()

        return doc

ingestion_service = IngestionService()
