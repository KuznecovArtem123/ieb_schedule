from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.middlewares.etag import ETagMiddleware
from app.core.middlewares.logging import ProcessTimeLoggingMiddleware
from app.core.middlewares.request_id import RequestIdMiddleware


def register_middlewares(app: FastAPI) -> None:
    # 1. CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. GZip для сжатия ответов тяжелее 1 КБ
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # 3. Кастомные миддлвары
    app.add_middleware(ETagMiddleware)
    app.add_middleware(ProcessTimeLoggingMiddleware)
    app.add_middleware(RequestIdMiddleware)
