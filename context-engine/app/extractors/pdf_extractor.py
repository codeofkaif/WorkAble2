import io
from typing import Dict, List, Optional, Tuple, Any
import pdfplumber
from pypdf import PdfReader

class PDFExtractor:
    @staticmethod
    def extract_text(file_path_or_bytes: Any) -> str:
        text_parts = []
        try:
            if isinstance(file_path_or_bytes, bytes):
                reader = PdfReader(io.BytesIO(file_path_or_bytes))
            else:
                reader = PdfReader(file_path_or_bytes)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
            if text_parts:
                return "\n".join(text_parts)
        except Exception:
            pass

        # Fallback to pdfplumber
        try:
            with pdfplumber.open(io.BytesIO(file_path_or_bytes) if isinstance(file_path_or_bytes, bytes) else file_path_or_bytes) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text_parts.append(t)
            return "\n".join(text_parts)
        except Exception as e:
            return ""

    @staticmethod
    def extract_text_and_positions(file_path_or_bytes: Any) -> Tuple[str, List[Dict[str, Any]]]:
        raw_text_parts = []
        word_positions: List[Dict[str, Any]] = []
        try:
            stream = io.BytesIO(file_path_or_bytes) if isinstance(file_path_or_bytes, bytes) else file_path_or_bytes
            with pdfplumber.open(stream) as pdf:
                for page_idx, page in enumerate(pdf.pages):
                    t = page.extract_text()
                    if t:
                        raw_text_parts.append(t)
                    words = page.extract_words()
                    for w in words:
                        word_positions.append({
                            "page": page_idx + 1,
                            "text": w.get("text", ""),
                            "x0": float(w.get("x0", 0)),
                            "x1": float(w.get("x1", 0)),
                            "top": float(w.get("top", 0)),
                            "bottom": float(w.get("bottom", 0)),
                            "width": float(w.get("width", 0)),
                            "height": float(w.get("height", 0))
                        })
            return "\n".join(raw_text_parts), word_positions
        except Exception:
            # Fallback if pdfplumber fails
            text = PDFExtractor.extract_text(file_path_or_bytes)
            return text, []

pdf_extractor = PDFExtractor()
