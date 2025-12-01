import sys
import os
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.services.chat_service import generate_chat_response

def test_stream():
    print("Testing chat stream...")
    # Simulate a query that should return images
    query = "hewan liar" 
    role = "Guru"
    
    try:
        for chunk in generate_chat_response(role, query):
            print(f"CHUNK: {chunk}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_stream()
