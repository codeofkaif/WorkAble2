import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RESUME = """
Kaif Khan
kaif@example.com
+91 9876543210
SKILLS: Java, Spring Boot, React, MongoDB, PostgreSQL
EXPERIENCE:
Software Engineer at Acme Corp (2022 - Present)
Developed APIs using Java and Spring Boot.
EDUCATION:
B.Tech in Computer Science (2018 - 2022)
"""

def test_missing_knowledge_base_id():
    response = client.post(
        "/resume/match-job",
        headers={"X-API-Key": "test-api-key"},
        json={
            "resume_skills": ["Java"],
            "resume_text": "Java engineer",
            "job_description": "Java developer needed"
        }
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error_code"] == "MISSING_KNOWLEDGE_BASE_ID"


def test_auth_failure_invalid_key():
    response = client.post(
        "/resume/match-job",
        headers={"X-API-Key": "wrong-key", "X-Knowledge-Base-Id": "kb-123"},
        json={
            "resume_skills": ["Java"],
            "resume_text": "Java engineer",
            "job_description": "Java developer needed"
        }
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error_code"] == "UNAUTHORIZED"


def test_resume_parse_endpoint():
    files = {
        "file": ("resume.txt", SAMPLE_RESUME.encode("utf-8"), "text/plain")
    }
    headers = {
        "X-API-Key": "test-api-key",
        "X-Knowledge-Base-Id": "kb-workable-001"
    }
    response = client.post("/resume/parse", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Kaif Khan"
    assert data["email"] == "kaif@example.com"
    assert "Java" in data["skills"]
    assert "Spring Boot" in data["skills"]


def test_ats_score_endpoint():
    headers = {
        "X-API-Key": "test-api-key",
        "X-Knowledge-Base-Id": "kb-workable-001"
    }
    payload = {
        "raw_text": SAMPLE_RESUME,
        "job_description": "We need a Java and Spring Boot engineer with React skills."
    }
    response = client.post("/resume/ats-score", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert "section_completeness" in data
    assert data["overall_score"] > 50


def test_match_job_endpoint():
    headers = {
        "X-API-Key": "test-api-key",
        "X-Knowledge-Base-Id": "kb-workable-001"
    }
    payload = {
        "resume_skills": ["Java", "Spring Boot", "React"],
        "resume_text": SAMPLE_RESUME,
        "job_description": "Looking for Java and Docker developer.",
        "use_embeddings": False
    }
    response = client.post("/resume/match-job", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "match_score" in data
    assert "matched_skills" in data
    assert "missing_skills" in data
    assert "Java" in data["matched_skills"]
    assert "Docker" in data["missing_skills"]
