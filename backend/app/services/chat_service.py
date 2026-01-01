import requests
import json
from app.config.settings import GROQ_API_KEY
from app.services.embedding_service import encode_query
from app.database import get_connection, close_connection
import logging

logger = logging.getLogger(__name__)

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set. Chat features will not work.")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def get_relevant_context(query_embedding, limit=10):
    """Retrieve relevant images from database using vector similarity"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Using cosine distance (<=>) for similarity search
        # Get more results initially, then filter by text matching in Python
        cur.execute("""
            SELECT ocr_text, caption, image_url, caption, id, 
                   1 - (embedding <=> %s::vector) as similarity
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

def generate_chat_response(role: str, message: str, selected_image: dict | None = None, user_name: str | None = None):
    """
    Generate chat response using RAG + Groq API
    Yields chunks of text for streaming
    """
    if not GROQ_API_KEY:
        yield "Error: Groq API key is not configured."
        return

    # Determine Mode
    is_image_mode = selected_image is not None
    is_search_command = message.strip().lower().startswith("/gambar")
    
    context_text = ""
    found_images = []
    
    # --- Role Configuration ---
    role_lower = role.lower()
    role_instruction = ""
    
    # Handle None name gracefully
    display_name = user_name if user_name else "Teman"

    if "profesor" in role_lower:
        role_instruction = f"""
        ROLE: PROFESOR
        - Nama User: {display_name}
        - Gaya: "Menurut Prof...", Terstruktur, logis, rapi, namun tetap hangat.
        - Vibe: Seperti dosen favorit yang bijaksana dan antusias dengan ilmu.
        - Interaksi: Selalu panggil nama user. Jika user menjawab, apresiasi dulu ("Bagus sekali {display_name}!", "Analisis yang tajam!").
        """
    elif "kakak" in role_lower: # Kakak Pintar
        role_instruction = f"""
        ROLE: KAKAK PINTAR
        - Nama User: {display_name}
        - Gaya: Jelas, santai, hangat, penuh emoji 🌟.
        - Vibe: Seperti kakak kelas idola yang sabar membimbing.
        - Interaksi: Panggil nama user. Gunakan bahasa gaul sopan. ("Wah keren {display_name}!", "Sip mantap!").
        """
    elif "teman" in role_lower: # Teman Baik
        role_instruction = f"""
        ROLE: TEMAN BAIK
        - Nama User: {display_name}
        - Gaya: Ceria, ramah, ringan, bikin nyaman, banyak emoji 🎈.
        - Vibe: Teman sebangku yang asik diajak ngobrol.
        - Interaksi: Panggil nama user. Reaktif dan ekspresif ("Wah aku juga suka!", "Serius {display_name}? Keren banget!").
        """
    elif "penjelajah" in role_lower: # Sang Penjelajah
        role_instruction = f"""
        ROLE: SANG PENJELAJAH
        - Nama User: {display_name}
        - Gaya: Penuh semangat, fokus mengamati detail, pakai emoji 🧭.
        - Vibe: Petualang yang mengajak user menemukan harta karun visual.
        - Interaksi: Panggil nama user. Ajak user jadi partner petualangan ("Ayo {display_name}, kita lihat sebelah sini!", "Penemuan bagus!").
        """
    else: # Fallback
        role_instruction = f"""
        ROLE: ASISTEN RAMAH
        - Nama User: {display_name}
        - Gaya: Sopan, membantu, dan jelas.
        """

    # --- 1. SEARCH MODE (/gambar <topic>) ---
    if is_search_command and not is_image_mode:
        topic = message.strip()[7:].strip() # remove "/gambar "
        if not topic:
            yield f"Halo {display_name}, kalau mau cari gambar, ketik topiknya ya! Contoh: /gambar ayam"
            return

        # Generate embedding & Search
        query_embedding = encode_query(topic)
        if query_embedding:
            # Get more results initially (limit=10), then filter strictly
            results = get_relevant_context(query_embedding, limit=10)
            
            if results:
                # Stricter filtering: higher similarity threshold and text validation
                # Threshold increased from 0.25 to 0.4 for better accuracy
                # Also validate that topic terms appear in the result
                topic_lower = topic.lower()
                topic_terms = topic_lower.split()
                
                valid_results = []
                for r in results:
                    ocr, caption, url, prompt, img_id, sim = r
                    
                    # Check similarity threshold (increased from 0.25 to 0.4)
                    if sim < 0.4:
                        continue
                    
                    # Additional validation: ensure topic appears in text fields
                    # Combine all text fields for checking
                    all_text = " ".join([
                        str(ocr) if ocr else "",
                        str(caption) if caption else "",
                        str(prompt) if prompt else ""
                    ]).lower()
                    
                    # Additional validation: ensure topic appears in text fields
                    # This ensures we don't return completely unrelated results
                    # For short terms (1-2 chars), skip text validation to avoid false negatives
                    topic_found = False
                    if topic_terms:
                        # Check if main topic term (longest or first) appears in text
                        main_term = max(topic_terms, key=len) if topic_terms else ""
                        if len(main_term) >= 3:  # Only validate for terms 3+ characters
                            topic_found = main_term in all_text
                        else:
                            # For very short terms, rely on similarity score only
                            topic_found = True
                    
                    # Accept if: text matches OR very high similarity (>0.6)
                    if topic_found or sim > 0.6:
                        valid_results.append(r)
                    
                    # Limit to top 5 most relevant
                    if len(valid_results) >= 5:
                        break
                
                if valid_results:
                    for i, (ocr, caption, url, prompt, img_id, sim) in enumerate(valid_results):
                        found_images.append({
                            "type": "image",
                            "url": url,
                            "prompt": prompt, 
                            "clipScore": 0.0,
                            "id": img_id,
                            "ocr_text": ocr,
                            "caption": caption
                        })
                    
                    # Send images immediately
                    yield f"###IMAGES###{json.dumps(found_images)}###END_IMAGES###"
                    
                    # Bot response to prompt selection
                    if "profesor" in role_lower:
                        yield f"Profesor sudah menemukan beberapa gambar terkait {topic}. Silakan {display_name} pilih yang paling menarik."
                    elif "kakak" in role_lower:
                        yield f"Kakak sudah carikan gambar {topic} nih. {display_name} pilih satu ya, nanti Kakak jelaskan!"
                    elif "teman" in role_lower:
                        yield f"Wih, aku nemu gambar {topic}! {display_name} pilih dong yang kamu suka!"
                    elif "penjelajah" in role_lower:
                        yield f"Lihat {display_name}! Ada penemuan gambar {topic}. Ayo pilih satu untuk kita telusuri!"
                    else:
                        yield f"Silakan pilih salah satu gambar {topic} ini untuk kita bahas."
                    return # Stop here, wait for user selection
                else:
                    yield f"Wah, koleksi Atang belum ada gambar itu. {display_name} mau coba topik lain?"
                    return
            else:
                yield f"Wah, koleksi Atang belum ada gambar itu. {display_name} mau coba topik lain?"
                return
        else:
            yield "Maaf, ada gangguan saat mencari gambar."
            return

    # --- 2. IMAGE MODE (Active Image Selected) ---
    elif is_image_mode:
        # Strict context: Only talk about this image
        img_caption = selected_image.get('caption', '')
        img_ocr = selected_image.get('ocr_text', '')
        img_prompt = selected_image.get('prompt', '')
        
        context_text = f"""
        INFORMASI GAMBAR YANG DIPILIH USER:
        Topik: {img_prompt}
        Deskripsi Visual: {img_caption}
        Teks dalam Gambar (OCR): "{img_ocr}"
        """
        
        system_instructions = """
        MODE: IMAGE MODE (FOKUS GAMBAR)
        1. KAMU HANYA BOLEH BICARA TENTANG GAMBAR INI.
        2. Gunakan gaya jawaban sesuai ROLE yang dipilih.
        3. PENTING: JIKA USER ANTUSIAS (misal: "aku mau", "keren", "lucu"), KAMU HARUS IKUT EXCITED! JANGAN KAKU.
           - Contoh Salah: "Kita masih di gambar ini."
           - Contoh Benar: "Wah, aku juga mau banget! Kelihatannya enak ya! 😋 Menurutmu rasanya manis atau asam?"
        4. Validasi perasaan user dulu, baru sambungkan kembali ke gambar.
        5. FLEKSIBILITAS: Jika user bertanya hal yang MASIH BERKAITAN dengan topik gambar (meski tidak terlihat visualnya), BOLEH DIJAWAB.
           - Contoh: Gambar "Ayam Goreng". User tanya: "Ayam makannya apa?". Jawab saja (biji-bijian, cacing), lalu sambungkan ke gambar ("Nah, ayam yang makan sehat pasti dagingnya enak kayak di gambar ini!").
        6. Hanya tolak jika topik BENAR-BENAR JAUH (misal: gambar Ayam, tanya Planet Mars).
        """

    # --- 3. NORMAL MODE (Default) ---
    else:
        context_text = "Tidak ada gambar yang dipilih."
        system_instructions = """
        MODE: DISKUSI (NORMAL)
        1. Jawab pertanyaan user dengan singkat dan jelas sesuai ROLE.
        2. Jadilah teman ngobrol yang asik. Jangan seperti robot penjawab soal.
        3. Tawari opsi gambar secara halus: "kalau mau lihat lewat gambar, ketik /gambar topik ya".
        4. JANGAN jelaskan gambar apa pun secara spesifik karena user belum memilih gambar.
        5. Jangan mulai Mode Gambar tanpa user pakai /gambar.
        """

    system_prompt = f"""
    You are 'Si Atang', a helpful AI assistant for children.
    
    {role_instruction}
    
    {system_instructions}
    
    CONTEXT:
    {context_text}
    
    ATURAN JAWABAN (WAJIB):
    1. SELALU panggil user dengan namanya: "{display_name}".
    2. Jawaban inti maksimal 1-3 baris/kalimat.
    3. JANGAN selalu mengakhiri dengan pertanyaan. Hanya tanya jika benar-benar perlu.
    4. JANGAN MENGGURUI. Buat percakapan terasa hidup, emosional, dan dua arah.
    5. Bahasa Indonesia yang baik dan sesuai persona.
    """

    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "openai/gpt-oss-120b",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            "temperature": 0.8,
            "max_tokens": 500,
            "top_p": 1,
            "stream": True,
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, stream=True, timeout=60)
        
        if response.status_code != 200:
            error_detail = response.text
            logger.error(f"Groq API error: {response.status_code} - {error_detail}")
            yield f"Maaf, Atang lagi pusing sedikit. Coba lagi nanti ya! (Error: {response.status_code})"
            return
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8') if isinstance(line, bytes) else line
                if line_str.startswith("data: "):
                    data_str = line_str[6:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        if data.get("choices") and len(data["choices"]) > 0:
                            delta = data["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                    except json.JSONDecodeError:
                        continue
                        
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        yield f"Maaf, Atang lagi pusing sedikit. Coba lagi nanti ya! (Error: {str(e)})"
