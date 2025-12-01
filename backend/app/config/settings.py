import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEBUG = os.getenv("DEBUG", "False") == "True"
ENV = os.getenv("ENV", "development")
