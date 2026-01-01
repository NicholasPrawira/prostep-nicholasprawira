from app.database import get_connection, close_connection
from app.services.embedding_service import encode_query
from app.models import ImageResult, SearchResponse
from typing import List


def search_images(query: str, limit: int = 10) -> SearchResponse:
    """Search for images similar to query with improved accuracy"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Clean and normalize the query
        query = query.strip()
        if not query:
            return SearchResponse(query=query, results=[])

        # Split the query into individual terms
        query_terms = [term.strip() for term in query.split() if term.strip()]
        
        if not query_terms:
            return SearchResponse(query=query, results=[])

        # Build search with priority:
        # 1. Exact phrase match (highest priority)
        # 2. All terms present (AND logic) - each term must appear
        # 3. Use word boundary patterns for better accuracy
        
        exact_phrase = f'%{query}%'
        
        # Build AND conditions - all terms must be present in the prompt
        # For each term, check if it appears as a word (with spaces or at boundaries)
        and_conditions = []
        params = []
        
        for term in query_terms:
            # Patterns to match the term as a complete word:
            # - Space before and after: " term " (word in middle)
            # - At start with space after: "term " (word at start)
            # - At end with space before: " term" (word at end)
            # - Exact match: "term" (whole string)
            # - Simple contains: "%term%" (fallback for flexibility)
            term_patterns = [
                f'% {term} %',    # word in middle: " ayam "
                f'{term} %',      # at start: "ayam "
                f'% {term}',      # at end: " ayam"
                f'{term}',        # exact: "ayam"
                f'%{term}%',       # contains anywhere (fallback)
            ]
            
            # Build OR condition for this term
            term_condition = " OR ".join(["prompt ILIKE %s" for _ in term_patterns])
            and_conditions.append(f"({term_condition})")
            params.extend(term_patterns)
        
        # Combine all AND conditions
        where_clause = " AND ".join(and_conditions)
        
        # Execute query with priority ordering
        # Priority: exact phrase match first, then by number of matching terms
        cur.execute(
            f"""
            SELECT prompt, image_url, clipscore,
                   CASE 
                       WHEN prompt ILIKE %s THEN 1.0
                       ELSE 0.9
                   END AS similarity
            FROM images
            WHERE image_url IS NOT NULL AND ({where_clause})
            ORDER BY 
                CASE WHEN prompt ILIKE %s THEN 1 ELSE 2 END,
                prompt
            LIMIT %s;
            """,
            [exact_phrase] + params + [exact_phrase, limit],
        )
        
        results = cur.fetchall()
        cur.close()

        # If no results with AND logic, try with exact phrase only
        if not results:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT prompt, image_url, clipscore, 1.0 AS similarity
                FROM images
                WHERE image_url IS NOT NULL AND prompt ILIKE %s
                ORDER BY prompt
                LIMIT %s;
                """,
                (exact_phrase, limit),
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