from typing import List

class Chunker:
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        if not text or not text.strip():
            return []
        
        words = text.split()
        if len(words) <= chunk_size:
            return [" ".join(words)]
        
        chunks = []
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            if end == len(words):
                break
            start += (chunk_size - overlap)
        return chunks

chunker = Chunker()
