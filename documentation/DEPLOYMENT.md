# Deployment Guide

## Overview

This guide covers deploying Tigaraksa Image Search to production using:
- **Frontend**: Vercel
- **Backend**: Vercel Functions or Railway.app
- **Database**: Supabase (already managed)

---

## Prerequisites

1. GitHub account with repo uploaded
2. Vercel account (vercel.com)
3. Railway account (railway.app) - optional if using Vercel Functions
4. Supabase account with database configured

---

## Deployment Option 1: Both on Vercel (Recommended)

### Step 1: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. **Framework Preset**: Select "Next.js"
6. **Build Command**: `cd frontend && npm run build`
7. **Output Directory**: `frontend/.next`
8. **Environment Variables**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-domain.vercel.app`
9. Click "Deploy"

### Step 2: Deploy Backend to Vercel Functions

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" again (or select existing)
3. Import same repository
4. **Root Directory**: `backend/`
5. **Framework**: Leave as "Other"
6. **Build Command**: Leave empty
7. **Output Directory**: Leave empty
8. **Environment Variables**:
   - Key: `SUPABASE_DB_URL`
   - Value: Your Supabase connection string
9. Click "Deploy"

### Step 3: Update Frontend Environment

After backend deployment, Vercel will give you a domain (e.g., `https://api-abc123.vercel.app`)

1. Go to frontend project settings
2. Update environment variable:
   - `NEXT_PUBLIC_API_URL` = Your backend Vercel domain
3. Redeploy frontend

---

## Deployment Option 2: Frontend on Vercel + Backend on Railway

### Frontend Deployment (Same as Option 1)

See steps above.

### Backend Deployment on Railway

#### Step 1: Setup Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up / Log in
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository

#### Step 2: Configure Railway

1. Railway auto-detects `Procfile`
2. Add environment variables:
   - `SUPABASE_DB_URL`: Your PostgreSQL connection string
   - `DEBUG`: `false`
   - `ENV`: `production`
3. Click "Deploy"

#### Step 3: Get Domain

1. Once deployed, go to "Settings"
2. Copy your Railway domain (e.g., `https://tigaraksa-api.railway.app`)
3. Update frontend environment variable `NEXT_PUBLIC_API_URL` to this domain

#### Step 4: Monitor

1. Check logs in Railway dashboard
2. Test API: `https://tigaraksa-api.railway.app/health`

---

## Verification Checklist

After deployment:

- [ ] Frontend loads at `https://your-frontend-domain.vercel.app`
- [ ] Backend health check: `https://your-backend-domain/health`
- [ ] Search works end-to-end
- [ ] Images display correctly
- [ ] Download button works
- [ ] No CORS errors in browser console
- [ ] Environment variables are set correctly

---

## Troubleshooting

### Frontend Issues

**Error**: "Failed to fetch from API"
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend is running and accessible
- Check browser console for CORS errors

**Error**: "Build failed"
- Ensure `package.json` exists in frontend folder
- Check build command in Vercel settings
- Run `npm run build` locally to test

### Backend Issues

**Error**: "Internal Server Error" on `/search`
- Check `SUPABASE_DB_URL` is set correctly
- Verify database connection works: `psql $SUPABASE_DB_URL`
- Check backend logs in Vercel/Railway dashboard

**Error**: "No similar images found"
- Ensure data is loaded in database
- Check if `images` table exists and has data
- Verify embedding vectors are stored correctly

### CORS Issues

**Error**: "Access to fetch has been blocked by CORS policy"
- Backend has `CORSMiddleware` enabled (should work)
- Check if frontend domain is in allowed origins

---

## Environment Variables Summary

### Frontend

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
```

### Backend

```
SUPABASE_DB_URL=postgresql://user:password@db.supabase.co:5432/postgres
DEBUG=false
ENV=production
```

---

## Database Setup

### Supabase Connection

1. Go to your Supabase project
2. Settings → Database → Connection string
3. Copy "URI" format
4. Use as `SUPABASE_DB_URL`

### Verify Database

```bash
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM images;"
```

Should return number of images in database.

---

## Performance Optimization

1. **Enable pgvector indexing** in Supabase:
   ```sql
   CREATE INDEX ON images USING ivfflat (embedding vector_cosine_ops)
     WITH (lists = 100);
   ```

2. **Cache embedding model** - Already done in backend (loads once)

3. **Add CDN for images** - Consider Cloudflare or similar

---

## Monitoring

### Vercel Analytics

1. Go to project settings
2. Enable "Web Analytics"
3. Monitor performance metrics

### Logs

- **Frontend**: Vercel Logs tab
- **Backend**: Vercel/Railway Logs tab

---

## Scaling Considerations

- **Increase Railway resources** if backend is slow
- **Add Vercel Pro** for better performance
- **Implement caching** for frequent queries
- **Database**: Supabase auto-scales, consider paid plan for higher limits

---

## Rollback

If something breaks:

1. Vercel: Click "Deployments" → Select previous version → "Redeploy"
2. Railway: Same process in dashboard

---

## Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- FastAPI Docs: https://fastapi.tiangolo.com
- Supabase Docs: https://supabase.com/docs
