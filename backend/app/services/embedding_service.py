import logging
from typing import Optional, List
from functools import lru_cache
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Initialize sentence transformer model (cached in memory)
_model = None

def get_model():
    """Load and cache the sentence transformer model"""
    global _model
    if _model is None:
        try:
            logger.info("Loading sentence-transformers model: paraphrase-MiniLM-L6-v2")
            _model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading sentence transformer model: {e}")
            raise
    return _model

@lru_cache(maxsize=128)
def encode_query(query: str) -> Optional[List[float]]:
    """Generate embedding using local sentence-transformers model"""
    try:
        model = get_model()
        embedding = model.encode(query).tolist()
        logger.info(f"Embedding generated successfully for query: {query[:50]}")
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None