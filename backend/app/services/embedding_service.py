import logging
from typing import Optional, List
import os
from functools import lru_cache
import requests

logger = logging.getLogger(__name__)

# New Hugging Face router endpoint
HF_API_URL = "https://router.huggingface.co/models/sentence-transformers/paraphrase-MiniLM-L6-v2"
HF_TIMEOUT = 30

@lru_cache(maxsize=128)
def encode_query(query: str) -> Optional[List[float]]:
    """Generate embedding using Hugging Face router API"""
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    
    if not hf_token:
        logger.error("HUGGINGFACE_API_KEY not set in environment")
        return None
    
    try:
        headers = {"Authorization": f"Bearer {hf_token}"}
        payload = {"inputs": query}
        
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json=payload,
            timeout=HF_TIMEOUT
        )
        
        if response.status_code == 200:
            embedding = response.json()
            logger.info(f"Embedding generated successfully for query: {query[:50]}")
            return embedding
        else:
            logger.error(f"HF API error: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error(f"Timeout calling Hugging Face API")
        return None
        
    except Exception as e:
        logger.error(f"Error generating embedding via HF: {e}")
        return None