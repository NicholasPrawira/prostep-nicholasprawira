import logging

logger = logging.getLogger(__name__)

# Lazy-load model (avoid loading at app startup)
_model = None

def get_model():
    """Load embedding model on demand (lazy loading)"""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    return _model

def encode_query(query: str):
    """Generate embedding for the query using all-MiniLM-L6-v2"""
    try:
        model = get_model()
        # Generate embedding
        embedding = model.encode(query)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None
