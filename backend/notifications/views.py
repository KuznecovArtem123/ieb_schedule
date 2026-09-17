from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PushSubscription
from .serializers import PushSubscriptionSerializer


class VapidPublicKeyView(APIView):
    def get(self, request):
        return Response({'publicKey': settings.WEBPUSH_VAPID_PUBLIC_KEY})


@method_decorator(csrf_exempt, name='dispatch')
class PushSubscriptionView(APIView):
    def post(self, request):
        serializer = PushSubscriptionSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        return Response(
            {'id': subscription.pk},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request):
        endpoint = request.data.get('endpoint')
        if not endpoint:
            return Response(
                {'detail': 'endpoint обязателен.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deleted, _ = PushSubscription.objects.filter(endpoint=endpoint).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
