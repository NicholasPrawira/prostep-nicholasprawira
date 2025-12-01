from groq import Groq
from app.config.settings import GROQ_API_KEY
from app.services.embedding_service import encode_query
from app.database import get_connection, close_connection
import logging

logger = logging.getLogger(__name__)

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set. Chat features will not work.")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def get_relevant_context(query_embedding, limit=3):
    """Retrieve relevant images from database using vector similarity"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Using cosine distance (<=>) for similarity search
        # Note: pgvector needs to be installed in the DB
        cur.execute("""
            SELECT ocr_text, caption, image_url, caption, id, 1 - (embedding <=> %s::vector) as similarity
            FROM visionimages
            ORDER BY embedding <=> %s::vector
            LIMIT %s
        """, (str(query_embedding), str(query_embedding), limit))
        
        results = cur.fetchall()
        return results
    except Exception as e:
        logger.error(f"Error retrieving context: {e}")
        return []
    finally:
        close_connection(conn)

import json

def generate_chat_response(role: str, message: str):
    """
    Generate chat response using RAG + Groq
    Yields chunks of text for streaming
    """
    if not client:
        yield "Error: Groq API key is not configured."
        return

    # 1. Generate embedding
    query_embedding = encode_query(message)
    if not query_embedding:
        yield "Maaf, terjadi kesalahan saat memproses pertanyaanmu."
        return

    # 2. Retrieve context
    results = get_relevant_context(query_embedding)
    
    context_text = ""
    found_images = []
    
    if results:
        # Check similarity threshold (e.g., 0.3)
        # result structure: (ocr_text, caption, image_url, prompt, id, similarity)
        valid_results = [r for r in results if r[5] > 0.3]
        
        if valid_results:
            for i, (ocr, caption, url, prompt, img_id, sim) in enumerate(valid_results):
                context_text += f"Image {i+1} (ID: {img_id}):\nOCR: {ocr}\nCaption: {caption}\nPrompt: {prompt}\n\n"
                found_images.append({
                    "type": "image",
                    "url": url,
                    "prompt": prompt,
                    "clipScore": 0.0 # Placeholder
                })
            
            # Send images first if found
            if found_images:
                yield f"###IMAGES###{json.dumps(found_images)}###END_IMAGES###"
        else:
            context_text = "No highly relevant images found."
    else:
        context_text = "No images found."

    # 3. Construct System Prompt
    role_instruction = ""
    if role.lower() == "guru":
        role_instruction = "Respond like a friendly teacher. Be concise. If images are provided, ask the user to pick one to learn more."
    else: # anak-anak
        role_instruction = "Respond like a fun friend. Keep it short and simple. If images are shown, ask 'Mau belajar yang mana?'"

    system_prompt = f"""
    You are 'Si Atang', a helpful AI assistant.
    
    ROLE: {role_instruction}
    
    CONTEXT:
    {context_text}
    
    INSTRUCTIONS:
    1. If images are found, tell the user you found some pictures and ask them to choose one. DO NOT explain them yet.
    2. If the user asks to explain a specific image (or if the context is very specific to one image they selected), explain it simply using the OCR and Caption.
    3. Keep answers SHORT and EASY to understand.
    4. If no images found, say "Maaf, Atang ga nemu gambarnya."
    """

    try:
        # User requested specific model and parameters
        # Note: 'openai/gpt-oss-20b' might need to be replaced with a valid Groq model ID like 'deepseek-r1-distill-llama-70b'
        # if the API returns an error.
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            reasoning_effort="medium",
            stream=True,
            stop=None,
        )

        for chunk in completion:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        yield f"Maaf, terjadi kesalahan pada AI: {str(e)}"
