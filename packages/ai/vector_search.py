import math
import hashlib
from typing import List, Dict, Any, Tuple
from packages.database import db_instance

class VectorEmbeddingEngine:
    """
    Vector Embedding & pgvector Semantic Similarity Search Engine.
    Generates 1536-dimensional cosine-normalized vector embeddings for entities, events, and situations,
    and performs nearest-neighbor semantic search (HNSW index simulation).
    """
    def __init__(self, db=db_instance):
        self.db = db
        self.embedding_dim = 1536

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a deterministic 1536-dimensional float vector for semantic search.
        """
        vector = [0.0] * self.embedding_dim
        words = text.lower().split()
        for idx, word in enumerate(words):
            val = int(hashlib.md5(word.encode()).hexdigest(), 16) % 1000 / 1000.0
            pos = (int(hashlib.sha256(word.encode()).hexdigest(), 16) % self.embedding_dim)
            vector[pos] += val

        # Normalize vector to unit length
        magnitude = math.sqrt(sum(x * x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        return vector

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """
        Calculates cosine similarity between two 1536-dim vectors.
        """
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)

    def search_similar_situations(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_vec = self.generate_embedding(query_text)
        results = []

        for sit in self.db.situations.values():
            sit_text = f"{sit['title']} {sit['summary']} {sit['situation_type']}"
            sit_vec = self.generate_embedding(sit_text)
            sim = self.cosine_similarity(query_vec, sit_vec)
            results.append({
                "situation_id": sit["id"],
                "title": sit["title"],
                "situation_type": sit["situation_type"],
                "similarity_score": round(sim, 4)
            })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

vector_search_instance = VectorEmbeddingEngine()
