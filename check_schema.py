import sys
import os
from dotenv import load_dotenv
import psycopg2

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.config.settings import SUPABASE_DB_URL

def check_schema():
    sys.stdout.reconfigure(encoding='utf-8')
    conn = psycopg2.connect(SUPABASE_DB_URL)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'visionimages'
    """)
    columns = cur.fetchall()
    
    for col in columns:
        print(col[0])
    
    conn.close()

if __name__ == "__main__":
    check_schema()
