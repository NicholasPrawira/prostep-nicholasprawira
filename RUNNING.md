# Running the Tigaraksa Image Search Application

## Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database with pgvector extension (for Supabase)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to add your Supabase database connection string.

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file:
   ```
   echo NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 > .env.local
   ```

## Running the Application

### Option 1: Using the Batch Script (Windows)
Double-click on `start_dev.bat` to start both servers automatically.

### Option 2: Manual Start

1. Start the backend server:
   ```
   cd backend
   python start_server.py
   ```
   Or alternatively:
   ```
   cd backend
   uvicorn app.main:app --reload
   ```

2. In a new terminal, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

### Option 3: Using Procfile (for deployment)
The backend can also be started using the Procfile:
```
cd backend
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000
- Backend API Documentation: http://127.0.0.1:8000/docs

## Troubleshooting

### Colors Not Showing in UI
If custom colors like `umn-blue` are not showing, ensure that:
1. The Tailwind configuration includes the custom color definitions
2. The frontend has been rebuilt after any configuration changes:
   ```
   cd frontend
   npm run build
   ```

### Backend Startup Error
If you encounter the error "Could not import module 'server'", make sure to:
1. Run the application from the correct directory (backend)
2. Use the correct module path: `app.main:app`
3. Use the provided startup script: `python start_server.py`