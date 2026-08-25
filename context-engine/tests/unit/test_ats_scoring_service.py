import pytest
from app.services.ats_scoring_service import ATSScoringService
from app.schemas.resume_tools import ParsedResume, EducationEntry, ExperienceEntry

@pytest.mark.asyncio
async def test_ats_scoring_service_completeness_and_scoring():
    service = ATSScoringService()
    
    parsed = ParsedResume(
        name="Kaif Khan",
        email="kaif@example.com",
        phone="+919876543210",
        skills=["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
        education=[EducationEntry(degree="B.Tech", institution="College", year="2022")],
        experience=[
            ExperienceEntry(title="Backend Dev", company="Corp", start_date="2022", end_date="Present", description="Spring Boot dev"),
            ExperienceEntry(title="Intern", company="Startup", start_date="2021", end_date="2022", description="React dev")
        ]
    )

    raw_text = "Kaif Khan kaif@example.com +919876543210 Java Spring Boot React PostgreSQL Docker B.Tech Backend Dev Corp" * 20
    jd = "Looking for a Backend Developer with strong Java, Spring Boot, and PostgreSQL skills."

    result = await service.score_resume(
        parsed_resume=parsed,
        raw_text=raw_text,
        pdf_word_positions=None,
        job_description=jd
    )

    assert result.overall_score >= 70
    assert result.section_completeness == 100
    assert result.keyword_match_rate is not None
    assert result.keyword_match_rate > 0.3
    assert isinstance(result.suggestions, list)
    assert len(result.suggestions) > 0


def test_detect_formatting_flags():
    service = ATSScoringService()
    
    # Very short text flag
    flags = service.detect_formatting_flags("Short resume text under 150 words.")
    assert any("Very low word count" in f for f in flags)
