import json

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from pywebpush import WebPushException, webpush

from .models import PushSubscription


def _vapid_configured():
    return bool(
        settings.WEBPUSH_VAPID_PRIVATE_KEY
        and settings.WEBPUSH_VAPID_CLAIMS.get('sub')
    )


def send_push_notification(title, body, url='/', subscriptions=None):
    if not _vapid_configured():
        raise ImproperlyConfigured(
            'WEBPUSH_VAPID_PRIVATE_KEY и WEBPUSH_VAPID_SUBJECT должны быть заданы.'
        )

    payload = json.dumps({'title': title, 'body': body, 'url': url})
    targets = subscriptions if subscriptions is not None else PushSubscription.objects.all()
    sent = 0
    removed = 0

    for subscription in targets:
        try:
            webpush(
                subscription_info=subscription.as_webpush_subscription(),
                data=payload,
                vapid_private_key=settings.WEBPUSH_VAPID_PRIVATE_KEY,
                vapid_claims=settings.WEBPUSH_VAPID_CLAIMS,
            )
        except WebPushException as error:
            response = getattr(error, 'response', None)
            if response is not None and response.status_code in (404, 410):
                subscription.delete()
                removed += 1
                continue
            raise
        else:
            sent += 1

    return {'sent': sent, 'removed': removed}
