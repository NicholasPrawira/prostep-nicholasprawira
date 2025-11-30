# Local Setup Guide

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- PostgreSQL client (for database verification)
- Git

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Access at: `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows**:
```bash
venv\Scripts\activate
```

**macOS/Linux**:
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create `.env` File

```
SUPABASE_DB_URL=postgresql://user:password@db.supabase.co:5432/postgres
DEBUG=True
ENV=development
```

Get your actual connection string from Supabase dashboard.

### 5. Verify Database Connection

```bash
python
```

```python
from app.database import get_connection
conn = get_connection()
print("Database connected successfully!")
conn.close()
```

### 6. Run Development Server

```bash
uvicorn app.main:app --reload
```

Access Swagger UI at: `http://localhost:8000/docs`

---

## Testing

### Test Frontend → Backend Connection

**In browser console** (at `http://localhost:3000`):

```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected output: `{status: "API is running"}`

### Test Search Endpoint

```bash
curl "http://localhost:8000/search?q=anak-anak"
```

---

## Database Verification

### Check Data Exists

```bash
psql $SUPABASE_DB_URL
```

```sql
SELECT COUNT(*) FROM images;
SELECT prompt, clipscore FROM images LIMIT 5;
```

### Check Vector Dimension

```sql
SELECT embedding FROM images LIMIT 1;
```

Should show vector with 384 dimensions.

---

## Project Structure

```
.
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── Procfile
│   └── wsgi.py
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── DEPLOYMENT.md
```

---

## Common Issues

### Frontend Error: "Cannot find module 'react'"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Backend Error: "No module named 'fastapi'"

```bash
pip install -r requirements.txt
```

### Database Error: "psycopg2 connection refused"

- Check `SUPABASE_DB_URL` is correct
- Verify database is accessible
- Test: `psql $SUPABASE_DB_URL -c "SELECT 1;"`

### Port Already in Use

**Frontend (3000)**:
```bash
npm run dev -- -p 3001
```

**Backend (8000)**:
```bash
uvicorn app.main:app --port 8001
```

---

## Development Workflow

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. **Terminal 2** - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Browser**: Open `http://localhost:3000`

---

## Available Scripts

### Frontend

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run linter
```

### Backend

```bash
uvicorn app.main:app --reload      # Development
python -m pytest                    # Run tests (if configured)
```

---

## Next Steps

1. Start both servers (frontend + backend)
2. Test search functionality
3. Verify images display correctly
4. Check console for any errors
5. When ready, deploy to Vercel + Railway

See `DEPLOYMENT.md` for production deployment.

---

## Quick Commands

```bash
# Install all dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Start development
# Terminal 1:
cd backend && uvicorn app.main:app --reload

# Terminal 2:
cd frontend && npm run dev

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
# API: http://localhost:8000/search?q=test
```
