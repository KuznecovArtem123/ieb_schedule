from rest_framework import serializers

from .models import PushSubscription


class PushSubscriptionSerializer(serializers.ModelSerializer):
    expirationTime = serializers.IntegerField(
        source='expiration_time', allow_null=True, required=False,
    )
    keys = serializers.JSONField(write_only=True)

    class Meta:
        model = PushSubscription
        fields = ['endpoint', 'expirationTime', 'keys']

    def validate_keys(self, value):
        if not isinstance(value, dict) or not value.get('p256dh') or not value.get('auth'):
            raise serializers.ValidationError('keys.p256dh и keys.auth обязательны.')
        return value

    def create(self, validated_data):
        keys = validated_data.pop('keys')
        subscription, _ = PushSubscription.objects.update_or_create(
            endpoint=validated_data['endpoint'],
            defaults={
                **validated_data,
                'p256dh': keys['p256dh'],
                'auth': keys['auth'],
                'user_agent': self.context['request'].META.get('HTTP_USER_AGENT', ''),
            },
        )
        return subscription
