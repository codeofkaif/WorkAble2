import os
from typing import Any

class TxtExtractor:
    @staticmethod
    def extract_text(file_path_or_bytes: Any) -> str:
        if isinstance(file_path_or_bytes, bytes):
            return file_path_or_bytes.decode("utf-8", errors="ignore")
        elif isinstance(file_path_or_bytes, str):
            # If it's an existing file path, read it; otherwise treat as raw text
            if len(file_path_or_bytes) < 500 and os.path.exists(file_path_or_bytes):
                try:
                    with open(file_path_or_bytes, "r", encoding="utf-8", errors="ignore") as f:
                        return f.read()
                except Exception:
                    pass
            return file_path_or_bytes
        return ""

txt_extractor = TxtExtractor()
