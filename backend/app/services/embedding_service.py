from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

# Initialize model once (singleton pattern effectively due to module caching)
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("Embedding model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load embedding model: {e}")
    model = None

def encode_query(query: str):
    """Generate embedding for the query using all-MiniLM-L6-v2"""
    if not model:
        logger.error("Embedding model is not initialized")
        return None
    
    try:
        # Generate embedding
        embedding = model.encode(query)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None
