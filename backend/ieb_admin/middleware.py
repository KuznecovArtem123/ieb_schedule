from .upload_cleanup import cancel_pending_schedule, has_pending_upload

# resolver_match в middleware ещё не заполнен — проверяем путь запроса.
UPLOAD_FLOW_PATH_MARKERS = (
    '/schedule/upload',
    '/schedule/process',
)


def _is_upload_flow(request):
    return any(marker in request.path for marker in UPLOAD_FLOW_PATH_MARKERS)


class CleanupPendingScheduleMiddleware:
    """Отменяет незавершённую загрузку при уходе со страниц process/upload."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (
            request.user.is_authenticated
            and has_pending_upload(request)
            and not _is_upload_flow(request)
        ):
            cancel_pending_schedule(request, notify=True)

        return self.get_response(request)
