from django.urls import path
from . import views

urlpatterns = [
    path('services/', views.get_services, name='get_services'),
    path('projects/', views.get_projects, name='get_projects'),
    path('floorplans/', views.get_floorplans, name='get_floorplans'),
    path('chat/', views.groq_ai_chat, name='groq_ai_chat'),
    path('analytics/', views.get_admin_analytics, name='get_admin_analytics'),
    path('pricing/calculate/', views.calculate_pricing, name='calculate_pricing'),
]
