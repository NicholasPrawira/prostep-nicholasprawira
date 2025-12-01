from app.database import get_connection

def check_schema():
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check row count in visionimages
        cur.execute("SELECT COUNT(*) FROM visionimages;")
        count_vision = cur.fetchone()[0]
        print(f"FINAL_COUNT_VISION: {count_vision}")

        # Check row count in images
        cur.execute("SELECT COUNT(*) FROM images;")
        count_images = cur.fetchone()[0]
        print(f"FINAL_COUNT_IMAGES: {count_images}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_schema()
