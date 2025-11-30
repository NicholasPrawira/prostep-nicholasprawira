from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services import search_images
from app.services.search_service import search_images  # Keep existing import
from app.models import HealthResponse, SearchResponse
from app.utils import logger
from app.database import get_connection, close_connection
from app.models.search import ImageResult

app = FastAPI(
    title="Tigaraksa Image Search API",
    description="AI-powered image search using semantic similarity",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    logger.info("Health check called")
    return HealthResponse(status="API is running")


@app.get("/images", response_model=SearchResponse)
def get_all_images():
    """Fetch all images from the database"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Fetch all images from the database
        cur.execute("""
            SELECT prompt, image_url, clipscore, 0.0 as similarity
            FROM images
            WHERE image_url IS NOT NULL
            ORDER BY prompt
        """)
        
        results = cur.fetchall()
        cur.close()
        
        image_results = [
            ImageResult(
                prompt=r[0],
                image_url=r[1],
                clipscore=float(r[2]) if r[2] is not None else 0.0,
                similarity=float(r[3]),
            )
            for r in results
        ]
        
        return SearchResponse(query="all_images", results=image_results)
        
    except Exception as e:
        logger.error(f"Error fetching all images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        close_connection(conn)


@app.get("/search", response_model=SearchResponse)
def search(q: str = Query(..., description="Image search query", min_length=1)):
    """Search for images by text description"""
    try:
        logger.info(f"Search query: {q}")
        result = search_images(q)
        logger.info(f"Found {len(result.results)} results")
        return result
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Tigaraksa Image Search API - Use /docs for documentation"}
