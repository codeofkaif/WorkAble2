import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from app.clients.llm_client import llm_client
from app.extractors.docx_extractor import docx_extractor
from app.extractors.pdf_extractor import pdf_extractor
from app.extractors.txt_extractor import txt_extractor
from app.schemas.resume_tools import (
    EducationEntry,
    ExperienceEntry,
    ParsedResume,
)

logger = logging.getLogger(__name__)

# Load skill taxonomy
TAXONOMY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "resume_tools", "skill_taxonomy.json"
)

def load_skill_taxonomy() -> List[str]:
    try:
        with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Could not load skill taxonomy: {e}")
        return [
            "Java", "Python", "JavaScript", "TypeScript", "React", "Node.js", "Spring Boot",
            "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Machine Learning", "Git",
            "Auditing", "Financial Accounting", "Financial Reporting", "Taxation", "Budgeting"
        ]

SKILL_TAXONOMY = load_skill_taxonomy()


class ResumeParserService:
    def __init__(self, skill_taxonomy: Optional[List[str]] = None):
        self.taxonomy = skill_taxonomy or SKILL_TAXONOMY

    def extract_raw_text(self, file_path_or_bytes: Any, file_type: str) -> str:
        f_type = file_type.lower()
        if "pdf" in f_type:
            return pdf_extractor.extract_text(file_path_or_bytes)
        elif "docx" in f_type or "doc" in f_type:
            return docx_extractor.extract_text(file_path_or_bytes)
        else:
            return txt_extractor.extract_text(file_path_or_bytes)

    def extract_contact_and_header(self, text: str) -> Dict[str, str]:
        info = {
            "name": "",
            "headline": "",
            "email": "",
            "phone": "",
            "address": "",
            "linkedin_url": "",
            "github_url": ""
        }

        # 1. Email
        email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        if email_match:
            info["email"] = email_match.group(0)

        # 2. Phone (Supports Indian +91, 10-digit, and +123-456-7890 formats)
        phone_match = re.search(
            r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|(?:(?:\+|0{0,2})91[\s.-]?)?[6789]\d{9}",
            text
        )
        if phone_match:
            info["phone"] = phone_match.group(0).strip()

        # 3. LinkedIn & GitHub
        li_match = re.search(r"https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
        if li_match:
            info["linkedin_url"] = li_match.group(0)

        gh_match = re.search(r"https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
        if gh_match:
            info["github_url"] = gh_match.group(0)

        # 4. Location / Address Extraction
        contact_line = ""
        for line in text.split("\n")[:6]:
            if "@" in line or re.search(r"\d{3}[-.\s]\d{3}", line):
                contact_line = line
                break

        if contact_line:
            parts = [p.strip() for p in contact_line.split("|")]
            for p in parts:
                if not re.search(r"@|https?:|\+?\d{3}[-.]\d{3}", p) and len(p) >= 3:
                    info["address"] = p
                    break

        if not info["address"]:
            addr_match = re.search(r"(?:\d+\s+[A-Za-z0-9\s.,#-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|City|State|Lane|Boulevard|Blvd|India|USA|UK)[A-Za-z0-9\s.,-]*)", text, re.IGNORECASE)
            if addr_match:
                cand = addr_match.group(0).strip(" |,-\n")
                if len(cand) > 3 and len(cand) < 80:
                    info["address"] = cand

        # 5. Name and Headline extraction from top lines
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        header_candidates = []
        for line in lines[:8]:
            # Stop if we hit a major section header
            if re.match(r"(?i)^(ABOUT ME|SUMMARY|PROFILE|EDUCATION|EXPERIENCE|WORK EXPERIENCE|SKILLS)\b", line):
                break
            if not re.search(r"@|linkedin\.com|github\.com|\+?\d{3}[-.]\d{3}|www\.", line, re.IGNORECASE):
                if len(line.split()) <= 6 and len(line) < 60:
                    header_candidates.append(line)

        if header_candidates:
            info["name"] = header_candidates[0]
            if len(header_candidates) > 1:
                # 2nd line is often the professional headline (e.g. "Professional Accountant")
                info["headline"] = header_candidates[1]

        return info

    def segment_sections(self, text: str) -> Dict[str, str]:
        header_patterns = [
            ("SUMMARY", r"(?i)^(?:ABOUT\s+ME|ABOUT|SUMMARY|PROFILE|OBJECTIVE|CAREER\s+OBJECTIVE|PROFESSIONAL\s+SUMMARY|EXECUTIVE\s+SUMMARY)[:]?\s*$"),
            ("EXPERIENCE", r"(?i)^(?:WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|WORK\s+HISTORY)[:]?\s*$"),
            ("EDUCATION", r"(?i)^(?:EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMIC\s+QUALIFICATIONS|QUALIFICATIONS)[:]?\s*$"),
            ("SKILLS", r"(?i)^(?:SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|KEY\s+SKILLS|AREAS\s+OF\s+EXPERTISE)[:]?\s*$"),
            ("PROJECTS", r"(?i)^(?:PROJECTS|KEY\s+PROJECTS|PERSONAL\s+PROJECTS|ACADEMIC\s+PROJECTS)[:]?\s*$"),
            ("CERTIFICATIONS", r"(?i)^(?:CERTIFICATIONS|CERTIFICATES|LICENSES|COURSES)[:]?\s*$"),
            ("ACHIEVEMENTS", r"(?i)^(?:ACHIEVEMENTS|AWARDS|HONORS|PUBLICATIONS)[:]?\s*$")
        ]

        sections: Dict[str, List[str]] = {}
        current_section = "HEADER"
        sections[current_section] = []

        lines = text.split("\n")
        for line in lines:
            trimmed = line.strip()
            # Check if line matches any section header
            matched_header = None
            for key, pattern in header_patterns:
                if re.match(pattern, trimmed):
                    matched_header = key
                    break

            if matched_header:
                current_section = matched_header
                if current_section not in sections:
                    sections[current_section] = []
            else:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(line)

        return {k: "\n".join(v).strip() for k, v in sections.items()}

    def parse_experience_entries(self, exp_text: str) -> Tuple[List[ExperienceEntry], float]:
        entries: List[ExperienceEntry] = []
        total_years = 0.0

        if not exp_text or not exp_text.strip():
            return entries, 0.0

        date_range_regex = r"(?i)(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4})\s*(?:-|–|to)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4}|Present|Current)"

        # Split into blocks by double newline or date-headers
        blocks = re.split(r"\n\s*\n", exp_text)
        current_year = datetime.now().year

        for block in blocks:
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if not lines:
                continue

            company, title, start_date, end_date = "", "", "", ""
            desc_lines = []

            # Check if first line has pipe delimiter like "Salford & Co. | 2033 - 2035"
            first_line = lines[0]
            if "|" in first_line:
                parts = [p.strip() for p in first_line.split("|")]
                company = parts[0]
                date_match = re.search(date_range_regex, parts[1] if len(parts) > 1 else "")
                if date_match:
                    start_date = date_match.group(1).strip()
                    end_date = date_match.group(2).strip()
                
                # Second line is usually title/position
                if len(lines) > 1:
                    title = lines[1]
                    desc_lines = lines[2:]
            else:
                date_match = re.search(date_range_regex, block)
                if date_match:
                    start_date = date_match.group(1).strip()
                    end_date = date_match.group(2).strip()

                title = lines[0] if lines else ""
                company = lines[1] if len(lines) > 1 and not re.search(date_range_regex, lines[1]) else ""
                desc_lines = lines[2:] if len(lines) > 2 else []

            desc = "\n".join(desc_lines) if desc_lines else block

            entries.append(ExperienceEntry(
                title=title,
                position=title,
                company=company,
                start_date=start_date,
                end_date=end_date,
                description=desc
            ))

        # Calculate experience years
        matches = re.findall(date_range_regex, exp_text)
        for start, end in matches:
            try:
                s_year = int(re.search(r"\d{4}", start).group(0))
                e_year = current_year if "present" in end.lower() or "current" in end.lower() else int(re.search(r"\d{4}", end).group(0))
                diff = max(0, e_year - s_year)
                total_years += diff
            except Exception:
                pass

        return entries, round(min(total_years, 40.0), 1)

    def parse_education_entries(self, edu_text: str) -> List[EducationEntry]:
        entries: List[EducationEntry] = []
        if not edu_text or not edu_text.strip():
            return entries

        date_range_regex = r"(?i)(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4})\s*(?:-|–|to)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4}|Present|Current)"
        degree_patterns = r"(?i)\b(B\.?Tech|B\.?E\.?|B\.?S\.?|B\.?Sc|B\.?C\.?A\.?|B\.?Com|M\.?Tech|M\.?E\.?|M\.?S\.?|M\.?Sc|M\.?C\.?A\.?|M\.?Com|MBA|PhD|Bachelor|Master|Diploma|High School|Senior Accountant|Accountant)\b"
        cgpa_pattern = r"(?i)\b(CGPA|GPA|Percentage|%)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?(?:/[0-9]+)?%?)"

        blocks = re.split(r"\n\s*\n", edu_text)
        for block in blocks:
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if not lines:
                continue

            institution, degree, start_date, end_date, year = "", "", "", "", ""
            cgpa = None

            first_line = lines[0]
            if "|" in first_line:
                parts = [p.strip() for p in first_line.split("|")]
                institution = parts[0]
                date_match = re.search(date_range_regex, parts[1] if len(parts) > 1 else "")
                if date_match:
                    start_date = date_match.group(1).strip()
                    end_date = date_match.group(2).strip()
                    year = f"{start_date} - {end_date}"
                elif len(parts) > 1:
                    year = parts[1]

                if len(lines) > 1:
                    degree = lines[1]
            else:
                deg_match = re.search(degree_patterns, block)
                if deg_match:
                    degree = deg_match.group(0)
                year_match = re.search(r"\b(19\d{2}|20\d{2})\b", block)
                if year_match:
                    year = year_match.group(0)
                institution = lines[0]

            cgpa_match = re.search(cgpa_pattern, block)
            if cgpa_match:
                cgpa = cgpa_match.group(2)

            entries.append(EducationEntry(
                degree=degree if degree else "Degree / Field of Study",
                institution=institution,
                field=degree,
                start_date=start_date,
                end_date=end_date,
                year=year,
                cgpa_or_percentage=cgpa
            ))

        return entries

    def extract_skills(self, full_text: str, skills_section_text: str = "") -> List[str]:
        skills_set = set()

        # 1. Match from Skill Taxonomy across full text
        for skill in self.taxonomy:
            pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"
            if re.search(pattern, full_text, re.IGNORECASE):
                skills_set.add(skill)

        # 2. Extract bullets and items from the SKILLS section directly (handles non-tech / custom skills like Auditing, Financial Accounting)
        if skills_section_text:
            items = re.split(r"[\n•*|\t,]+", skills_section_text)
            for item in items:
                cleaned = item.strip()
                if cleaned and len(cleaned) >= 2 and len(cleaned) <= 40:
                    # Ignore headers or descriptions
                    if not re.search(r"(skills|competencies|expertise|proficient in|years of experience)", cleaned, re.IGNORECASE):
                        skills_set.add(cleaned)

        return sorted(list(skills_set))

    def compute_confidence(self, parsed: ParsedResume) -> float:
        score = 0.0
        if parsed.name: score += 0.15
        if parsed.email: score += 0.25
        if parsed.phone: score += 0.15
        if len(parsed.skills) >= 2: score += 0.25
        elif len(parsed.skills) >= 1: score += 0.15
        if len(parsed.experience) >= 1: score += 0.10
        if len(parsed.education) >= 1: score += 0.10
        return round(min(score, 1.0), 2)

    async def parse_with_llm_fallback(self, raw_text: str) -> ParsedResume:
        prompt = f"""Extract all structured resume information from the raw resume text into JSON matching this exact structure:
{{
  "name": "string",
  "headline": "string",
  "summary": "string",
  "address": "string",
  "email": "string",
  "phone": "string",
  "linkedin_url": "string",
  "github_url": "string",
  "skills": ["string"],
  "education": [{{"degree": "string", "institution": "string", "field": "string", "start_date": "string", "end_date": "string", "year": "string", "cgpa_or_percentage": "string or null"}}],
  "experience": [{{"title": "string", "position": "string", "company": "string", "start_date": "string", "end_date": "string", "description": "string"}}],
  "projects": ["string"],
  "certifications": ["string"],
  "total_experience_years": 0.0
}}

Raw Resume Text:
{raw_text[:6000]}
"""
        try:
            data = await llm_client.generate_json(prompt=prompt, system_prompt="You are an expert resume parsing engine.")
            return ParsedResume(
                name=data.get("name", ""),
                headline=data.get("headline", ""),
                summary=data.get("summary", ""),
                address=data.get("address", ""),
                email=data.get("email", ""),
                phone=data.get("phone", ""),
                linkedin_url=data.get("linkedin_url", ""),
                github_url=data.get("github_url", ""),
                skills=data.get("skills", []),
                education=[EducationEntry(**e) for e in data.get("education", [])],
                experience=[ExperienceEntry(**e) for e in data.get("experience", [])],
                projects=data.get("projects", []),
                certifications=data.get("certifications", []),
                total_experience_years=float(data.get("total_experience_years", 0.0)),
                confidence_score=0.9,
                parsing_source="llm_fallback"
            )
        except Exception as e:
            logger.error(f"LLM fallback failed: {e}")
            return ParsedResume(confidence_score=0.2, parsing_source="local")

    async def parse_resume(self, file_path_or_bytes: Any, file_type: str) -> ParsedResume:
        raw_text = self.extract_raw_text(file_path_or_bytes, file_type)
        if not raw_text or not raw_text.strip():
            return ParsedResume(confidence_score=0.0, parsing_source="local")

        contact = self.extract_contact_and_header(raw_text)
        sections = self.segment_sections(raw_text)

        skills = self.extract_skills(raw_text, sections.get("SKILLS", ""))
        exp_entries, exp_years = self.parse_experience_entries(sections.get("EXPERIENCE", ""))
        edu_entries = self.parse_education_entries(sections.get("EDUCATION", ""))

        summary = sections.get("SUMMARY", "")

        # Projects and Certifications
        proj_text = sections.get("PROJECTS", "")
        projects = [p.strip() for p in proj_text.split("\n") if p.strip() and len(p.strip()) > 5][:10]

        cert_text = sections.get("CERTIFICATIONS", "")
        certifications = [c.strip() for c in cert_text.split("\n") if c.strip() and len(c.strip()) > 3][:10]

        parsed = ParsedResume(
            name=contact["name"],
            headline=contact["headline"],
            summary=summary,
            address=contact["address"],
            email=contact["email"],
            phone=contact["phone"],
            linkedin_url=contact["linkedin_url"],
            github_url=contact["github_url"],
            skills=skills,
            education=edu_entries,
            experience=exp_entries,
            projects=projects,
            certifications=certifications,
            total_experience_years=exp_years,
            confidence_score=1.0,
            parsing_source="local"
        )

        confidence = self.compute_confidence(parsed)
        parsed.confidence_score = confidence

        if confidence < 0.5:
            logger.info(f"Confidence score {confidence} < 0.5; triggering Claude LLM fallback parsing")
            return await self.parse_with_llm_fallback(raw_text)

        return parsed

resume_parser_service = ResumeParserService()
