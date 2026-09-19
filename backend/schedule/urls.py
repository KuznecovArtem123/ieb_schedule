from django.urls import path

from .views import (
    GroupLessonsView,
    GroupView,
    LessonView,
    ScheduleVersionView,
    TeacherLessonsView,
    TeacherView,
)

urlpatterns = [
    path('lessons/fromGroup/<int:id>', GroupLessonsView.as_view(), name='api_lessonsFromGroup'),
    path('lessons/fromTeacher/<int:id>', TeacherLessonsView.as_view(), name='api_lessonsFromTeacher'),
    path('lessons/', LessonView.as_view(), name='api_lessons'),
    path('schedule/version/', ScheduleVersionView.as_view(), name='api_schedule_version'),
    path('groups/', GroupView.as_view(), name='api_teachers'),
    path('teachers/', TeacherView.as_view(), name='api_groups'),
]
