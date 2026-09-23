from django.core.management.base import BaseCommand, CommandError

from notifications.services import send_push_notification


class Command(BaseCommand):
    help = 'Отправляет Web Push уведомление всем активным подпискам.'

    def add_arguments(self, parser):
        parser.add_argument('title')
        parser.add_argument('body')
        parser.add_argument('--url', default='/')

    def handle(self, *args, **options):
        try:
            result = send_push_notification(
                title=options['title'],
                body=options['body'],
                url=options['url'],
            )
        except Exception as error:
            raise CommandError(str(error)) from error

        self.stdout.write(
            self.style.SUCCESS(
                f"Отправлено: {result['sent']}; удалено неактивных: {result['removed']}."
            )
        )
