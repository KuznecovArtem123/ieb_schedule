from django.urls import path

from .views import PushSubscriptionView, VapidPublicKeyView

urlpatterns = [
    path('vapid-public-key/', VapidPublicKeyView.as_view(), name='vapid-public-key'),
    path('subscribe/', PushSubscriptionView.as_view(), name='push-subscribe'),
]
