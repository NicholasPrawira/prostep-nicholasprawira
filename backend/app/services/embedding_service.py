from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def encode_query(query: str) -> list:
    """Encode query string to vector embedding"""
    embedding = model.encode([query])[0].tolist()
    return embedding
