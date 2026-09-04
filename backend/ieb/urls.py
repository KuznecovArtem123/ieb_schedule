from django.urls import path, include

urlpatterns = [
    path('admin/', include('ieb_admin.urls')),
    path('api/', include('schedule.urls')),
]
