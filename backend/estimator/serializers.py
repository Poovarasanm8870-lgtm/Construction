from rest_framework import serializers
from .models import Material, LaborRate, ProjectConfiguration, EstimationHistory

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class LaborRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborRate
        fields = '__all__'

class ProjectConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectConfiguration
        fields = '__all__'

class EstimationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EstimationHistory
        fields = '__all__'
