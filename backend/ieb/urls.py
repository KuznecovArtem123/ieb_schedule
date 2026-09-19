from django.urls import include, path

urlpatterns = [
    path('admin/', include('ieb_admin.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/', include('schedule.urls')),
]
