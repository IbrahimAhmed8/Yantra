from contextlib import asynccontextmanager
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response

from yantra_ai.api.routes.chat import router as chat_router
from yantra_ai.api.routes.rooms import router as rooms_router
from yantra_ai.core.config import get_settings
from yantra_ai.core.rag import warmup_retrieval


logger = logging.getLogger(__name__)
AI_ROOT = Path(__file__).resolve().parents[1]
AI_ENV_FILE = AI_ROOT / ".env"


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()

    if not settings.startup_warmup:
        yield
        return

    try:
        warmup_retrieval(settings)
    except Exception as exc:  # pragma: no cover - startup fallback only
        logger.warning("Yantra startup warmup skipped: %s", exc)

    yield


def create_app() -> FastAPI:
    load_dotenv(AI_ENV_FILE if AI_ENV_FILE.exists() else None)

    app = FastAPI(
        title="Yantra AI Service",
        version="0.1.0",
        description="Local-first Yantra AI microservice scaffold.",
        lifespan=lifespan,
    )

    @app.api_route("/", methods=["GET", "HEAD"], response_model=None)
    def root(request: Request):
        if request.method == "HEAD":
            return Response(status_code=200)
        return {"status": "ok", "service": "yantra-ai"}

    @app.api_route("/health", methods=["GET", "HEAD"], response_model=None)
    def health(request: Request):
        if request.method == "HEAD":
            return Response(status_code=200)
        return {"status": "ok"}

    app.include_router(chat_router)
    app.include_router(rooms_router)
    return app
