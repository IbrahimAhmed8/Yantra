from fastapi import APIRouter

from yantra_ai.core.service import ChatService
from yantra_ai.schemas.room_feedback import PythonRoomFeedbackRequest, PythonRoomFeedbackResponse

router = APIRouter(prefix="/rooms/python", tags=["rooms"])
service = ChatService()


@router.post("/feedback", response_model=PythonRoomFeedbackResponse)
def python_feedback(request: PythonRoomFeedbackRequest) -> PythonRoomFeedbackResponse:
    return service.python_room_feedback(request)

