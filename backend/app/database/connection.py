import psycopg2
from app.config import SUPABASE_DB_URL


def get_connection():
    """Get a new database connection"""
    if not SUPABASE_DB_URL:
        raise ValueError("SUPABASE_DB_URL environment variable is not set")
    return psycopg2.connect(SUPABASE_DB_URL)


def close_connection(conn):
    """Close database connection"""
    if conn:
        conn.close()
