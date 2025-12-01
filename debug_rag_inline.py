import sys
import os
from dotenv import load_dotenv
import psycopg2
import logging

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.config.settings import SUPABASE_DB_URL
from app.services.embedding_service import encode_query

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug_rag_inline():
    with open("debug_inline_log.txt", "w", encoding="utf-8") as f:
        f.write("--- Debugging RAG Inline ---\n")
        query = "buah naga"
        f.write(f"Query: '{query}'\n")
        
        # 1. Generate Embedding
        try:
            embedding = encode_query(query)
            f.write(f"Embedding generated (len: {len(embedding)})\n")
        except Exception as e:
            f.write(f"Error generating embedding: {e}\n")
            return

        # 2. DB Retrieval
        conn = None
        try:
            f.write("Connecting to DB...\n")
            conn = psycopg2.connect(SUPABASE_DB_URL)
            cur = conn.cursor()
            
            f.write("Executing SQL query...\n")
            # Explicitly cast to vector
            sql = """
                SELECT id, caption, 1 - (embedding <=> %s::vector) as similarity
                FROM visionimages
                ORDER BY embedding <=> %s::vector
                LIMIT 5
            """
            # Convert embedding list to string format for PGVector
            embedding_str = str(embedding)
            
            cur.execute(sql, (embedding_str, embedding_str))
            results = cur.fetchall()
            
            if not results:
                f.write("No results found (fetchall returned empty).\n")
            else:
                f.write(f"Found {len(results)} results:\n")
                for res in results:
                    f.write(f"  ID: {res[0]} | Sim: {res[2]:.4f} | Prompt: {res[1]}\n")
                    
        except Exception as e:
            f.write(f"CRITICAL DB ERROR: {e}\n")
            import traceback
            traceback.print_exc(file=f)
        finally:
            if conn:
                conn.close()
                f.write("DB Connection closed.\n")

if __name__ == "__main__":
    debug_rag_inline()
