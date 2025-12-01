import sys
import os
from dotenv import load_dotenv
import psycopg2

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.config.settings import SUPABASE_DB_URL

def check_db():
    print("Connecting to DB...")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    cur = conn.cursor()
    
    # 1. Count total rows
    cur.execute("SELECT COUNT(*) FROM visionimages")
    count = cur.fetchone()[0]
    print(f"Total rows in visionimages: {count}")
    
    # 2. Count rows with non-null embeddings
    cur.execute("SELECT COUNT(*) FROM visionimages WHERE embedding IS NOT NULL")
    emb_count = cur.fetchone()[0]
    print(f"Rows with embeddings: {emb_count}")
    
    # 3. Check embedding dimension of first row
    if emb_count > 0:
        cur.execute("SELECT vector_dims(embedding) FROM visionimages LIMIT 1")
        dims = cur.fetchone()[0]
        print(f"Embedding dimensions: {dims}")
    
    conn.close()

if __name__ == "__main__":
    check_db()
