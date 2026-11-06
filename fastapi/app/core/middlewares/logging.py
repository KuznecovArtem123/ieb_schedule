import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("api.request")


class ProcessTimeLoggingMiddleware(BaseHTTPMiddleware):
    """Логирует время выполнения запроса и статус ответа"""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        response: Response = await call_next(request)
        process_time_ms = (time.perf_counter() - start_time) * 1000

        response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"

        logger.info(
            f"{request.method} {request.url.path} -> "
            f"status={response.status_code} in {process_time_ms:.2f}ms"
        )
        return response
