from app.database import get_connection

def check_schema():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT current_user;")
        db_user = cur.fetchone()[0]
        print(f"Connected as user: {db_user}")

        # Check DB Host (masked)
        from app.config import SUPABASE_DB_URL
        host = SUPABASE_DB_URL.split('@')[1].split(':')[0] if '@' in SUPABASE_DB_URL else "Unknown"
        print(f"Connected to DB Host: {host}")

        # List all tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """)
        tables = cur.fetchall()
        print("Tables in public schema:", [t[0] for t in tables])

        # Check columns in visionimages
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'visionimages';
        """)
        columns = cur.fetchall()
        print("Columns:", columns)

        # Check row count in visionimages
        cur.execute("SELECT COUNT(*) FROM visionimages;")
        count_vision = cur.fetchone()[0]
        print(f"Total rows in visionimages: {count_vision}")

        cur.execute("SELECT COUNT(*) FROM visionimages WHERE embedding IS NOT NULL;")
        count_embeddings = cur.fetchone()[0]
        print(f"Rows with embeddings in visionimages: {count_embeddings}")

        # Check ID range
        cur.execute("SELECT MIN(id), MAX(id) FROM visionimages;")
        min_id, max_id = cur.fetchone()
        print(f"ID Range in visionimages: {min_id} - {max_id}")

        # Check row count in images (main search table)
        try:
            cur.execute("SELECT COUNT(*) FROM images;")
            count_images = cur.fetchone()[0]
            print(f"Total rows in images: {count_images}")
        except Exception as e:
            print(f"Table 'images' check failed: {e}")
            conn.rollback()

        # Check a sample embedding to see dimension
        cur.execute("SELECT embedding, ocr_text, caption FROM visionimages LIMIT 1;")
        result = cur.fetchone()
        if result:
            embedding = result[0]
            ocr_text = result[1]
            caption = result[2]
            
            print(f"Sample OCR: {ocr_text[:100]}..." if ocr_text else "Sample OCR: None")
            print(f"Sample Caption: {caption[:100]}..." if caption else "Sample Caption: None")

            if embedding:
                # It might be returned as a string or list depending on the driver
                # print(f"Embedding type: {type(embedding)}")
                if isinstance(embedding, str):
                    # Parse string '[...]'
                    dim = len(embedding.strip('[]').split(','))
                    print(f"Embedding dimension: {dim}")
                elif isinstance(embedding, list):
                    print(f"Embedding dimension: {len(embedding)}")
        else:
            print("No embedding found or table empty")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_schema()
