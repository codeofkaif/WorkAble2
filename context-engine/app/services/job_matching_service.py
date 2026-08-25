import logging
import re
from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.clients.embedding_client import embedding_client
from app.schemas.resume_tools import JobMatchResult
from app.services.resume_parser_service import SKILL_TAXONOMY

logger = logging.getLogger(__name__)

class JobMatchingService:
    def __init__(self, skill_taxonomy: Optional[List[str]] = None):
        self.taxonomy = skill_taxonomy or SKILL_TAXONOMY

    def extract_jd_skills(self, job_description: str) -> List[str]:
        matched = []
        for skill in self.taxonomy:
            pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"
            if re.search(pattern, job_description, re.IGNORECASE):
                matched.append(skill)
        return sorted(list(set(matched)))

    async def match_resume_to_job(
        self,
        resume_skills: List[str],
        resume_text: str,
        job_description: str,
        use_embeddings: bool = False
    ) -> JobMatchResult:
        if not resume_text or not job_description:
            return JobMatchResult(
                match_score=0.0,
                matched_skills=[],
                missing_skills=[],
                stage="tfidf_shortlist"
            )

        # 1. Skill overlap calculation
        jd_skills = self.extract_jd_skills(job_description)
        resume_skills_lower = {s.lower() for s in resume_skills}
        
        matched_skills = [s for s in jd_skills if s.lower() in resume_skills_lower]
        missing_skills = [s for s in jd_skills if s.lower() not in resume_skills_lower]

        # 2. Stage 1: TF-IDF (local, always runs)
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
            tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
            tfidf_score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
            tfidf_score = max(0.0, min(tfidf_score, 1.0))
        except Exception as e:
            logger.warning(f"TF-IDF computation failed: {e}")
            tfidf_score = 0.0

        final_score = tfidf_score
        stage = "tfidf_shortlist"

        # 3. Stage 2: Embedding Rerank (Optional flag)
        if use_embeddings:
            try:
                embeddings = await embedding_client.get_embeddings([resume_text[:4000], job_description[:4000]])
                if len(embeddings) == 2:
                    v1 = np.array(embeddings[0])
                    v2 = np.array(embeddings[1])
                    norm1, norm2 = np.linalg.norm(v1), np.linalg.norm(v2)
                    if norm1 > 0 and norm2 > 0:
                        emb_score = float(np.dot(v1, v2) / (norm1 * norm2))
                        final_score = max(0.0, min(emb_score, 1.0))
                        stage = "embedding_reranked"
            except Exception as e:
                logger.warning(f"Embedding rerank failed: {e}; falling back to TF-IDF score")

        # Blend skill coverage slightly into score if skills are present
        if jd_skills:
            skill_ratio = len(matched_skills) / len(jd_skills)
            blended_score = (final_score * 0.6) + (skill_ratio * 0.4)
            final_score = round(min(blended_score, 1.0), 3)
        else:
            final_score = round(final_score, 3)

        return JobMatchResult(
            match_score=final_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            stage=stage
        )

job_matching_service = JobMatchingService()
