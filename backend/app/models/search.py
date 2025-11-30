from pydantic import BaseModel
from typing import List


class ImageResult(BaseModel):
    prompt: str
    image_url: str
    clipscore: float
    similarity: float


class SearchResponse(BaseModel):
    query: str
    results: List[ImageResult]


class HealthResponse(BaseModel):
    status: str
