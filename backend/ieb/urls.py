from django.urls import include, path

urlpatterns = [
    path('admin/', include('ieb_admin.urls')),
    path('api/', include('schedule.urls')),
]
