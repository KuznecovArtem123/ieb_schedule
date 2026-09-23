from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import PushSubscription
from .services import send_push_notification


class PushSubscriptionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.payload = {
            'endpoint': 'https://push.example/subscription-1',
            'expirationTime': None,
            'keys': {'p256dh': 'public-key', 'auth': 'auth-key'},
        }

    def test_subscribe_updates_existing_endpoint(self):
        response = self.client.post('/api/notifications/subscribe/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(PushSubscription.objects.count(), 1)

        self.payload['keys']['auth'] = 'updated-auth-key'
        response = self.client.post('/api/notifications/subscribe/', self.payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(PushSubscription.objects.get().auth, 'updated-auth-key')
        self.assertEqual(PushSubscription.objects.count(), 1)

    def test_unsubscribe_removes_endpoint(self):
        self.client.post('/api/notifications/subscribe/', self.payload, format='json')

        response = self.client.delete(
            '/api/notifications/subscribe/',
            {'endpoint': self.payload['endpoint']},
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(PushSubscription.objects.exists())


@override_settings(
    WEBPUSH_VAPID_PRIVATE_KEY='private-key',
    WEBPUSH_VAPID_CLAIMS={'sub': 'mailto:test@example.com'},
)
class PushNotificationServiceTests(TestCase):
    @patch('notifications.services.webpush')
    def test_sends_payload_to_subscription(self, webpush):
        PushSubscription.objects.create(
            endpoint='https://push.example/subscription-1',
            p256dh='public-key',
            auth='auth-key',
        )

        result = send_push_notification('Занятие отменено', 'Проверьте расписание', '/schedule')

        self.assertEqual(result, {'sent': 1, 'removed': 0})
        webpush.assert_called_once()
        self.assertIn('Занятие отменено', webpush.call_args.kwargs['data'])
