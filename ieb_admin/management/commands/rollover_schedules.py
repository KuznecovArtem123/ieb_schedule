from django.core.management.base import BaseCommand

from ieb_admin.schedule_rollover import maybe_rollover_schedules, rollover_schedules


class Command(BaseCommand):
    help = (
        'Переносит расписание next → this для СПО и ВО. '
        'По умолчанию выполняется только в понедельник; --force — в любой день.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Выполнить перенос даже не в понедельник',
        )

    def handle(self, *args, **options):
        if options['force']:
            results = rollover_schedules(only_before_today=False)
        else:
            results = maybe_rollover_schedules()

        if not results:
            self.stdout.write(self.style.WARNING('Нечего переносить (нет расписания next или не понедельник).'))
            return

        for message in results:
            self.stdout.write(self.style.SUCCESS(message))
