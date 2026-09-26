from django.contrib import admin
from .models import Service, Project, FloorPlan, RoomLayout, ChatbotSession, ChatMessage, ChatLog, CostMetric, Material, LabourRate, PackageConfig

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


@admin.register(LabourRate)
class LabourRateAdmin(admin.ModelAdmin):
    list_display = ('id', 'head_mason_daily_wage', 'skilled_labour_daily_wage', 'helper_daily_wage', 'rcc_structure_rate_sqft', 'daily_mason_team_output_sqft', 'is_active', 'updated_at')
    list_editable = ('head_mason_daily_wage', 'skilled_labour_daily_wage', 'helper_daily_wage', 'rcc_structure_rate_sqft')


@admin.register(PackageConfig)
class PackageConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'base_material_rate_per_sqft', 'flooring_spec', 'plumbing_spec', 'electrical_spec', 'is_active')
    list_editable = ('base_material_rate_per_sqft',)



@admin.register(ChatbotSession)
class ChatbotSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'state', 'inquired_sqft', 'city_region', 'selected_package', 'total_estimated_cost', 'is_confirmed', 'created_at')
    list_filter = ('state', 'is_confirmed', 'selected_package')
    search_fields = ('session_id', 'user_name', 'user_phone', 'city_region')


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
    list_display = ('name', 'category', 'brand', 'grade', 'price', 'unit', 'source', 'updated_at')
    list_filter = ('category', 'brand', 'source')
    search_fields = ('name', 'brand', 'category')

