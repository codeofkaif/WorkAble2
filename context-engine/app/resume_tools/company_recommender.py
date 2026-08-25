import json
import os
from typing import List, Dict, Optional

COMPANIES_FILE = os.path.join(os.path.dirname(__file__), "companies.json")

def load_companies() -> List[Dict[str, str]]:
    """Loads all companies from companies.json"""
    if os.path.exists(COMPANIES_FILE):
        with open(COMPANIES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def get_companies_by_category(category: str) -> List[Dict[str, str]]:
    """Filters companies by category (case-insensitive)."""
    category_lower = category.strip().lower()
    return [
        c for c in load_companies()
        if c.get("category", "").lower() == category_lower
    ]

def search_companies(query: str) -> List[Dict[str, str]]:
    """Searches companies by name or category."""
    q = query.strip().lower()
    if not q:
        return load_companies()
    return [
        c for c in load_companies()
        if q in c.get("name", "").lower() or q in c.get("category", "").lower()
    ]
