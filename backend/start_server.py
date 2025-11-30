#!/usr/bin/env python3
"""
Startup script for the Tigaraksa Image Search API backend.
This script ensures the application runs with the correct module path.
"""

import os
import sys
import subprocess

def main():
    # Change to the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Run uvicorn with the correct module path
    try:
        subprocess.run([
            "uvicorn", 
            "app.main:app", 
            "--host", "127.0.0.1", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()