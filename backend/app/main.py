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


# Category mapping for better matching - more flexible approach
CATEGORY_MAPPING = {
    "Tanaman Pangan": ["tanaman", "pangan", "padi", "beras", "gandum", "jagung", "cabai", "tomat"],
    "Tanaman Buah": ["buah", "apel", "jeruk", "mangga", "pisang", "anggur", "durian", "rambutan"],
    "Hewan Ternak": ["ternak", "sapi", "kambing", "ayam", "bebek", "babi", "kuda", "kerbau"],
    "Hewan Liar": ["liar", "harimau", "singa", "gajah", "monyet", "burung", "ular", "buaya"],
    "Alat Pertanian": ["alat", "pertanian", "traktor", "cangkul", "arit", "garpu", "pacul", " bajak"],
    "Proses Menanam": ["menanam", "penanaman", "bibit", "pupuk", "sawah", "ladang", "bertanam", "musim"],
    "Lingkungan Desa": ["desa", "lingkungan", "pedesaan", "rumah", "jalan", "tetangga", "perkampungan", "wilayah"],
    "Sampah & Daur Ulang": ["sampah", "daur", "ulang", "botol", "kertas", "plastik", "kaleng", "kaca"],
    "Drum Industri": ["drum", "industri", "pabrik", "mesin", "bahan", "kimia", "minyak", "tangki"],
    "Keselamatan Anak": ["anak", "keselamatan", "aman", "bermain", "sekolah", "lindung", "keamanan", "pelindungan"],
    "Cuaca & Musim": ["cuaca", "musim", "hujan", "panas", "dingin", "angin", "gerimis", "mendung"],
    "Kegiatan Warga": ["warga", "kegiatan", "gotong", "royong", "acara", "peringatan", "pertemuan", "kerja"],
    "Transportasi Desa": ["transportasi", "desa", "mobil", "motor", "becak", "angkot", "ojek", "kendaraan"]
}

@app.get("/search", response_model=SearchResponse)
def search(q: str = Query(..., description="Image search query", min_length=1)):
    """Search for images by text description"""
    try:
        logger.info(f"Search query: {q}")
        
        # Check if query is a predefined category and enhance it
        enhanced_query = q
        if q in CATEGORY_MAPPING:
            # For categories, include related terms to improve matching
            related_terms = CATEGORY_MAPPING[q]
            enhanced_query = q + " " + " ".join(related_terms)
            logger.info(f"Enhanced category query: {enhanced_query}")
        
        result = search_images(enhanced_query, limit=8)  # Increase limit for better results
        logger.info(f"Found {len(result.results)} results")
        return result
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Tigaraksa Image Search API - Use /docs for documentation"}