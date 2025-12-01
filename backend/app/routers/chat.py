from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.services.chat_service import generate_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    role: str
    message: str

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint with RAG and streaming response
    """
    if request.role.lower() not in ["guru", "anak-anak"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'Guru' or 'Anak-anak'")

    return StreamingResponse(
        generate_chat_response(request.role, request.message),
        media_type="text/plain"
    )
