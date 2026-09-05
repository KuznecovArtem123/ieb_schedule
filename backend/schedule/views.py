from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ieb_admin.models import Schedule

from .models import Group, Teacher
from .serializers import GroupSerializer, LessonSerializer, TeacherSerializer


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
        edu = request.GET.get('edu').upper() or Group.Department.SPO
        groups = Group.objects.all().filter(department=edu)
        serializer = GroupSerializer(groups, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
class TeacherView(APIView):
    def get(self, request):
        teachers = Teacher.objects.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)