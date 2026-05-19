from django.urls import path
from . import views 

urlpatterns = [
    # auth
    path('logout/', views.logoutView, name='logout'),
    path('login/', views.loginView, name='login'),
    # group
    path('groups/edit/<int:id>', views.groupsEditView, name='editGroup'),
    path('groups/delete/<int:id>', views.groupsDeleteView, name='deleteGroup'),
    path('groups/add', views.groupsAddView, name='addGroup'),
    path('groups/', views.groupsView, name='groups'),
    # date
    path('dates/edit/<int:id>', views.datesEditView, name='editDate'),
    path('dates/delete/<int:id>', views.datesDeleteView, name='deleteDate'),
    path('dates/add', views.datesAddView, name='addDate'),
    path('dates/', views.datesView, name='dates'),
    # teachers
    path('teachers/edit/<int:id>', views.teachersEditView, name='editTeacher'),
    path('teachers/delete/<int:id>', views.teachersDeleteView, name='deleteTeacher'),
    path('teachers/add', views.teachersAddView, name='addTeacher'),
    path('teachers/', views.teachersView, name='teachers'),
    # schedule
    path('schedule/edit/<int:id>', views.editLesson, name='editLesson'),
    path('schedule/edit/', views.editSchedule, name='editSchedule'),
    path('schedule/add', views.addLesson, name='addLesson'),
    path('schedule/delete', views.deleteSchedule, name='deleteSchedule'),
        # upload
    path('schedule/process/cancel/', views.cancelProcessView, name='cancelProcess'),
    path('schedule/process/', views.processView, name='process'),
    path('schedule/upload/', views.uploadView, name='upload'),
    path('', views.panelView, name='panel'),
]
