from django.contrib import admin
from .models import Service, Project, FloorPlan, RoomLayout, ChatbotSession, ChatMessage, ChatLog, CostMetric, Material

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'starting_price_inr', 'unit')
    list_filter = ('category',)
    search_fields = ('title', 'tagline')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'location', 'sqft', 'estimated_cost_inr', 'completed_year', 'is_featured')
    list_filter = ('category', 'is_featured', 'completed_year')
    search_fields = ('title', 'location')


@admin.register(RoomLayout)
class RoomLayoutAdmin(admin.ModelAdmin):
    list_display = ('room_name', 'bhk_type', 'sqft', 'dimensions', 'project')
    list_filter = ('bhk_type',)
    search_fields = ('room_name', 'dimensions')


@admin.register(FloorPlan)
class FloorPlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'bhk_type', 'sqft', 'floors')
    list_filter = ('bhk_type', 'floors')
    search_fields = ('title',)


@admin.register(ChatbotSession)
class ChatbotSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'inquired_sqft', 'inquired_budget_inr', 'city_region', 'requested_site_visit', 'created_at')
    list_filter = ('requested_site_visit', 'city_region')
    search_fields = ('session_id', 'user_name', 'user_phone')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'sender', 'timestamp', 'message_snippet')
    list_filter = ('sender', 'timestamp')

    def message_snippet(self, obj):
        return obj.message[:60]


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'inquired_sqft', 'estimated_cost_inr', 'timestamp')
    search_fields = ('session_id', 'user_query')


@admin.register(CostMetric)
class CostMetricAdmin(admin.ModelAdmin):
    list_display = ('region', 'base_rate_per_sqft', 'cement_ratio', 'steel_ratio', 'updated_at')


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'unit', 'brand', 'trend')
    list_filter = ('category', 'brand')
