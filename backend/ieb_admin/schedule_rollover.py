from django.db import transaction
from django.utils import timezone

from .models import Schedule


def rollover_schedules():
    """
    Перенос расписания «следующая неделя» → «эта неделя» для каждого отделения.
    Старое расписание this удаляется вместе с уроками; запись next становится this.

    """
    results = []

    for edu_value, edu_label in Schedule.Edu.choices:
        with transaction.atomic():
            next_schedule = Schedule.objects.select_for_update().filter(
                edu=edu_value,
                week=Schedule.Week.NEXT,
            ).order_by('-uploaded_at', '-updated_at', '-id').first()

            if not next_schedule:
                continue

            this_schedule = Schedule.objects.select_for_update().filter(
                edu=edu_value,
                week=Schedule.Week.THIS,
            ).order_by('-updated_at', '-id').first()

            if this_schedule:
                this_schedule.delete()

            next_schedule.week = Schedule.Week.THIS
            next_schedule.save(update_fields=['week', 'updated_at'])

        results.append(
            f'{edu_label}: расписание следующей недели перенесено на текущую'
        )

    return results


def maybe_rollover_schedules():
    """Переносит расписание при первом обращении к админке в понедельник."""
    if timezone.localdate().weekday() != 0:
        return []
    return rollover_schedules()
