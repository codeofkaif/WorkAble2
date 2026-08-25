from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class EducationEntry(BaseModel):
    degree: str = ""
    institution: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    year: str = ""
    cgpa_or_percentage: Optional[str] = None

class ExperienceEntry(BaseModel):
    title: str = ""
    position: str = ""
    company: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""

class ParsedResume(BaseModel):
    name: str = ""
    headline: str = ""
    summary: str = ""
    address: str = ""
    email: str = ""
    phone: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    skills: List[str] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list)
    experience: List[ExperienceEntry] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    total_experience_years: float = 0.0
    confidence_score: float = 1.0
    parsing_source: Literal["local", "llm_fallback"] = "local"

class ATSScoreResult(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    section_completeness: int = Field(..., ge=0, le=100)
    keyword_match_rate: Optional[float] = None
    formatting_flags: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)

class JobMatchResult(BaseModel):
    match_score: float = Field(..., ge=0.0, le=1.0)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    stage: Literal["tfidf_shortlist", "embedding_reranked"] = "tfidf_shortlist"

class ATSScoreRequest(BaseModel):
    parsed_resume: Optional[ParsedResume] = None
    parsed_resume_id: Optional[str] = None
    raw_text: Optional[str] = None
    job_description: Optional[str] = None

class JobMatchRequest(BaseModel):
    resume_skills: List[str] = Field(default_factory=list)
    resume_text: str
    job_description: str
    use_embeddings: bool = False
