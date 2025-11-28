# Tigaraksa Image Search - Full Stack Application

AI-powered image search application that allows users to search for images based on text descriptions using semantic search technology.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [📁 Project Structure](#-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [🔌 API Endpoints](#-api-endpoints)
- [📝 Environment Configuration](#-environment-configuration)
- [📊 Features](#-features)
- [🎯 How It Works](#-how-it-works)
- [🔄 CLIPScore Evaluation Pipeline](#-clipscore-evaluation-pipeline)
- [👥 Team](#-team)

## Project Overview

This application enables users to search for images using natural language descriptions. It leverages AI embeddings and vector similarity search to find the most relevant images based on semantic meaning rather than keyword matching.

The system consists of:
- A FastAPI backend that handles image search requests
- A Next.js frontend with a clean, responsive UI
- PostgreSQL with pgvector extension for storing image embeddings
- CLIPScore evaluation pipeline for measuring image-text similarity

## 📁 Project Structure

```
Skripsi/Code - Bab IV/
├── server.py                 # FastAPI backend server
├── evaluation.py             # CLIPScore evaluation pipeline
├── requirements.txt          # Python dependencies
├── .env                      # Backend environment variables
├── .env.template             # Template for backend environment variables
├── README.md                 # CLIPScore evaluation documentation
├── README_FULLSTACK.md       # Full-stack project documentation
├── README_COMPLETE.md        # This file
└── frontend/                 # Next.js frontend application
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx      # Main page component
    │   │   ├── layout.tsx    # Root layout component
    │   │   └── globals.css   # Global styles
    │   └── components/
    │       ├── SearchForm.tsx # Search form and results display
    │       └── ResultsGrid.tsx # Results grid component
    ├── package.json          # Frontend dependencies
    ├── next.config.js        # Next.js configuration
    ├── tailwind.config.ts    # Tailwind CSS configuration
    ├── postcss.config.js     # PostCSS configuration
    ├── .env.local            # Frontend environment variables
    └── tsconfig.json         # TypeScript configuration
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Sentence Transformers** - AI embeddings for semantic search
- **PostgreSQL + pgvector** - Database with vector similarity search
- **Psycopg2** - PostgreSQL adapter for Python
- **Uvicorn** - ASGI server for FastAPI

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - Promise-based HTTP client

### CLIPScore Evaluation
- **Transformers (Hugging Face)** - CLIP model for image-text similarity
- **PyTorch** - Machine learning framework
- **Supabase** - Cloud database and storage
- **Pillow** - Python Imaging Library

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm 8+
- PostgreSQL with pgvector extension
- Supabase account (for database and storage)

### Backend Setup

1. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows
   .\.venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Copy `.env.template` to `.env`
   - Fill in your Supabase database URL

4. Run the backend server:
   ```bash
   uvicorn server:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment:
   - Create `.env.local` file
   - Set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`

4. Run the development server:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:3000`

## 🔌 API Endpoints

- `GET /health` - Health check endpoint
- `GET /search?q=<query>` - Search for images by text description

Example search request:
```bash
curl "http://127.0.0.1:8000/search?q=beautiful+sunset+over+mountains"
```

Response format:
```json
{
  "query": "beautiful sunset over mountains",
  "results": [
    {
      "prompt": "A breathtaking sunset painting with vibrant orange and pink colors",
      "image_url": "https://your-supabase-url.com/storage/v1/object/public/images/image1.jpg",
      "clipscore": 0.324,
      "similarity": 0.872
    }
  ]
}
```

## 📝 Environment Configuration

### Backend (.env)
```env
SUPABASE_DB_URL=postgresql://username:password@host:port/database
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 📊 Features

✅ **AI-powered semantic search** - Find images based on meaning, not just keywords  
✅ **Image search by text description** - Describe what you're looking for in natural language  
✅ **Similarity scoring** - See how closely images match your query  
✅ **CLIPScore evaluation** - Measure image-text alignment quality  
✅ **CORS enabled** - Secure cross-origin requests  
✅ **Real-time API responses** - Fast search results  
✅ **Responsive UI design** - Works on desktop and mobile devices  
✅ **Error handling & validation** - Graceful error management  

## 🎯 How It Works

1. User enters an image description in the UI
2. Frontend sends the query to the backend API
3. Backend generates embeddings using Sentence Transformers
4. Vector similarity search is performed in PostgreSQL using pgvector
5. Top 5 most relevant results are returned
6. Frontend displays images along with similarity scores

## 🔄 CLIPScore Evaluation Pipeline

The `evaluation.py` script computes CLIP-based similarity (CLIPScore) between stored images and their prompts, then writes scores to a Supabase table.

### How it works:
- Fetches image rows from the `images` table
- Creates signed URLs from Supabase Storage
- Downloads images and computes CLIP similarity against the prompt
- Inserts results into the `clip_scores` table

### Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key (keep secret)
- `SUPABASE_BUCKET` - Storage bucket name (default: `images`)

### Running the evaluator:
```bash
python evaluation.py
```

### Notes:
- Uses the `openai/clip-vit-base-patch32` model from Hugging Face
- Automatically uses GPU if available (CUDA-enabled PyTorch)
- First run may take time to download the model

## 👥 Team

Developed as part of a thesis project at Universitas Multimedia Nusantara.

---
**Status:** ✅ Ready for development & deployment