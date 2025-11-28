print("Script started...")

import os, io, sys, torch, requests
from PIL import Image
from tqdm import tqdm
from transformers import CLIPProcessor, CLIPModel
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Debug: Print environment variables
print("Loading environment variables...")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jsoibvywhhizdxhrbrtl.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "images")

print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_SERVICE_KEY present: {SUPABASE_SERVICE_KEY is not None}")
print(f"SUPABASE_BUCKET: {SUPABASE_BUCKET}")

supabase = None

device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name).to(device)
processor = CLIPProcessor.from_pretrained(model_name)


def get_images_to_evaluate(limit=100):
    print("Fetching images to evaluate...")
    res = supabase.table("images").select("*").limit(limit).execute()
    print(f"Found {len(res.data or [])} images")
    return res.data or []


def get_signed_url(path, expires_in=3600):
    res = supabase.storage().from_(SUPABASE_BUCKET).create_signed_url(path, expires_in)
    return res.get("signedURL") or res.get("signed_url")


def download_image(url):
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content)).convert("RGB")


def compute_clip_score(prompt, pil_img):
    inputs = processor(text=[prompt], images=pil_img, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        out = model(**inputs)
        img_emb = out.image_embeds / out.image_embeds.norm(p=2, dim=-1, keepdim=True)
        txt_emb = out.text_embeds / out.text_embeds.norm(p=2, dim=-1, keepdim=True)
        return float((img_emb * txt_emb).sum(dim=-1).cpu().item())


def insert_clip_score(image_id, score):
    rec = {"image_id": image_id, "clip_score": score, "model_used": model_name}
    supabase.table("clip_scores").insert(rec).execute()


def main():
    print("Starting CLIPScore evaluation...")
    # validasi credential dulu
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: SUPABASE_SERVICE_KEY is not set. Create a .env file from .env.template and set the key.")
        sys.exit(1)

    # buat koneksi ke Supabase
    global supabase
    if supabase is None:
        print("Creating Supabase client...")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    imgs = get_images_to_evaluate(limit=100)
    if not imgs:
        print("✅ Tidak ada gambar baru untuk dievaluasi.")
        return

    print(f"Processing {len(imgs)} images...")
    for row in tqdm(imgs, desc="Evaluasi CLIPScore"):
        try:
            img_id = row["id"]
            prompt = row.get("prompt") or ""
            path = row.get("storage_path")
            if not path:
                print(f"[skip] No path for {img_id}")
                continue
            url = get_signed_url(path)
            if not url:
                print(f"[skip] No signed URL for {path}")
                continue
            pil = download_image(url)
            score = compute_clip_score(prompt, pil)
            insert_clip_score(img_id, score)
        except Exception as e:
            print(f"[error] {img_id}: {e}")
    print("✅ Semua gambar sudah selesai dihitung!")


if __name__ == "__main__":
    main()