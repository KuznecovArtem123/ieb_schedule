import hashlib

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ieb_admin.models import Schedule

from .models import Group, Teacher
from .serializers import GroupSerializer, LessonSerializer, TeacherSerializer


def schedule_etag(schedules):
    values = '|'.join(
        f'{schedule.id}:{schedule.updated_at.isoformat()}'
        for schedule in sorted(schedules, key=lambda item: item.id)
    )
    digest = hashlib.sha256(values.encode('utf-8')).hexdigest()
    return f'"{digest}"'


def response_with_schedule_etag(request, schedules, data_factory):
    etag = schedule_etag(schedules)
    if request.META.get('HTTP_IF_NONE_MATCH') == etag:
        response = Response(status=status.HTTP_304_NOT_MODIFIED)
    else:
        response = Response(data=data_factory(), status=status.HTTP_200_OK)

    response['ETag'] = etag
    response['Access-Control-Expose-Headers'] = 'ETag'
    return response


class LessonView(APIView):
    def get(self, request):
        edu = request.GET.get('edu') or 'spo'
        week = request.GET.get('week') or 'this'

        schedule = get_object_or_404(Schedule, edu=edu, week=week)

        lessons = schedule.lessons.all()
        return response_with_schedule_etag(
            request,
            [schedule],
            lambda: LessonSerializer(lessons, many=True).data,
        )


class GroupLessonsView(APIView):
    def get(self, request, id):
        week = request.GET.get('week') or 'this'
        group = get_object_or_404(Group, id=id)
        schedule = get_object_or_404(
            Schedule,
            edu=group.department.lower(),
            week=week,
        )

        lessons = group.lessons.filter(schedule=schedule).all()
        return response_with_schedule_etag(
            request,
            [schedule],
            lambda: LessonSerializer(lessons, many=True).data,
        )
    
class TeacherLessonsView(APIView):
    def get(self, request, id):
        week = request.GET.get('week') or 'this'

        teacher = get_object_or_404(Teacher, id=id)

        lessons = teacher.lessons.filter(schedule__week=week).all()
        schedules = list(
            Schedule.objects.filter(
                week=week,
                lessons__teachers=teacher,
            ).distinct()
        )
        return response_with_schedule_etag(
            request,
            schedules,
            lambda: LessonSerializer(lessons, many=True).data,
        )


class GroupView(APIView):
    def get(self, request):
        edu_param = request.GET.get('edu')
        if edu_param:
            departments = [d.strip().upper() for d in edu_param.split(',')]
        else:
            departments = [Group.Department.VO, Group.Department.SPO]
        groups = Group.objects.filter(department__in=departments)
        serializer = GroupSerializer(groups, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
class TeacherView(APIView):
    def get(self, request):
        teachers = Teacher.objects.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)