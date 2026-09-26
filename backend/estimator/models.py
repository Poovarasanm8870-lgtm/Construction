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


class LabourRate(models.Model):
    head_mason_daily_wage = models.DecimalField(max_digits=10, decimal_places=2, default=950.00)
    skilled_labour_daily_wage = models.DecimalField(max_digits=10, decimal_places=2, default=800.00)
    helper_daily_wage = models.DecimalField(max_digits=10, decimal_places=2, default=650.00)
    other_worker_daily_wage = models.DecimalField(max_digits=10, decimal_places=2, default=600.00)
    
    rcc_structure_rate_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=240.00)
    brickwork_plaster_rate_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=110.00)
    tile_flooring_rate_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=45.00)
    plumbing_elec_rate_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=160.00)
    painting_rate_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=22.00)
    
    daily_mason_team_output_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=25.00)
    working_hours = models.IntegerField(default=8)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Labour Rate Config (Mason: ₹{self.head_mason_daily_wage}/day, Helper: ₹{self.helper_daily_wage}/day)"


class PackageConfig(models.Model):
    name = models.CharField(max_length=50) # Economy, Standard, Premium
    slug = models.CharField(max_length=50, unique=True) # economy, standard, premium
    base_material_rate_per_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=1200.00)
    flooring_spec = models.CharField(max_length=255, default='Ceramic Tiles (600x600mm)')
    plumbing_spec = models.CharField(max_length=255, default='Standard Sanitary & CP Fittings')
    electrical_spec = models.CharField(max_length=255, default='Modular Switches & Copper Wiring')
    paint_spec = models.CharField(max_length=255, default='Tractor Emulsion Paint')
    doors_windows_spec = models.CharField(max_length=255, default='Flush Doors & Aluminium Windows')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} Package (@ ₹{self.base_material_rate_per_sqft}/sq ft mat rate)"


class Material(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='Structural') # Cement, Steel, Bricks, Sand, Aggregate, Tiles, Paint, Plumbing, Electrical
    brand = models.CharField(max_length=50, default='Generic')
    grade = models.CharField(max_length=50, blank=True, null=True, default='Standard')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=30) # bag, ton, cuft, sqft, liter, unit
    trend = models.CharField(max_length=20, default='0.0%')
    source = models.CharField(max_length=150, default='Admin Database')
    description = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.category}) - ₹{self.price}/{self.unit}"


class ChatbotSession(models.Model):
    STATE_CHOICES = [
        ('START', 'Start'),
        ('COLLECT_SQFT', 'Collect Square Feet'),
        ('COLLECT_LOCATION', 'Collect Location'),
        ('RESEARCH', 'Web Researching'),
        ('SELECT_CEMENT', 'Select Cement'),
        ('SELECT_STEEL', 'Select Steel'),
        ('SELECT_WORKFORCE', 'Select Workforce'),
        ('CALCULATE_PACKAGES', 'Calculate Packages'),
        ('SELECT_PACKAGE', 'Select Package'),
        ('CONFIRM', 'Confirm Estimate'),
        ('COMPLETED', 'Completed'),
    ]

    session_id = models.CharField(max_length=100, unique=True)
    state = models.CharField(max_length=30, choices=STATE_CHOICES, default='START')
    user_name = models.CharField(max_length=100, blank=True, null=True)
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    requested_site_visit = models.BooleanField(default=False)
    
    inquired_sqft = models.IntegerField(null=True, blank=True)
    city_region = models.CharField(max_length=150, null=True, blank=True)
    
    selected_cement = models.CharField(max_length=100, null=True, blank=True)
    selected_steel = models.CharField(max_length=100, null=True, blank=True)
    selected_workers = models.IntegerField(null=True, blank=True)
    selected_package = models.CharField(max_length=50, null=True, blank=True)
    pending_material = models.CharField(max_length=50, null=True, blank=True)
    
    inquired_budget_inr = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    labour_rates_used = models.JSONField(default=dict, blank=True, null=True)
    material_prices_used = models.JSONField(default=dict, blank=True, null=True)
    estimated_labour_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    estimated_material_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_estimated_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    
    web_sources_used = models.JSONField(default=list, blank=True, null=True)
    is_confirmed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.session_id} - {self.state} ({self.inquired_sqft or 0} sq ft, {self.city_region or 'No Location'})"


class ChatMessage(models.Model):
    session = models.ForeignKey(ChatbotSession, related_name='messages', on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=[('user', 'User'), ('bot', 'Bot')])
    message = models.TextField()
    calculation_snapshot = models.JSONField(default=dict, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.message[:40]}"


class RoomLayout(models.Model):
    project = models.ForeignKey(Project, related_name='room_layouts', on_delete=models.CASCADE, null=True, blank=True)
    room_name = models.CharField(max_length=150)
    bhk_type = models.CharField(max_length=50, default='3 BHK')
    sqft = models.IntegerField(default=450)
    dimensions = models.CharField(max_length=100, default='20.0 ft x 22.5 ft')
    finishes = models.TextField(default='Italian Marble Flooring, UPVC Double Glazed Windows, Cove Lighting')
    blueprint_2d = models.URLField(max_length=500, blank=True, null=True)
    render_3d = models.URLField(max_length=500, blank=True, null=True)
    x_percent = models.IntegerField(default=50)
    y_percent = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.room_name} ({self.sqft} sq ft)"


class ChatLog(models.Model):
    session_id = models.CharField(max_length=100)
    user_query = models.TextField()
    bot_response = models.TextField()
    inquired_sqft = models.IntegerField(default=1500)
    estimated_cost_inr = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatLog {self.session_id} - {self.inquired_sqft} sq ft"


class CostMetric(models.Model):
    region = models.CharField(max_length=100, default='Mumbai MMR')
    base_rate_per_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=1850.00)
    cement_ratio = models.DecimalField(max_digits=6, decimal_places=2, default=0.40) # bags per sqft
    steel_ratio = models.DecimalField(max_digits=6, decimal_places=4, default=0.0035) # tons per sqft
    brick_ratio = models.DecimalField(max_digits=6, decimal_places=2, default=18.0) # bricks per sqft
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.region} @ ₹ {self.base_rate_per_sqft}/sq ft"


