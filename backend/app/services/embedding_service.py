import logging
from typing import Optional, List
import os
from functools import lru_cache
from huggingface_hub import InferenceClient

logger = logging.getLogger(__name__)

# Hugging Face Model for embeddings
HF_MODEL = "sentence-transformers/paraphrase-MiniLM-L6-v2"

@lru_cache(maxsize=128)
def encode_query(query: str) -> Optional[List[float]]:
    """Generate embedding using Hugging Face InferenceClient"""
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    
    if not hf_token:
        logger.error("HUGGINGFACE_API_KEY not set in environment")
        return None
    
    try:
        # Initialize InferenceClient with token parameter (NOT api_key)
        client = InferenceClient(token=hf_token)
        
        # Feature extraction returns embeddings directly
        embedding = client.feature_extraction(
            text=query,
            model=HF_MODEL
        )
        
        logger.info(f"Embedding generated successfully for query: {query[:50]}")
        return embedding
        
    except Exception as e:
        logger.error(f"Error generating embedding via HF: {e}")
        return None