import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    knowledge_base_id = Column(String(100), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    knowledge_base_id = Column(String(100), index=True, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True) # Vector stored as JSON array (or pgvector)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class ParsedResumeModel(Base):
    __tablename__ = "parsed_resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    knowledge_base_id = Column(String(100), index=True, nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    parsed_json = Column(JSON, nullable=False)
    confidence_score = Column(Float, nullable=False, default=1.0)
    parsing_source = Column(String(50), nullable=False, default="local") # "local" | "llm_fallback"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ats_scores = relationship("ATSScoreModel", back_populates="parsed_resume", cascade="all, delete-orphan")


class ATSScoreModel(Base):
    __tablename__ = "ats_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    knowledge_base_id = Column(String(100), index=True, nullable=False)
    parsed_resume_id = Column(String(36), ForeignKey("parsed_resumes.id", ondelete="CASCADE"), nullable=True)
    overall_score = Column(Integer, nullable=False)
    details = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parsed_resume = relationship("ParsedResumeModel", back_populates="ats_scores")
