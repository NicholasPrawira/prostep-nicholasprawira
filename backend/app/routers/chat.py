from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.services.chat_service import generate_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    role: str
    message: str
    user_name: str | None = None
    selected_image: dict | None = None

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint with RAG and streaming response
    """
    allowed_roles = ["profesor", "kakak pintar", "teman baik", "sang penjelajah"]
    if request.role.lower() not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(allowed_roles)}")

    return StreamingResponse(
        generate_chat_response(request.role, request.message, request.selected_image),
        media_type="text/plain"
    )
