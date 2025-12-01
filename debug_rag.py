import sys
import os
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.services.embedding_service import encode_query
from app.services.chat_service import get_relevant_context

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

def debug_rag():
    queries = ["buah naga", "hewan", "pemandangan", "orang"]
    
    with open("debug_output.txt", "w", encoding="utf-8") as f:
        f.write("--- Debugging RAG Retrieval ---\n")
        
        for query in queries:
            f.write(f"\nQuery: '{query}'\n")
            print(f"Processing query: {query}")
            
            # 1. Test Embedding
            embedding = encode_query(query)
            if not embedding:
                f.write("Error: Failed to generate embedding.\n")
                continue
            f.write(f"Embedding generated (len: {len(embedding)})\n")
            
            # 2. Test Retrieval
            # limit=5, no threshold arg
            try:
                results = get_relevant_context(embedding, limit=5)
                
                if not results:
                    f.write("No results returned from DB.\n")
                else:
                    f.write(f"Found {len(results)} results:\n")
                    for i, res in enumerate(results):
                        # res structure: (ocr_text, caption, image_url, prompt, id, similarity)
                        similarity = res[5]
                        prompt = res[3]
                        img_id = res[4]
                        pass_threshold = "PASS" if similarity > 0.3 else "FAIL"
                        f.write(f"  {i+1}. ID: {img_id} | Sim: {similarity:.4f} ({pass_threshold}) | Prompt: {prompt}\n")
            except Exception as e:
                f.write(f"Exception during retrieval: {e}\n")

if __name__ == "__main__":
    debug_rag()
