# Tigaraksa Image Search - Skripsi

Sistem pencarian gambar berbasis semantik menggunakan AI embeddings dan vector similarity search.

## 🎯 Fitur Utama

- **Semantic Image Search**: Cari gambar berdasarkan deskripsi teks
- **AI-Powered**: Menggunakan Sentence Transformers untuk embedding
- **Vector Database**: PostgreSQL + pgvector untuk similarity search
- **User-Friendly UI**: Next.js frontend dengan Tailwind CSS
- **Production Ready**: Modular architecture, deployment configs included

## 🏗️ Arsitektur

```
┌─────────────────┐
│  Next.js 14 UI  │  (React + TypeScript + Tailwind)
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  FastAPI        │  (Python + Pydantic)
└────────┬────────┘
         │ psycopg2
         ↓
┌─────────────────┐
│  PostgreSQL     │  (pgvector, Supabase)
│  + pgvector     │
└─────────────────┘
```

**AI Model**: `all-MiniLM-L6-v2` (384-dimensional embeddings)

## 🚀 Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Create .env with SUPABASE_DB_URL
echo 'SUPABASE_DB_URL=your_connection_string' > .env

uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Environment Variables

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```
SUPABASE_DB_URL=postgresql://user:pass@host:5432/database
DEBUG=True
ENV=development
```

## 📁 Project Structure

```
├── frontend/              # Next.js 14 App Router
│   ├── src/
│   │   ├── app/          # Pages & layouts
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks (useSearch)
│   │   └── lib/          # Utilities (API client, types, constants)
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/              # FastAPI + Python
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── models/       # Pydantic schemas
│   │   ├── services/     # Business logic (search, embedding)
│   │   ├── database/     # PostgreSQL connection
│   │   ├── config/       # Settings & env vars
│   │   └── utils/        # Logger
│   ├── requirements.txt
│   ├── Procfile          # Railway/Heroku config
│   ├── runtime.txt       # Python version
│   ├── wsgi.py           # Vercel serverless entry
│   └── .env.example
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # System design
│   ├── API.md            # Endpoint documentation
│   ├── DEPLOYMENT.md     # Deploy to Vercel/Railway
│   ├── SETUP.md          # Local development
│   └── DATABASE.md       # Schema & queries
│
├── vercel.json           # Vercel frontend config
└── README.md
```

## 🔍 How It Works

### Search Flow

1. User enters query: *"anak-anak di sekolah"*
2. Frontend sends GET `/search?q=anak-anak%20di%20sekolah`
3. Backend:
   - Encodes query to 384-dim vector using Sentence Transformers
   - Queries DB: `ORDER BY embedding <=> query_vector LIMIT 5`
   - Calculates similarity: `1 - cosine_distance`
   - Returns results with prompt, image_url, clipscore, similarity
4. Frontend displays top 5 results with metrics
5. User can preview, download, or save images

### Vector Similarity

```
Query Vector: [0.234, -0.156, 0.892, ..., 0.123]  (384 dims)
                            ↓
                  Cosine Distance
                            ↓
Image Embeddings in Database
                            ↓
Top 5 Similar Results (sorted by distance)
```

## 📊 API Endpoints

### `GET /health`
Check if API is running.

### `GET /search?q=<query>`
Search images by text query.

**Response**:
```json
{
  "query": "anak-anak di sekolah",
  "results": [
    {
      "prompt": "Anak-anak sedang belajar di kelas...",
      "image_url": "https://example.com/image.jpg",
      "clipscore": 0.334,
      "similarity": 0.540
    }
  ]
}
```

See `docs/API.md` for full documentation.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| AI Model | Sentence Transformers (all-MiniLM-L6-v2) |
| Database | PostgreSQL + pgvector (Supabase) |
| Deployment | Vercel (frontend), Railway/Vercel (backend) |

## 📈 Performance

- **Search latency**: ~100-200ms (cached model)
- **Vector indexing**: IVFFLAT (fast similarity search)
- **Max results**: 5 per query (configurable)
- **Embedding dimensions**: 384
- **Database**: Managed Supabase (auto-scaling)

## 🚢 Deployment

### Option 1: Vercel + Vercel Functions
- Frontend: Vercel
- Backend: Vercel Functions
- Database: Supabase

### Option 2: Vercel + Railway
- Frontend: Vercel
- Backend: Railway.app
- Database: Supabase

See `docs/DEPLOYMENT.md` for step-by-step guide.

## 📖 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design & data flow
- **[API.md](docs/API.md)** - Endpoint documentation with examples
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deploy to production
- **[SETUP.md](docs/SETUP.md)** - Local development setup
- **[DATABASE.md](docs/DATABASE.md)** - Schema, queries, indexing

## 🧪 Testing

### Test Frontend → Backend

```bash
# In browser console at http://localhost:3000
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test Search

```bash
curl "http://localhost:8000/search?q=anak-anak"
```

## 🔒 Security

- Environment variables for sensitive data
- CORS middleware enabled
- Pydantic input validation
- Parameterized SQL queries (no injection)
- No direct DB access from frontend

## 📝 Notes

- Database must have `pgvector` extension enabled
- Embedding model auto-loads on first search (takes ~10s)
- Subsequent searches are cached and fast (~100-200ms)
- CLIP score is pre-computed and stored in DB

## 🤝 Contributing

Structure follows best practices:
- Modular backend (services, models, database layers)
- TypeScript frontend with path aliases
- Comprehensive documentation
- Production-ready deployment configs

## 📞 Support

For issues or questions:
- Frontend: See `docs/SETUP.md`
- Backend: Check `docs/API.md`
- Deployment: Refer to `docs/DEPLOYMENT.md`
- Database: Review `docs/DATABASE.md`
- Architecture: Read `docs/ARCHITECTURE.md`

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sentence Transformers](https://www.sbert.net)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

**Created for Skripsi (Thesis) - Tigaraksa Image Search System**

Last Updated: 2024-11-30
