from schedule.models import ScheduleError

from .models import Schedule

PENDING_UPLOAD_SESSION_KEY = 'fileId'
OVERWRITE_SESSION_KEY = 'upload_is_overwrite'


def cancel_pending_schedule(request, schedule=None, notify=False):
    """Удаляет незавершённую загрузку и очищает сессию."""
    file_id = request.session.pop(PENDING_UPLOAD_SESSION_KEY, None)
    is_overwrite = request.session.pop(OVERWRITE_SESSION_KEY, False)
    ScheduleError.objects.all().delete()

    target = schedule
    if target is None and file_id:
        target = Schedule.objects.filter(id=file_id).first()

    if target is None:
        return False

    if is_overwrite:
        if notify:
            from django.contrib import messages
            messages.info(
                request,
                'Загрузка отменена. Прежнее расписание сохранено без новых данных.',
            )
        return True

    target.delete()
    if notify:
        from django.contrib import messages
        messages.info(request, 'Загрузка отменена.')
    return True


def has_pending_upload(request):
    return bool(request.session.get(PENDING_UPLOAD_SESSION_KEY))


def complete_pending_upload(request):
    request.session.pop(PENDING_UPLOAD_SESSION_KEY, None)
    request.session.pop(OVERWRITE_SESSION_KEY, None)
