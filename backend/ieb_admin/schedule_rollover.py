from django.db import transaction
from django.utils import timezone

from .models import Schedule


def rollover_schedules(*, only_before_today=True):
    """
    Перенос расписания «следующая неделя» → «эта неделя» для каждого отделения.
    Старое расписание this удаляется вместе с уроками; запись next становится this.

    only_before_today: переносить только расписания, загруженные до сегодняшнего дня
    (чтобы в понедельник можно было загрузить новое расписание на next).
    """
    results = []
    today = timezone.localdate()

    for edu_value, edu_label in Schedule.Edu.choices:
        with transaction.atomic():
            next_qs = Schedule.objects.filter(
                edu=edu_value,
                week=Schedule.Week.NEXT,
            )
            if only_before_today:
                next_qs = next_qs.filter(uploaded_at__lt=today)

            next_schedule = next_qs.first()

            if not next_schedule:
                continue

            this_schedule = Schedule.objects.filter(
                edu=edu_value,
                week=Schedule.Week.THIS,
            ).first()

            if this_schedule:
                this_schedule.delete()

            next_schedule.week = Schedule.Week.THIS
            next_schedule.save(update_fields=['week'])

        results.append(
            f'{edu_label}: расписание следующей недели перенесено на текущую'
        )

    return results


def maybe_rollover_schedules():
    """Запуск переноса по понедельникам (идемпотентно)."""
    if timezone.localdate().weekday() != 0:
        return []
    return rollover_schedules()
