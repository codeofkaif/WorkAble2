import pytest
from app.services.resume_parser_service import ResumeParserService

SEBASTIAN_BENNETT_RESUME = """
SEBASTIAN BENNETT
Professional Accountant
+123-456-7890 | hello@reallygreatsite.com | 123 Anywhere St., Any City

ABOUT ME
Passionate and detail-oriented accountant with extensive experience in corporate accounting, audits, and financial reporting.

EDUCATION
Borcelle University | 2026-2030
Senior Accountant
Master of Commerce specializing in Advanced Corporate Accounting.

Borcelle University | 2023-2026
Senior Accountant
Bachelor of Commerce in Accounting & Finance.

WORK EXPERIENCE
Salford & Co. | 2033 - 2035
Senior Accountant
Led financial audit procedures and streamlined corporate financial reporting workflows.

Salford & Co. | 2030 - 2033
Financial Accountant
Prepared balance sheets, managed ledger entries, and compiled tax filings.

SKILLS
• Auditing
• Financial Accounting
• Financial Reporting
• Taxation
"""

@pytest.mark.asyncio
async def test_sebastian_bennett_resume_parsing():
    parser = ResumeParserService()
    parsed = await parser.parse_resume(SEBASTIAN_BENNETT_RESUME.encode("utf-8"), "resume.txt")

    assert parsed.name == "SEBASTIAN BENNETT"
    assert parsed.headline == "Professional Accountant"
    assert parsed.email == "hello@reallygreatsite.com"
    assert "123-456-7890" in parsed.phone
    assert "123 Anywhere St" in parsed.address
    assert len(parsed.summary) > 20

    # Skills extraction (accounting domain skills)
    assert any("auditing" in s.lower() for s in parsed.skills)
    assert any("financial accounting" in s.lower() for s in parsed.skills)
    assert any("financial reporting" in s.lower() for s in parsed.skills)

    # Experience entries
    assert len(parsed.experience) >= 2
    assert "Salford & Co." in parsed.experience[0].company
    assert "Senior Accountant" in parsed.experience[0].title
    assert "2033" in parsed.experience[0].start_date

    # Education entries
    assert len(parsed.education) >= 2
    assert "Borcelle University" in parsed.education[0].institution
