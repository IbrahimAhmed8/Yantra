from fastapi import APIRouter, HTTPException

from yantra_ai.core.service import ChatService
from yantra_ai.schemas.chat import (
    ChatRequest,
    ChatResponse,
    DashboardGenerationRequest,
    DashboardGenerationResponse,
    DashboardRecommendationRequest,
    DashboardRecommendationResponse,
    PersonalizationExtractRequest,
    PersonalizationExtractResponse,
)

router = APIRouter(tags=["chat"])
service = ChatService()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    if not any(message.role == "user" for message in request.messages):
        raise HTTPException(status_code=400, detail="At least one user message is required.")

    return service.reply(request)


@router.post("/dashboard/recommendation", response_model=DashboardRecommendationResponse)
def dashboard_recommendation(
    request: DashboardRecommendationRequest,
) -> DashboardRecommendationResponse:
    return service.dashboard_recommendation(request)


@router.post("/personalization/extract", response_model=PersonalizationExtractResponse)
def personalization_extract(
    request: PersonalizationExtractRequest,
) -> PersonalizationExtractResponse:
    return service.personalization_extract(request)


@router.post("/dashboard/generate", response_model=DashboardGenerationResponse)
def dashboard_generate(
    request: DashboardGenerationRequest,
) -> DashboardGenerationResponse:
    return service.dashboard_generate(request)
