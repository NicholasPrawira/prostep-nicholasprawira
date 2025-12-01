from app.database import get_connection

def check_images_schema():
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check columns in images
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'images';
        """)
        columns = cur.fetchall()
        print("Columns in images:", columns)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_images_schema()
