from typing import Literal

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=1)


class StudentContext(BaseModel):
    name: str = "Learner"
    skill_level: str = "Beginner"
    current_path: str = "AI Foundations"
    progress: int = Field(default=0, ge=0, le=100)
    learning_goals: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    messages: list[Message]
    student: StudentContext = Field(default_factory=StudentContext)
    top_k: int = Field(default=3, ge=1, le=8)


class SourceSnippet(BaseModel):
    title: str
    path: str
    score: float
    excerpt: str


class ChatResponse(BaseModel):
    reply: str
    intent: str
    context_used: bool
    retrieval_mode: str
    provider: str
    model_used: str | None = None
    sources: list[SourceSnippet]
