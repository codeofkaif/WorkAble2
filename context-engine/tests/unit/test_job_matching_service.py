import pytest
from unittest.mock import AsyncMock, patch
from app.services.job_matching_service import JobMatchingService

@pytest.mark.asyncio
async def test_job_matching_tfidf_standalone():
    service = JobMatchingService()
    
    resume_skills = ["Java", "Spring Boot", "React", "PostgreSQL"]
    resume_text = "Experienced software engineer specializing in Java, Spring Boot backend development and React frontends."
    jd_text = "Senior Software Engineer required with extensive Java, Spring Boot, and Docker experience."

    result = await service.match_resume_to_job(
        resume_skills=resume_skills,
        resume_text=resume_text,
        job_description=jd_text,
        use_embeddings=False
    )

    assert result.stage == "tfidf_shortlist"
    assert result.match_score > 0.1
    assert "Java" in result.matched_skills
    assert "Spring Boot" in result.matched_skills
    assert "Docker" in result.missing_skills


@pytest.mark.asyncio
async def test_job_matching_embedding_rerank():
    service = JobMatchingService()
    
    resume_skills = ["Java", "Spring Boot"]
    resume_text = "Java developer"
    jd_text = "Looking for Java developer"

    with patch("app.services.job_matching_service.embedding_client.get_embeddings", new_callable=AsyncMock) as mock_emb:
        mock_emb.return_value = [
            [1.0, 0.0, 0.0],
            [1.0, 0.0, 0.0]
        ]

        result = await service.match_resume_to_job(
            resume_skills=resume_skills,
            resume_text=resume_text,
            job_description=jd_text,
            use_embeddings=True
        )

        assert result.stage == "embedding_reranked"
        assert result.match_score > 0.8
        mock_emb.assert_called_once()
