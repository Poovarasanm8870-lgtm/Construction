from django.urls import path
from . import views

urlpatterns = [
    path('services/', views.get_services, name='get_services'),
    path('projects/', views.get_projects, name='get_projects'),
    path('floorplans/', views.get_floorplans, name='get_floorplans'),
    path('chat/', views.groq_ai_chat, name='groq_ai_chat'),
    path('analytics/', views.get_admin_analytics, name='get_admin_analytics'),
    path('pricing/calculate/', views.calculate_pricing, name='calculate_pricing'),
    path('admin/upload-pdf/', views.upload_pdf_knowledge, name='upload_pdf_knowledge'),
    path('admin/vector-docs/', views.get_vector_documents, name='get_vector_documents'),
    path('admin/labour-rates/', views.manage_admin_labour_rates, name='manage_admin_labour_rates'),
]
