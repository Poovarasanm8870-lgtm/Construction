from django.urls import path
from . import views

urlpatterns = [
    path('pricing/calculate/', views.calculate_pricing, name='calculate_pricing'),
    path('materials/', views.get_materials_and_labor, name='get_materials_and_labor'),
    path('projects/', views.get_blueprint_templates, name='get_blueprint_templates'),
    path('chat/', views.ai_chat_fallback, name='ai_chat_fallback'),
]
