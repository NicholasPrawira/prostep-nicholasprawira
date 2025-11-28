from fastapi import FastAPI, Query, HTTPException
from sentence_transformers import SentenceTransformer
import psycopg2
import numpy as np
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_conn():
    return psycopg2.connect(SUPABASE_DB_URL)

app = FastAPI(title="Tigaraksa Image Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "✅ API is running"}

@app.get("/images")
def get_all_images():
    try:
        conn = get_conn()
        cur = conn.cursor()

        # Fetch ALL images for initial display
        cur.execute("""
            SELECT prompt, image_url, clipscore
            FROM images
            WHERE image_url IS NOT NULL
            ORDER BY id DESC;
        """)

        results = cur.fetchall()
        cur.close()
        conn.close()

        return {
            "query": "initial_load",
            "results": [
                {
                    "prompt": r[0],
                    "image_url": r[1],
                    "clipscore": float(r[2]) if r[2] is not None else 0.0,
                    "similarity": 0.0 # No similarity score for random images
                }
                for r in results
            ],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
def search(q: str = Query(..., description="Cari gambar berdasarkan deskripsi")):
    try:
        conn = get_conn()
        cur = conn.cursor()

        query_emb = model.encode([q])[0].tolist()

        cur.execute("""
            SELECT prompt, image_url, clipscore, 1 - (embedding <=> %s::vector) AS similarity
            FROM images
            WHERE image_url IS NOT NULL
            ORDER BY embedding <=> %s::vector
            LIMIT 5;
        """, (query_emb, query_emb))

        results = cur.fetchall()
        cur.close()
        conn.close()

        if not results:
            raise HTTPException(status_code=404, detail="No similar images found.")

        return {
            "query": q,
            "results": [
                {
                    "prompt": r[0],
                    "image_url": r[1],
                    "clipscore": float(r[2]) if r[2] is not None else 0.0,
                    "similarity": round(float(r[3]), 3)
                }
                for r in results
            ],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# Run -> uvicorn server:app --reload

