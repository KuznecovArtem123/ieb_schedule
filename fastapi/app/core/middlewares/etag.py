import hashlib
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class ETagMiddleware(BaseHTTPMiddleware):
    """
    Генерирует заголовок ETag для GET-запросов.
    При совпадении с If-None-Match отдает статус 304 Not Modified.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method != "GET":
            return await call_next(request)

        response: Response = await call_next(request)

        # Обрабатываем только успешные 200 ответы со статическим контентом
        if response.status_code == 200 and hasattr(response, "body"):
            etag = f'"{hashlib.sha256(response.body).hexdigest()}"'
            if_none_match = request.headers.get("if-none-match")

            if if_none_match == etag:
                return Response(status_code=304, headers={"ETag": etag})

            response.headers["ETag"] = etag
            response.headers["Access-Control-Expose-Headers"] = "ETag"

        return response
