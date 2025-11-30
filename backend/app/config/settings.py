import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
DEBUG = os.getenv("DEBUG", "False") == "True"
ENV = os.getenv("ENV", "development")
