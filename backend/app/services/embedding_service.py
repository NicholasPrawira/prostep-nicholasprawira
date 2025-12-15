import logging
from typing import Optional, List
from functools import lru_cache
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Load sentence-transformers model locally
try:
    model = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L6-v2')
    logger.info("Sentence-transformers model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load sentence-transformers model: {e}")
    model = None

@lru_cache(maxsize=128)
def encode_query(query: str) -> Optional[List[float]]:
    """Generate embedding using local sentence-transformers model"""
    if model is None:
        logger.error("Sentence-transformers model not loaded")
        return None
    
    try:
        # Generate embedding using the local model
        embedding = model.encode(query, convert_to_tensor=False).tolist()
        logger.info(f"Embedding generated successfully for query: {query[:50]}")
        return embedding
        
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None