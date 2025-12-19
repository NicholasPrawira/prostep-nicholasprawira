# Agent Component Documentation

## Overview

The **Agent** ("Si Atang") is an AI-powered educational chatbot component that serves as an interactive learning companion for students. It integrates with the PROSTEP (Pelatihan Sistem Pertanian Berkelanjutan) platform to provide personalized learning experiences through multi-modal interactions combining text chat and image-based learning.

### Purpose

The agent facilitates:
- **Personalized Conversations**: Adapts communication style based on selected persona (role)
- **Image-Based Learning**: Retrieves and explains relevant images within the context of learning topics
- **Streaming Responses**: Real-time chat responses for a natural conversation experience
- **Context-Aware Discussions**: Uses Retrieval-Augmented Generation (RAG) to provide informed answers

---

## Architecture

### Core Components

#### 1. **Chat Service** (`backend/app/services/chat_service.py`)
Handles the core logic of generating contextual responses with support for multiple interaction modes.

**Key Functions:**
- `generate_chat_response()`: Main generator function for streaming responses
- `get_relevant_context()`: Retrieves relevant images using vector similarity search

**Features:**
- **RAG (Retrieval-Augmented Generation)**: Combines user queries with database context
- **Multi-Modal Support**: Handles text-only and image-focused conversations
- **Streaming**: Yields response chunks for real-time display

#### 2. **Chat Router** (`backend/app/routers/chat.py`)
FastAPI endpoint that exposes the chat functionality.

**Endpoint:**
```
POST /api/chat
```

**Request Schema:**
```json
{
  "role": "string",           // "profesor", "kakak pintar", "teman baik", "sang penjelajah"
  "message": "string",        // User message
  "user_name": "string|null", // Optional: student name
  "selected_image": {         // Optional: selected image for context
    "prompt": "string",
    "caption": "string",
    "ocr_text": "string"
  }
}
```

#### 3. **Embedding Service** (`backend/app/services/embedding_service.py`)
Generates vector embeddings for semantic search capabilities.

**Key Functions:**
- `encode_query()`: Converts text queries to embeddings using Hugging Face API
- Uses `sentence-transformers/paraphrase-MiniLM-L6-v2` model (384-dimensional vectors)
- Caching with `@lru_cache` for performance optimization

---

## Role-Based Personalization

The agent adapts its communication style based on four distinct personas:

### 1. **Profesor** (Professor)
- **Style**: Structured, logical, warm, and authoritative
- **Tone**: Uses "According to Professor..." opening
- **Interaction**: Appreciates student responses, offers academic guidance
- **Emoji Usage**: Minimal, professional

### 2. **Kakak Pintar** (Smart Older Sibling)
- **Style**: Clear, casual, warm, emoji-rich 🌟
- **Tone**: Supportive like an admired older student
- **Interaction**: Practical explanations, uses trendy language
- **Response**: "Wah keren!", "Sip mantap!"

### 3. **Teman Baik** (Good Friend)
- **Style**: Cheerful, friendly, light, comfortable, lots of emoji 🎈
- **Tone**: Like a fun desk-mate
- **Interaction**: Reactive, expressive, validating feelings
- **Response**: "Wah aku juga suka!", "Keren banget!"

### 4. **Sang Penjelajah** (The Explorer)
- **Style**: Enthusiastic, detail-focused, adventure-oriented 🧭
- **Tone**: Like an adventure buddy discovering treasures
- **Interaction**: Engages user as exploration partner
- **Response**: "Ayo {name}, kita lihat sebelah sini!", "Penemuan bagus!"

---

## Operating Modes

### Mode 1: **Normal Discussion** (Default)
- No specific image selected
- General topic discussions
- Soft suggestion to search for images using `/gambar` command

**Example:**
```
User: "Bagaimana cara membuat kompos?"
Agent: "Wah, kompos itu penting banget {user_name}! Kamu bisa..."
```

### Mode 2: **Image Search Mode** (`/gambar <topic>`)
- Triggered by `/gambar` command
- Searches database for relevant images using vector similarity
- Returns up to 5 matching images
- Focuses conversation on selected image

**Example:**
```
User: "/gambar ayam"
Agent: "Kakak sudah carikan gambar ayam nih. {user_name} pilih satu ya, nanti Kakak jelaskan!"
[Images returned for selection]
```

### Mode 3: **Image Mode** (Active Image Selected)
- User has selected a specific image
- Agent focuses exclusively on discussing the selected image
- Strictly uses image context (caption, OCR text, topic)
- Flexible to related topics that connect to the image

**Key Rules:**
- Only discuss the selected image
- Validate user emotions before responding
- Allow related questions (e.g., "What does chicken eat?" when discussing chicken image)
- Reject only completely unrelated topics

**Example:**
```
User: "Keren! Aku mau makan ayam goreng!"
Agent: "Wah, aku juga mau banget! Kelihatannya enak ya! 😋 Menurutmu rasanya manis atau asam?"
```

---

## Configuration

### Required Environment Variables

#### Backend (`.env`)

```bash
# Groq API Configuration
GROQ_API_KEY=<your-groq-api-key>
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions

# Hugging Face Configuration (for embeddings)
HUGGINGFACE_API_KEY=<your-huggingface-api-token>

# Database Configuration
SUPABASE_DB_URL=postgresql://user:password@host:port/database

# Environment Settings
DEBUG=False
ENV=production
```

### LLM Configuration

**Model:** `openai/gpt-oss-120b` (via Groq API)

**Parameters:**
```python
{
  "temperature": 0.8,      # Balanced creativity & consistency
  "max_tokens": 500,       # Response length limit
  "top_p": 1,             # Full probability distribution
  "stream": True          # Streaming enabled for real-time responses
}
```

### Response Rules (Mandatory)

1. **Always personalize**: Address user by name
2. **Keep it concise**: Core answer in 1-3 sentences max
3. **Don't over-question**: Only ask when necessary
4. **Be conversational**: Sound natural, not robotic
5. **Use proper Indonesian**: Grammar and tone appropriate to role

---

## Database Integration

### Vector Search Process

1. **Query Encoding**:
   ```
   Input: "ayam dalam pertanian"
   Model: sentence-transformers/paraphrase-MiniLM-L6-v2
   Output: 384-dimensional vector
   ```

2. **Similarity Calculation**:
   ```sql
   SELECT ocr_text, caption, image_url, 1 - (embedding <=> query_vector) as similarity
   FROM visionimages
   ORDER BY embedding <=> query_vector
   LIMIT 5
   ```

3. **Filtering**:
   - Similarity threshold: > 0.25
   - Returns top 5 most relevant images

### Image Context Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `prompt` | Topic description | "Ayam Kampung di Sawah" |
| `caption` | Visual description | "Seekor ayam hitam berdiri di tepi sawah" |
| `ocr_text` | Text extracted from image | "Ayam Kampung 500g - Rp 45.000" |
| `image_url` | Image source URL | "https://..." |

---

## Frontend Integration

### ChatbotPanel Component (`frontend/src/components/chatbot/ChatbotPanel.tsx`)

**Features:**
- Role selection UI (4 persona buttons)
- Name input flow
- Real-time message streaming
- Image attachment display
- Drag-and-drop image upload support
- Auto-scroll to latest messages
- Image preview modal

**Communication Flow:**
```
User Input → State Update → POST /api/chat → Streaming Response
                                              → Display in Chat
```

### ChatbotButton Component (`frontend/src/components/chatbot/ChatbotButton.tsx`)

- Fixed button in bottom-right corner
- Animated tooltip: "Kalau kamu pusing, tanya Atang yuk 👋"
- Periodic animation trigger (every 10 seconds when closed)
- Toggle panel on/off

---

## Usage Examples

### Example 1: Normal Discussion

```
User: "Halo, aku Nicholas"
Agent: "Salam kenal, Nicholas! 👋\nSekarang, pilih teman belajarmu di bawah ini ya!"

[User selects: Kakak Pintar]

User: "Apa itu pupuk organik?"
Agent: "Pupuk organik itu berasal dari bahan-bahan alami kayak kompos, pupuk kandang, atau sisa pertanian, Nicholas! Bermanfaat banget buat kesehatan tanah. Kalau mau lihat lewat gambar, ketik /gambar pupuk organik ya!"
```

### Example 2: Image Search & Selection

```
User: "/gambar padi"
Agent: "Profesor sudah menemukan beberapa gambar terkait padi. Silakan Nicholas pilih yang paling menarik."
[Returns 5 rice/padi images]

[User clicks on one image]

User: "Wow, indah sekali!"
Agent: "Benar sekali, Nicholas! Padi dalam keadaan menguning seperti ini menunjukkan bahwa sudah siap untuk dipanen..."
```

### Example 3: Image-Focused Conversation

```
[Image selected: Sustainable Farming]

User: "Bagaimana cara menjaga tanah tetap subur?"
Agent: "Nah, kalau dilihat dari gambar ini, Nicholas bisa mulai dari..."
```

---

## Error Handling

### Common Error Scenarios

| Scenario | Response |
|----------|----------|
| API timeout | "Maaf, Atang lagi pusing sedikit. Coba lagi nanti ya!" |
| Invalid role | HTTP 400 - "Invalid role. Must be one of: ..." |
| No Groq API key | "Error: Groq API key is not configured." |
| No images found | "Wah, koleksi Atang belum ada gambar itu. {user_name} mau coba topik lain?" |
| Embedding service down | Falls back to keyword-based search |

### Logging

All operations logged to `app/utils/logger.py`:
- Chat request/response
- API errors
- Embedding generation
- Database queries

---

## Performance Optimization

### Caching Strategy

1. **Query Embedding Cache**: `@lru_cache(maxsize=128)`
   - Caches embeddings for repeated queries
   - Reduces Hugging Face API calls

2. **Vector Index**: `IVFFLAT` index on database
   - Optimizes similarity search queries
   - O(1) lookup time complexity

### Response Streaming

- Yields response chunks immediately
- Progressive rendering in frontend
- Better perceived performance

---

## Limitations & Future Enhancements

### Current Limitations
- Responses limited to 500 tokens max
- Vector search radius: 0.25 similarity threshold
- Image context retrieved sequentially

### Potential Enhancements
- Multi-turn conversation memory (save chat history)
- Fine-tuned models for specific educational contexts
- Voice input/output support
- Real-time collaborative discussions
- Assessment and progress tracking
- Multi-language support (beyond Indonesian)

---

## Troubleshooting

### Agent Responses Are Too Short
- **Cause**: `max_tokens` set to 500
- **Fix**: Adjust in `chat_service.py` line 224

### No Images Appearing
- **Cause**: Low similarity threshold or empty database
- **Fix**: Check database connection and image embeddings

### Streaming Stops Mid-Response
- **Cause**: API timeout (default 60s)
- **Fix**: Increase timeout value in `chat_service.py` line 229

### Wrong Role Behavior
- **Cause**: Typo in role name (case-sensitive in validation)
- **Fix**: Use exact names: "profesor", "kakak pintar", "teman baik", "sang penjelajah"

---

## API Reference

### POST `/api/chat`

**Description**: Generate a chat response from the agent

**Request Body**:
```json
{
  "role": "kakak pintar",
  "message": "Apa itu pertanian berkelanjutan?",
  "user_name": "Nicholas",
  "selected_image": null
}
```

**Response** (Streaming):
```
Pertanian berkelanjutan itu berarti cara bertani yang...
```

**Status Codes**:
- `200`: Success (streaming response)
- `400`: Invalid role
- `500`: Server error

---

## Related Documentation

- [API Documentation](./documentation/API.md) - Full API endpoints
- [Architecture Overview](./documentation/ARCHITECTURE.md) - System design
- [Setup Guide](./documentation/SETUP.md) - Installation instructions
- [Deployment Guide](./documentation/DEPLOYMENT.md) - Production deployment

---

## Support & Contribution

For issues, questions, or improvements related to the agent component:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review error logs in backend
3. Verify environment variables are properly configured
4. Test with different roles to isolate persona-specific issues
