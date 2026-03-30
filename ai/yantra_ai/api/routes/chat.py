from fastapi import APIRouter, HTTPException

from yantra_ai.core.service import ChatService
from yantra_ai.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])
service = ChatService()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    if not any(message.role == "user" for message in request.messages):
        raise HTTPException(status_code=400, detail="At least one user message is required.")

    return service.reply(request)
