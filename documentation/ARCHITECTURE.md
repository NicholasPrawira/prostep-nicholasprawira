# Arsitektur Sistem Tigaraksa Image Search

## Gambaran Umum

Aplikasi ini terdiri dari tiga komponen utama yang terintegrasi:

1. **Frontend** (Next.js 14 + React)
2. **Backend** (FastAPI + Python)
3. **Database** (PostgreSQL + pgvector + Supabase)

## Arsitektur Tingkat Tinggi

```
User Browser
    ↓
Next.js Frontend (React UI)
    ↓ HTTP Request (fetch)
FastAPI Backend
    ↓
PostgreSQL Database (Supabase)
    ↓
Return Top 5 Results (JSON)
    ↓
Display in Frontend
```

## Komponen Utama

### Frontend (Next.js 14 - App Router)

**Lokasi**: `frontend/`

```
src/
├── app/                  # App Router pages & layouts
├── components/           # Reusable React components
├── hooks/               # Custom React hooks (useSearch, useFetch)
├── lib/                 # Utilities (api client, constants, types, utils)
└── public/              # Static assets
```

**Teknologi**:
- Next.js 14 (Server Components + Client Components)
- React 18
- TypeScript
- Tailwind CSS
- Fetch API untuk HTTP requests

**Key Files**:
- `src/lib/api.ts` - API client untuk komunikasi dengan backend
- `src/hooks/useSearch.ts` - Custom hook untuk logic search
- `src/lib/constants.ts` - Environment variables, endpoint URLs
- `src/lib/types.ts` - TypeScript interfaces

### Backend (FastAPI)

**Lokasi**: `backend/`

```
app/
├── main.py              # FastAPI app initialization
├── models/              # Pydantic models (request/response)
├── services/            # Business logic (search, embedding)
├── database/            # Database connection & queries
├── config/              # Environment & settings
└── utils/               # Utilities (logger)
```

**Teknologi**:
- FastAPI (Python web framework)
- Sentence Transformers (AI embedding model)
- psycopg2 (PostgreSQL driver)
- Pydantic (data validation)

**Endpoints**:
- `GET /health` - Health check
- `GET /search?q=<query>` - Search images

### Database (PostgreSQL + pgvector)

**Provider**: Supabase (managed PostgreSQL)

**Schema**:
```sql
CREATE TABLE images (
  id BIGSERIAL PRIMARY KEY,
  prompt TEXT,
  image_url TEXT,
  embedding VECTOR(384),      -- 384-dimensional vector
  clipscore FLOAT,
  created_at TIMESTAMP
);

CREATE INDEX ON images USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

## Data Flow

### Search Process

1. **User Input** → User ketik query di search bar
2. **Frontend Request** → `fetch(/search?q=...)`
3. **Backend Processing**:
   - Decode query menjadi vector (SentenceTransformer)
   - Query database: `ORDER BY embedding <=> query_vector`
   - Hitung similarity: `1 - distance`
4. **Return Results** → JSON dengan 5 gambar teratas
5. **Frontend Display** → Render grid dengan metrics

### Vector Search Algorithm

```
1. Query Encoding
   Input: "anak-anak di sekolah"
   Model: all-MiniLM-L6-v2 (384 dimensions)
   Output: [0.234, -0.156, 0.892, ...]

2. Cosine Distance
   Compute: cos_distance(query_vector, image_vector)
   Result: 0.0 (identical) - 1.0 (completely different)

3. Similarity Conversion
   Similarity = 1 - distance
   Result: 0.0 (not similar) - 1.0 (very similar)

4. Top K Selection
   Order by distance ASC
   LIMIT 5
```

## Deployment Architecture

### Option 1: Both on Vercel

```
Frontend: Vercel (Next.js deployment)
Backend: Vercel Functions (Python runtime)
Database: Supabase (Cloud PostgreSQL)

Flow:
  Browser → Vercel (frontend) → Vercel Functions (backend) → Supabase
```

### Option 2: Frontend on Vercel, Backend on Railway

```
Frontend: Vercel
Backend: Railway.app (persistent Python server)
Database: Supabase

Flow:
  Browser → Vercel → Railway → Supabase
```

## Environment Variables

### Frontend (`.env.local` / `.env.production`)

```
NEXT_PUBLIC_API_URL=<backend-url>
```

### Backend (`.env`)

```
SUPABASE_DB_URL=postgresql://user:pass@host/database
DEBUG=False
ENV=production
```

## File Structure Summary

```
skripsi-tigaraksa/
├── frontend/              # Next.js 14 application
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       └── lib/          # Utilities & API
│
├── backend/              # FastAPI application
│   └── app/
│       ├── main.py       # FastAPI app
│       ├── models/       # Pydantic models
│       ├── services/     # Business logic
│       ├── database/     # DB connection
│       └── config/       # Settings
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
│
└── vercel.json          # Vercel deployment config
```

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js + React + TypeScript | UI & UX |
| Backend | FastAPI + Python | API & Business Logic |
| AI Model | Sentence Transformers | Text → Vector |
| Database | PostgreSQL + pgvector | Vector Storage & Search |
| Hosting | Vercel + Supabase | Cloud Infrastructure |

## Performance Considerations

- **Vector Search**: O(1) with proper indexing (IVFFLAT)
- **Embedding Model**: Cached in memory after first load
- **CORS**: Enabled for frontend-backend communication
- **Caching**: Can add Redis for frequently searched queries

## Security Best Practices

- Environment variables for sensitive data (DB URLs)
- CORS middleware for allowed origins
- Input validation (Pydantic models)
- Error handling (HTTP exceptions)
- No direct SQL exposure (parameterized queries)
