from rest_framework import serializers
from .models import Lesson, Teacher, Group

class LessonSerializer(serializers.ModelSerializer):
    group_code = serializers.CharField(source='group.code', read_only=True)
    date_display = serializers.CharField(source='date.date', read_only=True)
    teachers = serializers.StringRelatedField(many=True, read_only=True)
    class Meta:
        model = Lesson
        fields = [
            'id', 'subject', 'date_display', 'order', 
            'start_time', 'end_time', 'group_code', 
            'auditorium', 'teachers'
        ]

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'