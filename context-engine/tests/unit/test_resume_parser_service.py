import pytest
from unittest.mock import AsyncMock, patch
from app.services.resume_parser_service import ResumeParserService

SAMPLE_RESUME_TEXT = """
Kaif Khan
kaif.khan@example.com | +91 9876543210
https://linkedin.com/in/kaif-khan
https://github.com/kaifkhan

SUMMARY
Passionate software engineer experienced in Java, Spring Boot, React, and MongoDB.

TECHNICAL SKILLS
Java, Spring Boot, React, TypeScript, PostgreSQL, MongoDB, Docker, Git, Machine Learning

WORK EXPERIENCE
Full Stack Developer - Tech Corp
01/2022 - Present
Built scalable REST APIs using Spring Boot and microservices architecture. Designed PostgreSQL database schemas.

EDUCATION
B.Tech in Computer Science - State University
2018 - 2022
CGPA: 8.5/10

PROJECTS
WorkAble Accessibility Platform: Inclusive career and resume builder platform with WCAG compliance.
"""

@pytest.mark.asyncio
async def test_resume_parser_local_extraction():
    parser = ResumeParserService()
    parsed = await parser.parse_resume(SAMPLE_RESUME_TEXT.encode("utf-8"), "resume.txt")

    assert parsed.name == "Kaif Khan"
    assert parsed.email == "kaif.khan@example.com"
    assert "+91 9876543210" in parsed.phone or "9876543210" in parsed.phone
    assert parsed.linkedin_url == "https://linkedin.com/in/kaif-khan"
    assert parsed.github_url == "https://github.com/kaifkhan"
    
    # Assert skills extracted from taxonomy
    assert "Spring Boot" in parsed.skills
    assert "Java" in parsed.skills
    assert "React" in parsed.skills
    assert "PostgreSQL" in parsed.skills

    # Assert experience & education
    assert len(parsed.experience) >= 1
    assert len(parsed.education) >= 1
    assert parsed.confidence_score >= 0.5
    assert parsed.parsing_source == "local"


@pytest.mark.asyncio
async def test_resume_parser_llm_fallback():
    sparse_text = "Unstructured contact notes: John Doe, please call."
    parser = ResumeParserService()

    with patch("app.services.resume_parser_service.llm_client.generate_json", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "skills": ["Python", "FastAPI"],
            "education": [{"degree": "B.S.", "institution": "Univ", "year": "2020", "cgpa_or_percentage": "3.8"}],
            "experience": [{"title": "Dev", "company": "Co", "start_date": "2020", "end_date": "2023", "description": "Dev work"}],
            "projects": [],
            "certifications": [],
            "total_experience_years": 3.0
        }

        parsed = await parser.parse_resume(sparse_text.encode("utf-8"), "sparse.txt")
        assert parsed.parsing_source == "llm_fallback"
        assert parsed.name == "John Doe"
        assert "FastAPI" in parsed.skills
        mock_llm.assert_called_once()
