import requests
import logging
from typing import Optional, List
import os

logger = logging.getLogger(__name__)

# Hugging Face Inference API endpoint
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction"
HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

def encode_query(query: str) -> Optional[List[float]]:
    """Generate embedding using Hugging Face Inference API (no local model needed)"""
    try:
        # Get HF token dari environment
        hf_token = os.getenv("HUGGINGFACE_API_KEY")
        
        if not hf_token:
            logger.error("HUGGINGFACE_API_KEY not set in environment")
            return None
        
        headers = {"Authorization": f"Bearer {hf_token}"}
        payload = {"inputs": query}
        
        response = requests.post(
            f"{HF_API_URL}/{HF_MODEL}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            embedding = response.json()
            logger.info(f"Embedding generated successfully for query: {query[:50]}")
            return embedding
        else:
            logger.error(f"HF API error: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error("Timeout calling Hugging Face API")
        return None
    except Exception as e:
        logger.error(f"Error generating embedding via HF API: {e}")
        return None
