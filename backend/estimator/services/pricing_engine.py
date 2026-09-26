import math

# Admin Configurable Labour Charges & Capacity Defaults
ADMIN_LABOUR_CONFIG = {
    "head_mason_daily_wage": 950,           # ₹ 950 / day
    "helper_daily_wage": 650,               # ₹ 650 / day
    "rcc_structure_rate_sqft": 240,         # ₹ 240 / sq ft
    "brickwork_plaster_rate_sqft": 110,     # ₹ 110 / sq ft
    "tile_flooring_rate_sqft": 45,          # ₹ 45 / sq ft
    "plumbing_elec_rate_sqft": 160,         # ₹ 160 / sq ft
    "painting_rate_sqft": 22,               # ₹ 22 / sq ft
    "daily_mason_team_output_sqft": 25,     # 25 sq ft built per mason team per day
    "workers_per_team": 4,                  # 1 Head Mason, 1 Steel Worker, 2 Helpers
    "shift_hours": 8                        # 8-hour daily shift
}

INDIAN_REGIONS = {
    'Mumbai MMR / Maharashtra': 1.15,
    'Delhi NCR / Gurgaon / Noida': 1.10,
    'Bengaluru / Karnataka': 1.12,
    'Hyderabad / Telangana': 1.05,
    'Chennai / Tamil Nadu': 1.06,
    'Kolkata / West Bengal': 0.95,
    'Tier 2 / Tier 3 Towns': 0.90,
}

GRADE_BASE_RATES_INR = {
    'STANDARD': 1750,
    'PREMIUM': 2150,
    'LUXURY': 2850,
}

STYLE_FACTORS = {
    'MODERN': {'mat_mult': 1.0},
    'COLONIAL': {'mat_mult': 1.08},
}

ROOF_FACTORS = {
    'FLAT': {'rate_mult': 1.0},
    'SLOPED': {'rate_mult': 1.05},
}

def get_admin_labour_rates():
    return ADMIN_LABOUR_CONFIG

def update_admin_labour_rates(new_rates):
    global ADMIN_LABOUR_CONFIG
    for key, val in new_rates.items():
        if key in ADMIN_LABOUR_CONFIG:
            try:
                ADMIN_LABOUR_CONFIG[key] = float(val) if '.' in str(val) else int(val)
            except (ValueError, TypeError):
                pass
    return ADMIN_LABOUR_CONFIG


def generate_dynamic_floor_plan(sqft, floors, bhk_type):
    """
    Generates exact room dimension layout specs based on total sqft footprint.
    """
    usable_sqft = sqft * 0.85  # 15% wall thickness & passage deduction
    
    living_sqft = round(usable_sqft * 0.28)
    master_bed_sqft = round(usable_sqft * 0.22)
    other_beds_sqft = round(usable_sqft * 0.20)
    kitchen_sqft = round(usable_sqft * 0.12)
    baths_sqft = round(usable_sqft * 0.10)
    balcony_sqft = round(usable_sqft * 0.08)

    rooms = [
        {"name": "Grand Living & Dining Hall", "area_sqft": living_sqft, "dimensions": f"{math.sqrt(living_sqft*1.3):.1f} ft x {math.sqrt(living_sqft/1.3):.1f} ft", "floor": "Ground Floor", "type": "Living"},
        {"name": "Master Bedroom Suite", "area_sqft": master_bed_sqft, "dimensions": f"{math.sqrt(master_bed_sqft*1.2):.1f} ft x {math.sqrt(master_bed_sqft/1.2):.1f} ft", "floor": "1st Floor" if floors > 1 else "Ground Floor", "type": "Bedroom"},
        {"name": "Modular Kitchen & Utility", "area_sqft": kitchen_sqft, "dimensions": f"{math.sqrt(kitchen_sqft*1.1):.1f} ft x {math.sqrt(kitchen_sqft/1.1):.1f} ft", "floor": "Ground Floor", "type": "Kitchen"},
        {"name": "Attached Bathrooms & Toilet", "area_sqft": baths_sqft, "dimensions": f"{math.sqrt(baths_sqft*1.4):.1f} ft x {math.sqrt(baths_sqft/1.4):.1f} ft", "floor": "All Floors", "type": "Bathroom"},
        {"name": "Covered Balcony & Sit-out Terrace", "area_sqft": balcony_sqft, "dimensions": f"{math.sqrt(balcony_sqft*1.5):.1f} ft x {math.sqrt(balcony_sqft/1.5):.1f} ft", "floor": "Upper Floor" if floors > 1 else "Ground Floor", "type": "Balcony"},
    ]

    if bhk_type in ['3BHK', '4BHK', '5BHK']:
        rooms.insert(2, {"name": "Guest / Family Bedroom 2", "area_sqft": other_beds_sqft, "dimensions": f"{math.sqrt(other_beds_sqft*1.15):.1f} ft x {math.sqrt(other_beds_sqft/1.15):.1f} ft", "floor": "1st Floor" if floors > 1 else "Ground Floor", "type": "Bedroom"})

    return rooms

def calculate_material_quantities(sqft):
    cement_bags = round(sqft * 0.42)
    steel_tons = round(sqft * 0.0036, 2)
    sand_cuft = round(sqft * 1.25)
    aggregate_cuft = round(sqft * 1.38)
    bricks_count = round(sqft * 14.2)
    tiles_sqft = round(sqft * 1.18)
    paint_liters = round(sqft * 0.14)

    return {
        "cement_bags": cement_bags,
        "steel_tons": steel_tons,
        "sand_cuft": sand_cuft,
        "aggregate_cuft": aggregate_cuft,
        "bricks_count": bricks_count,
        "tiles_sqft": tiles_sqft,
        "paint_liters": paint_liters,
    }

def calculate_construction_cost(sqft=2200, floors=2, style='MODERN', roof_type='FLAT', finish_grade='PREMIUM', region='Mumbai MMR / Maharashtra'):
    """
    Computes dynamic construction cost estimate in Indian Rupees (₹)
    varying directly based on Admin Panel Labour Charges and workforce capacity.
    """
    sqft = max(500, min(15000, int(sqft)))
    floors = max(1, min(5, int(floors)))

    reg_mult = INDIAN_REGIONS.get(region, 1.15)
    base_sqft_rate = GRADE_BASE_RATES_INR.get(finish_grade, 2650)
    style_info = STYLE_FACTORS.get(style, STYLE_FACTORS['MODERN'])
    roof_info = ROOF_FACTORS.get(roof_type, ROOF_FACTORS['FLAT'])

    adjusted_sqft_rate = round(base_sqft_rate * reg_mult * style_info['mat_mult'] * roof_info['rate_mult'])

    subtotal_inr = sqft * adjusted_sqft_rate

    # Dynamic Admin Labour Rates Calculations
    rcc_labour_cost = round(sqft * ADMIN_LABOUR_CONFIG['rcc_structure_rate_sqft'])
    brick_labour_cost = round(sqft * ADMIN_LABOUR_CONFIG['brickwork_plaster_rate_sqft'])
    tile_labour_cost = round(sqft * ADMIN_LABOUR_CONFIG['tile_flooring_rate_sqft'])
    mep_labour_cost = round(sqft * ADMIN_LABOUR_CONFIG['plumbing_elec_rate_sqft'])
    paint_labour_cost = round(sqft * ADMIN_LABOUR_CONFIG['painting_rate_sqft'])

    total_labor_inr = rcc_labour_cost + brick_labour_cost + tile_labour_cost + mep_labour_cost + paint_labour_cost
    total_material_inr = subtotal_inr - total_labor_inr

    gst_and_contingency = subtotal_inr * 0.10
    grand_total_inr = subtotal_inr + gst_and_contingency

    # Work Completion Duration Calculations
    daily_output = ADMIN_LABOUR_CONFIG.get('daily_mason_team_output_sqft', 25)
    working_days = math.ceil((sqft * floors) / daily_output) if daily_output > 0 else 60
    total_timeline_days = math.ceil(working_days * 1.35)  # includes 35% curing & finish buffer
    total_timeline_months = round(total_timeline_days / 30, 1)

    daily_team_wage = ADMIN_LABOUR_CONFIG['head_mason_daily_wage'] + (ADMIN_LABOUR_CONFIG['helper_daily_wage'] * 3)

    if grand_total_inr >= 10000000:
        formatted_total = f"₹ {(grand_total_inr / 10000000):.2f} Cr"
    else:
        formatted_total = f"₹ {(grand_total_inr / 100000):.2f} Lakhs"

    bhk_label = "2 BHK" if sqft < 1400 else ("3 BHK" if sqft < 2800 else ("4 BHK Villa" if sqft < 4500 else "5 BHK Luxury Estate"))
    floor_plan_rooms = generate_dynamic_floor_plan(sqft, floors, bhk_label)
    material_quantities = calculate_material_quantities(sqft)

    breakdown = [
        {
            "category": "RCC Super-Structure & Centering Labour",
            "cost_inr": rcc_labour_cost,
            "percentage": round((rcc_labour_cost / total_labor_inr) * 100, 1) if total_labor_inr else 35.0,
            "details": f"Centering & RCC Framing @ ₹ {ADMIN_LABOUR_CONFIG['rcc_structure_rate_sqft']} / sq ft."
        },
        {
            "category": "Brickwork & Plastering Labour",
            "cost_inr": brick_labour_cost,
            "percentage": round((brick_labour_cost / total_labor_inr) * 100, 1) if total_labor_inr else 25.0,
            "details": f"Wall masonry & plastering @ ₹ {ADMIN_LABOUR_CONFIG['brickwork_plaster_rate_sqft']} / sq ft."
        },
        {
            "category": "Plumbing & Electrical Technical Labour",
            "cost_inr": mep_labour_cost,
            "percentage": round((mep_labour_cost / total_labor_inr) * 100, 1) if total_labor_inr else 20.0,
            "details": f"Technical MEP installation @ ₹ {ADMIN_LABOUR_CONFIG['plumbing_elec_rate_sqft']} / sq ft."
        },
        {
            "category": "Tile Laying & Flooring Labour",
            "cost_inr": tile_labour_cost,
            "percentage": round((tile_labour_cost / total_labor_inr) * 100, 1) if total_labor_inr else 12.0,
            "details": f"Tile & marble fitting @ ₹ {ADMIN_LABOUR_CONFIG['tile_flooring_rate_sqft']} / sq ft."
        },
        {
            "category": "Painting & Finishing Labour",
            "cost_inr": paint_labour_cost,
            "percentage": round((paint_labour_cost / total_labor_inr) * 100, 1) if total_labor_inr else 8.0,
            "details": f"Emulsion & waterproofing @ ₹ {ADMIN_LABOUR_CONFIG['painting_rate_sqft']} / sq ft."
        },
    ]

    return {
        "sqft": sqft,
        "floors": floors,
        "bhk_label": bhk_label,
        "style": style,
        "roof_type": roof_type,
        "finish_grade": finish_grade,
        "region": region,
        "currency": "INR",
        "currency_symbol": "₹",
        "summary": {
            "rate_per_sqft_inr": adjusted_sqft_rate,
            "total_material_cost_inr": round(total_material_inr),
            "total_labor_cost_inr": round(total_labor_inr),
            "subtotal_inr": round(subtotal_inr),
            "contingency_inr": round(gst_and_contingency),
            "grand_total_inr": round(grand_total_inr),
            "formatted_grand_total": formatted_total,
        },
        "labor_duration_metrics": {
            "working_days_to_finish": working_days,
            "total_timeline_days": total_timeline_days,
            "total_timeline_months": total_timeline_months,
            "daily_output_sqft": daily_output,
            "daily_team_wage_inr": daily_team_wage,
            "shift_hours": ADMIN_LABOUR_CONFIG['shift_hours'],
            "head_mason_wage": ADMIN_LABOUR_CONFIG['head_mason_daily_wage'],
            "helper_wage": ADMIN_LABOUR_CONFIG['helper_daily_wage']
        },
        "material_quantities": material_quantities,
        "floor_plan_rooms": floor_plan_rooms,
        "breakdown": breakdown
    }

