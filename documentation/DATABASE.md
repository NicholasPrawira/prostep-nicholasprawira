# Database Schema & Documentation

## Overview

Database menggunakan PostgreSQL dengan extension `pgvector` untuk vector similarity search.

---

## Table: `images`

### Schema

```sql
CREATE TABLE IF NOT EXISTS images (
  id BIGSERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL UNIQUE,
  embedding VECTOR(384) NOT NULL,
  clipscore FLOAT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-increment |
| `prompt` | TEXT | Original image description/caption |
| `image_url` | TEXT | URL to the image file |
| `embedding` | VECTOR(384) | AI embedding of the prompt (384 dimensions) |
| `clipscore` | FLOAT | CLIP model quality score (0-1) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

## Indexes

### Vector Index (for fast similarity search)

```sql
CREATE INDEX idx_images_embedding ON images 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Purpose**: Speed up `ORDER BY embedding <=> vector` queries

**Type**: IVFFLAT (Inverted File Flat)

**Lists**: 100 (balance between speed & accuracy)

### Text Index (optional, for full-text search)

```sql
CREATE INDEX idx_images_prompt_gin ON images 
USING GIN (to_tsvector('english', prompt));
```

**Purpose**: Optional, for keyword search in prompts

---

## Sample Data

### Query to View Sample Data

```sql
SELECT 
  id,
  prompt,
  image_url,
  clipscore,
  embedding::text as embedding_preview,
  created_at
FROM images
LIMIT 5;
```

### Example Row

```
id: 1
prompt: "Anak-anak sedang belajar di kelas dengan guru memberikan pelajaran"
image_url: "https://example.com/image1.jpg"
clipscore: 0.334
embedding: "[0.234, -0.156, 0.892, ..., 0.123]" (384 values)
created_at: 2024-11-30 10:00:00
```

---

## Vector Details

### Embedding Model

- **Model**: `all-MiniLM-L6-v2` (Sentence Transformers)
- **Dimensions**: 384
- **Purpose**: Convert text (prompts) to semantic vectors

### Vector Similarity

- **Metric**: Cosine Similarity
- **Distance Operator**: `<=>` (pgvector cosine distance)
- **Range**: 0.0 (identical) to 2.0 (opposite)
- **Conversion**: `similarity = 1 - distance`

### Example Vector Search

```sql
-- Find top 5 images similar to query
SELECT 
  prompt,
  image_url,
  clipscore,
  1 - (embedding <=> '[query_vector_384_dims]'::vector) AS similarity
FROM images
ORDER BY embedding <=> '[query_vector_384_dims]'::vector
LIMIT 5;
```

---

## CLIPScore

- **Range**: 0.0 - 1.0
- **Meaning**: How well the image matches its prompt
- **Source**: CLIP model evaluation (pre-computed)
- **Usage**: Display alongside similarity for quality assessment

---

## Queries

### Count Total Images

```sql
SELECT COUNT(*) as total_images FROM images;
```

### Check Vector Health

```sql
SELECT 
  COUNT(*) as total,
  COUNT(NULLIF(embedding, NULL)) as with_embeddings,
  COUNT(NULLIF(clipscore, NULL)) as with_clipscore
FROM images;
```

### Find Images by Similar Prompt

```sql
SELECT 
  prompt,
  clipscore,
  1 - (embedding <=> (
    SELECT embedding FROM images WHERE id = 1
  )::vector) AS similarity
FROM images
WHERE id != 1
ORDER BY similarity DESC
LIMIT 10;
```

### Bulk Update

```sql
UPDATE images 
SET updated_at = CURRENT_TIMESTAMP 
WHERE id > 0;
```

### Delete by ID

```sql
DELETE FROM images WHERE id = 123;
```

---

## Performance

### Vector Search Speed

- **With index**: ~10-50ms (typical)
- **Without index**: ~1-5s (full table scan)

### Optimization Tips

1. **Keep IVFFLAT index tuned**:
   ```sql
   REINDEX INDEX idx_images_embedding;
   ```

2. **Vacuum regularly**:
   ```sql
   VACUUM ANALYZE images;
   ```

3. **Monitor table size**:
   ```sql
   SELECT 
     pg_size_pretty(pg_total_relation_size('images')) as size;
   ```

---

## Backup & Recovery

### Backup Database

```bash
pg_dump $SUPABASE_DB_URL > backup.sql
```

### Restore from Backup

```bash
psql $SUPABASE_DB_URL < backup.sql
```

---

## Connection

### Via Supabase Dashboard

1. Go to Supabase Project
2. Settings → Database → Connection String
3. Choose "URI" format
4. Use in backend `.env`:
   ```
   SUPABASE_DB_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### Test Connection

```bash
psql $SUPABASE_DB_URL -c "SELECT version();"
```

---

## Extensions Required

The database must have these extensions enabled:

```sql
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For full-text search
```

---

## Data Types

### VECTOR(384)

- Stores 384-dimensional vectors
- Used for semantic embeddings
- Supports distance operations: `<=>`, `<->`, `<#>`

### TEXT

- Unlimited text storage
- Used for prompts and URLs
- Can be indexed with GIN for full-text search

---

## Future Enhancements

1. **Add user feedback table** - Track which results were helpful
2. **Add search history** - Store queries for analytics
3. **Add rating table** - User ratings on images
4. **Add cache table** - Cache frequent search results
5. **Add batch operations** - Bulk insert/update vectors

---

## Contact

For database issues or questions, refer to:
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- pgvector GitHub: https://github.com/pgvector/pgvector
