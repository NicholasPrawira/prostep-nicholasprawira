from app.database import get_connection, close_connection
from app.services.embedding_service import encode_query
from app.models import ImageResult, SearchResponse
from typing import List


def search_images(query: str, limit: int = 5) -> SearchResponse:
    """Search for images similar to query"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        query_emb = encode_query(query)

        cur.execute(
            """
            SELECT prompt, image_url, clipscore, 1 - (embedding <=> %s::vector) AS similarity
            FROM images
            WHERE image_url IS NOT NULL
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
            """,
            (query_emb, query_emb, limit),
        )

        results = cur.fetchall()
        cur.close()

        if not results:
            return SearchResponse(query=query, results=[])

        image_results = [
            ImageResult(
                prompt=r[0],
                image_url=r[1],
                clipscore=float(r[2]) if r[2] is not None else 0.0,
                similarity=round(float(r[3]), 3),
            )
            for r in results
        ]

        return SearchResponse(query=query, results=image_results)

    finally:
        close_connection(conn)
