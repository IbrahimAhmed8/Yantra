from typing import Literal

from pydantic import BaseModel, Field

from yantra_ai.schemas.chat import StudentContext


class PythonRuntimeErrorDetails(BaseModel):
    type: str = Field(min_length=1)
    message: str = Field(min_length=1)
    traceback: str = Field(min_length=1)
    line: int | None = Field(default=None, ge=1)


class PythonRoomFeedbackRequest(BaseModel):
    trigger: Literal["runtime_error"]
    task: str = Field(min_length=1)
    code: str = Field(min_length=1)
    stdout: str = ""
    stderr: str = ""
    error: PythonRuntimeErrorDetails
    student: StudentContext = Field(default_factory=StudentContext)


class PythonRoomFeedbackResponse(BaseModel):
    reply: str
    provider: str
    model_used: str | None = None

