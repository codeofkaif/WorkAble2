import logging
from typing import List, Optional
import httpx
import numpy as np
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingClient:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.VOYAGE_API_KEY
        self.model = model or settings.VOYAGE_MODEL

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key:
            logger.warning("No VOYAGE_API_KEY provided; generating deterministic mock embeddings")
            # Generate deterministic pseudo-embedding based on hash for testing
            mock_embeddings = []
            for t in texts:
                np.random.seed(abs(hash(t)) % (2**32))
                vec = np.random.randn(128).tolist()
                mock_embeddings.append(vec)
            return mock_embeddings

        url = "https://api.voyageai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "input": texts
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return [item["embedding"] for item in data["data"]]

    async def get_embedding(self, text: str) -> List[float]:
        results = await self.get_embeddings([text])
        return results[0]

embedding_client = EmbeddingClient()
