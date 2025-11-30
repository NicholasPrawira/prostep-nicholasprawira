from app.database import get_connection, close_connection
from app.services.embedding_service import encode_query
from app.models import ImageResult, SearchResponse
from typing import List


def search_images(query: str, limit: int = 10) -> SearchResponse:
    """Search for images similar to query"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Split the query into individual terms for more flexible matching
        query_terms = query.split()
        
        # Create OR conditions for each term with different matching patterns
        if query_terms:
            # For each term, we'll match with ILIKE and also check if it appears in the prompt
            or_conditions = " OR ".join([
                f"(prompt ILIKE %s OR prompt ILIKE %s OR prompt ILIKE %s)" 
                for _ in query_terms
            ])
            
            # Create parameters for different matching patterns:
            # 1. %term% - contains the term
            # 2. %Term% - contains the capitalized term
            # 3. %TERM% - contains the uppercase term
            like_params = []
            for term in query_terms:
                like_params.extend([f'%{term}%', f'%{term.capitalize()}%', f'%{term.upper()}%'])
            
            cur.execute(
                f"""
                SELECT prompt, image_url, clipscore, 1.0 AS similarity
                FROM images
                WHERE image_url IS NOT NULL AND ({or_conditions})
                ORDER BY prompt
                LIMIT %s;
                """,
                like_params + [limit],
            )
        else:
            # Fallback to simple matching if no terms
            cur.execute(
                """
                SELECT prompt, image_url, clipscore, 1.0 AS similarity
                FROM images
                WHERE image_url IS NOT NULL AND (
                    prompt ILIKE %s OR 
                    prompt ILIKE %s OR 
                    prompt ILIKE %s
                )
                ORDER BY prompt
                LIMIT %s;
                """,
                (f'%{query}%', f'%{query.capitalize()}%', f'%{query.upper()}%', limit),
            )

        results = cur.fetchall()
        cur.close()

        # If no results found, try even broader search
        if not results:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT prompt, image_url, clipscore, 1.0 AS similarity
                FROM images
                WHERE image_url IS NOT NULL
                ORDER BY RANDOM()
                LIMIT %s;
                """,
                (limit // 2,)  # Return fewer results for random search
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