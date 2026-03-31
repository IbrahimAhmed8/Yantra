from contextlib import asynccontextmanager
import logging

from dotenv import load_dotenv
from fastapi import FastAPI

from yantra_ai.api.routes.chat import router as chat_router
from yantra_ai.core.config import get_settings
from yantra_ai.core.rag import warmup_retrieval


logger = logging.getLogger(__name__)


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
    load_dotenv()

    app = FastAPI(
        title="Yantra AI Service",
        version="0.1.0",
        description="Local-first Yantra AI microservice scaffold.",
        lifespan=lifespan,
    )

    @app.get("/")
    def root() -> dict[str, str]:
        return {"status": "ok", "service": "yantra-ai"}

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(chat_router)
    return app
