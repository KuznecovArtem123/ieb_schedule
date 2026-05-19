from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import LessonSerializer, GroupSerializer, TeacherSerializer
from .models import Lesson, Teacher, Group
from ieb_admin.models import Schedule
from rest_framework import status

class LessonView(APIView):
    def get(self, request):
        edu = request.GET.get('edu') or 'spo'
        week = request.GET.get('week') or 'this'

        schedule = get_object_or_404(Schedule, edu=edu, week=week)

        lessons = schedule.lessons.all()
        serializer = LessonSerializer(lessons, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

class GroupLessonsView(APIView):
    def get(self, request, id):
        week = request.GET.get('week') or 'this'
        print('week')
        group = get_object_or_404(Group, id=id)

        lessons = group.lessons.filter(schedule__week=week).all()
        serializer = LessonSerializer(lessons, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
class TeacherLessonsView(APIView):
    def get(self, request, id):

        teacher = get_object_or_404(Teacher, id=id)

        lessons = teacher.lessons.all()
        serializer = LessonSerializer(lessons, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)


class GroupView(APIView):
    def get(self, request):
        groups = Group.objects.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
class TeacherView(APIView):
    def get(self, request):
        teachers = Teacher.objects.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)