from rest_framework import serializers
from .models import Lesson, Teacher, Group


class LessonSerializer(serializers.ModelSerializer):
    group_code = serializers.CharField(source='group.code', read_only=True)
    weekday = serializers.CharField(source='formatted_weekday', read_only=True)
    teachers = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'subject', 'date', 'weekday', 'order',
            'start_time', 'end_time', 'group_code',
            'auditorium', 'teachers',
        ]


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
