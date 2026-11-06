from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.config import settings
from app.core.middlewares import register_middlewares
from app.modules.sample.router import router as sample_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # Регистрация сквозных миддлваров (CORS, ETag, RequestId, Logging)
    register_middlewares(app)

    # Подключение модулей
    app.include_router(sample_router, prefix=settings.API_V1_STR)

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "project": settings.PROJECT_NAME}

    return app


app = create_app()
