from django.db import models

class Service(models.Model):
    CATEGORY_CHOICES = [
        ('TURNKEY', 'Turnkey Home Construction'),
        ('PLANNING', 'Architectural Planning & 3D Design'),
        ('STRUCTURAL', 'Structural Engineering & Detailing'),
        ('INTERIOR', 'Interior Architecture & Finishing'),
        ('RENOVATION', 'Full Home Renovation & Remodeling'),
    ]

    title = models.CharField(max_length=150)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='TURNKEY')
    tagline = models.CharField(max_length=255)
    description = models.TextField()
    starting_price_inr = models.DecimalField(max_digits=12, decimal_places=2, default=1750.00)
    unit = models.CharField(max_length=50, default='per sq ft')
    features = models.JSONField(default=list, help_text="List of bullet features")
    icon = models.CharField(max_length=50, default='Building2')
    image = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.title


class Project(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='Turnkey Construction')
    location = models.CharField(max_length=150, default='Mumbai, India')
    sqft = models.IntegerField(default=2400)
    duration_months = models.IntegerField(default=8)
    completed_year = models.IntegerField(default=2026)
    estimated_cost_inr = models.DecimalField(max_digits=14, decimal_places=2, default=7500000.00)
    
    before_image = models.URLField(max_length=500)
    after_image = models.URLField(max_length=500)
    gallery_images = models.JSONField(default=list)
    description = models.TextField()
    is_featured = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.location})"


class FloorPlan(models.Model):
    title = models.CharField(max_length=150)
    bhk_type = models.CharField(max_length=20, default='3 BHK')
    sqft = models.IntegerField(default=2000)
    floors = models.IntegerField(default=2)
    blueprint_2d = models.URLField(max_length=500, blank=True, null=True)
    render_3d = models.URLField(max_length=500, blank=True, null=True)
    room_hotspots = models.JSONField(default=list, help_text="Hotspot room specs JSON")

    def __str__(self):
        return f"{self.title} - {self.sqft} sq ft ({self.bhk_type})"


class ChatbotSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    user_name = models.CharField(max_length=100, blank=True, null=True)
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    requested_site_visit = models.BooleanField(default=False)
    inquired_sqft = models.IntegerField(default=2200)
    inquired_budget_inr = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    city_region = models.CharField(max_length=100, default='Mumbai MMR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.session_id} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class ChatMessage(models.Model):
    session = models.ForeignKey(ChatbotSession, related_name='messages', on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=[('user', 'User'), ('bot', 'Bot')])
    message = models.TextField()
    calculation_snapshot = models.JSONField(default=dict, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.message[:40]}"


class Material(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='Structural')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=30)
    trend = models.CharField(max_length=20, default='0.0%')
    brand = models.CharField(max_length=50, default='Generic')

    def __str__(self):
        return self.name


class LaborRate(models.Model):
    trade = models.CharField(max_length=100)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    sqft_rate = models.DecimalField(max_digits=8, decimal_places=2)
    region = models.CharField(max_length=100, default='Mumbai MMR')

    def __str__(self):
        return self.trade
