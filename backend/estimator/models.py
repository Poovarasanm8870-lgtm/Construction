from django.db import models

class Material(models.Model):
    CATEGORY_CHOICES = [
        ('STRUCTURAL', 'Structural & Concrete'),
        ('METALS', 'Steel & Metals'),
        ('LUMBER', 'Timber & Framing'),
        ('GLASS', 'Glass & Windows'),
        ('ROOFING', 'Roofing Materials'),
        ('FINISHES', 'Wall & Flooring Finishes'),
        ('ENERGY', 'Solar & Eco Energy'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='STRUCTURAL')
    unit = models.CharField(max_length=20, help_text="e.g. cu yd, ton, sq ft, sheet, unit")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    region = models.CharField(max_length=50, default='National Average')
    grade_multiplier = models.FloatField(default=1.0, help_text="Multiplier for standard (1.0), premium (1.3), luxury (1.8)")
    volatility_index = models.FloatField(default=0.05, help_text="Monthly percentage price volatility range (+/-)")
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (${self.unit_price}/{self.unit})"


class LaborRate(models.Model):
    TRADE_CHOICES = [
        ('GENERAL', 'General Contractor'),
        ('MASON', 'Masonry & Concrete'),
        ('FRAMER', 'Framing Carpenter'),
        ('ROOFER', 'Roofing Specialist'),
        ('ELECTRICIAN', 'Electrician'),
        ('PLUMBER', 'Plumber'),
        ('FINISHER', 'Drywall & Paint Specialist'),
    ]

    trade = models.CharField(max_length=30, choices=TRADE_CHOICES)
    region = models.CharField(max_length=50, default='National Average')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    sqft_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_trade_display()} - {self.region} (${self.hourly_rate}/hr)"


class ProjectConfiguration(models.Model):
    STYLE_CHOICES = [
        ('MODERN', 'Modern Glass Villa'),
        ('COLONIAL', 'Colonial Brick Estate'),
        ('MINIMALIST', 'Minimalist Concrete Cube'),
        ('NORDIC', 'Nordic Timber Cabin'),
        ('FUTURISTIC', 'Futuristic Smart Home'),
    ]

    ROOF_CHOICES = [
        ('FLAT', 'Flat Terrace Roof'),
        ('GABLED', 'Classic Gabled Roof'),
        ('HIP', 'Hipped Roof'),
        ('SLANTED', 'Modern Slanted Mono-pitch'),
    ]

    FINISH_GRADE_CHOICES = [
        ('STANDARD', 'Standard Builders Grade'),
        ('PREMIUM', 'Premium Architectural Grade'),
        ('LUXURY', 'Ultra-Luxury Custom Grade'),
    ]

    name = models.CharField(max_length=150, default='Custom House Design')
    sqft = models.IntegerField(default=2200)
    floors = models.IntegerField(default=2)
    style = models.CharField(max_length=30, choices=STYLE_CHOICES, default='MODERN')
    roof_type = models.CharField(max_length=30, choices=ROOF_CHOICES, default='FLAT')
    finish_grade = models.CharField(max_length=30, choices=FINISH_GRADE_CHOICES, default='PREMIUM')
    region = models.CharField(max_length=50, default='North America East')
    wall_color = models.CharField(max_length=20, default='#38bdf8')
    estimated_material_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    estimated_labor_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.sqft} sq ft (${self.total_estimated_cost:,.2f})"


class EstimationHistory(models.Model):
    session_id = models.CharField(max_length=100, blank=True, null=True)
    user_prompt = models.TextField()
    ai_response = models.TextField()
    calculated_breakdown = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Query at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
