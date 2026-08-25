import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple
from app.clients.llm_client import llm_client
from app.schemas.resume_tools import ATSScoreResult, ParsedResume

logger = logging.getLogger(__name__)

class ATSScoringService:
    def detect_formatting_flags(
        self,
        raw_text: str,
        pdf_word_positions: Optional[List[Dict[str, Any]]] = None
    ) -> List[str]:
        flags = []
        words = raw_text.split()
        word_count = len(words)

        if word_count < 150:
            flags.append("Very low word count (< 150 words); resume may be too sparse.")
        elif word_count > 1500:
            flags.append("High word count (> 1500 words); recommend condensing to 1-2 pages.")

        # Check multi-column layout from bounding boxes
        if pdf_word_positions and len(pdf_word_positions) > 30:
            x_coords = [w.get("x0", 0) for w in pdf_word_positions if isinstance(w, dict)]
            if x_coords:
                page_width = max(x_coords)
                left_col_words = sum(1 for x in x_coords if x < page_width * 0.45)
                right_col_words = sum(1 for x in x_coords if x > page_width * 0.55)
                # If significant words in both left and right bands without spanning full width
                if left_col_words > len(x_coords) * 0.25 and right_col_words > len(x_coords) * 0.25:
                    flags.append("Multi-column layout detected; may affect ATS parsing accuracy.")

        # Check for unparsed characters or non-standard symbols
        if len(re.findall(r"[^\x00-\x7F]", raw_text)) > 50:
            flags.append("High volume of special/non-ASCII symbols found; use standard bullets.")

        return flags

    def calculate_section_completeness(self, parsed_resume: ParsedResume) -> Tuple[int, List[str]]:
        score = 0
        missing_findings = []

        # Contact Info (25%)
        contact_points = 0
        if parsed_resume.email:
            contact_points += 10
        else:
            missing_findings.append("Missing email address.")
            
        if parsed_resume.phone:
            contact_points += 10
        else:
            missing_findings.append("Missing phone number.")
            
        if parsed_resume.name:
            contact_points += 5
        score += contact_points

        # Skills (25%)
        if len(parsed_resume.skills) >= 5:
            score += 25
        elif len(parsed_resume.skills) >= 2:
            score += 15
            missing_findings.append("Few skills listed (less than 5).")
        else:
            missing_findings.append("No technical skills identified.")

        # Experience (25%)
        if len(parsed_resume.experience) >= 2:
            score += 25
        elif len(parsed_resume.experience) >= 1:
            score += 18
        else:
            missing_findings.append("Missing or incomplete work experience section.")

        # Education (25%)
        if len(parsed_resume.education) >= 1:
            score += 25
        else:
            missing_findings.append("Missing education section.")

        return score, missing_findings

    def calculate_keyword_match_rate(
        self,
        parsed_resume: ParsedResume,
        raw_text: str,
        job_description: str
    ) -> float:
        if not job_description or not job_description.strip():
            return 0.0

        jd_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", job_description.lower()))
        resume_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", raw_text.lower()))

        # Add parsed skills
        for s in parsed_resume.skills:
            resume_words.update(s.lower().split())

        overlap = jd_words.intersection(resume_words)
        rate = len(overlap) / max(len(jd_words), 1)
        return round(min(rate, 1.0), 3)

    async def generate_suggestions(
        self,
        missing_findings: List[str],
        formatting_flags: List[str],
        keyword_match_rate: Optional[float]
    ) -> List[str]:
        deterministic_findings = []
        deterministic_findings.extend(missing_findings)
        deterministic_findings.extend(formatting_flags)

        if keyword_match_rate is not None and keyword_match_rate < 0.4:
            deterministic_findings.append("Low keyword match rate with the target job description.")

        if not deterministic_findings:
            return [
                "Your resume has strong section coverage and clean ATS formatting.",
                "Ensure bullet points start with strong action verbs and quantify achievements with metrics."
            ]

        # Call Claude to phrase findings into plain, constructive suggestions without inventing new findings
        prompt = f"""You are an ATS optimization assistant.
Transform the following deterministic findings into 3 to 5 short, actionable, plain-language resume improvement suggestions:

Findings:
{json.dumps(deterministic_findings)}

Respond with a JSON array of strings ONLY: ["Suggestion 1", "Suggestion 2", ...]"""

        try:
            suggestions = await llm_client.generate_json(prompt=prompt, system_prompt="Phrasing engine for deterministic ATS findings.")
            if isinstance(suggestions, list):
                return [str(s) for s in suggestions[:5]]
        except Exception as e:
            logger.warning(f"Error calling LLM for ATS suggestions phrasing: {e}")

        # Fallback to direct findings if LLM fails
        return [f"Improvement: {f}" for f in deterministic_findings[:5]]

    async def score_resume(
        self,
        parsed_resume: ParsedResume,
        raw_text: str,
        pdf_word_positions: Optional[List[Dict[str, Any]]] = None,
        job_description: Optional[str] = None
    ) -> ATSScoreResult:
        completeness_score, missing_findings = self.calculate_section_completeness(parsed_resume)
        formatting_flags = self.detect_formatting_flags(raw_text, pdf_word_positions)

        keyword_rate = None
        if job_description and job_description.strip():
            keyword_rate = self.calculate_keyword_match_rate(parsed_resume, raw_text, job_description)

        # Overall Score calculation:
        format_penalty = len(formatting_flags) * 10
        if keyword_rate is not None:
            overall = (completeness_score * 0.60) + (keyword_rate * 100 * 0.40) - format_penalty
            overall = max(10, min(overall, 100))
        else:
            base_score = completeness_score * 0.85
            overall = max(10, min(base_score - format_penalty, 100))

        overall_int = int(round(overall))

        suggestions = await self.generate_suggestions(
            missing_findings, formatting_flags, keyword_rate
        )

        return ATSScoreResult(
            overall_score=overall_int,
            section_completeness=completeness_score,
            keyword_match_rate=keyword_rate,
            formatting_flags=formatting_flags,
            suggestions=suggestions
        )

ats_scoring_service = ATSScoringService()
