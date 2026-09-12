import math

# Indian Regional Cost Multipliers (Base: National Average 1.0)
INDIAN_REGIONS = {
    'Mumbai MMR / Maharashtra': 1.30,
    'Delhi NCR / Gurgaon / Noida': 1.22,
    'Bengaluru / Karnataka': 1.18,
    'Hyderabad / Telangana': 1.12,
    'Chennai / Tamil Nadu': 1.10,
    'Pune / Maharashtra': 1.15,
    'Kolkata / West Bengal': 1.02,
    'Tier-2 & Tier-3 Cities': 0.90,
}

# Base Cost per Sq Ft in INR based on Material Grade
GRADE_BASE_RATES_INR = {
    'STANDARD': 1750,   # Basic quality tiles, standard cement, local bricks, basic paint
    'PREMIUM': 2650,    # Branded tiles (Somany/Kajaria), Tata Tiscon steel, Asian Paints Royale, modular switches
    'LUXURY': 4200,     # Italian Marble, VRV HVAC, Automation, Double Glazed Windows, Teak wood doors
}

STYLE_FACTORS = {
    'MODERN': {'mat_mult': 1.15, 'desc': 'Glass curtain facade, sleek steel spans & open floor plan'},
    'COLONIAL': {'mat_mult': 1.10, 'desc': 'Exposed brick masonry, archways & classical sloped rooflines'},
    'MINIMALIST': {'mat_mult': 1.05, 'desc': 'Raw board-formed concrete, exposed textures & flush doors'},
    'NORDIC': {'mat_mult': 1.12, 'desc': 'Sustainable heavy timber wood, high insulation & gabled roof'},
    'FUTURISTIC': {'mat_mult': 1.25, 'desc': 'Solar glass roof skin, smart automation & curved geometry'},
}

ROOF_FACTORS = {
    'FLAT': {'rate_mult': 1.0},
    'GABLED': {'rate_mult': 1.12},
    'HIP': {'rate_mult': 1.18},
    'SLANTED': {'rate_mult': 1.08},
}

def generate_dynamic_floor_plan(sqft, floors, bhk_type):
    """
    Generates exact room dimension layout specs based on total sqft footprint.
    """
    usable_sqft = sqft * 0.85  # 15% wall thickness & passage deduction
    
    # Calculate approximate room breakdown
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
    """
    Calculates estimated physical material quantities based on Indian Civil Engineering thumb rules:
    - Cement: ~0.4 bags per sq ft
    - Steel (TMT Rebar): ~3.5 kg per sq ft (0.0035 Tons per sq ft)
    - River Sand / M-Sand: ~1.2 cu ft per sq ft
    - Aggregates (20mm/10mm): ~1.35 cu ft per sq ft
    - Bricks / AAC Blocks: ~14 bricks per sq ft
    - Flooring Tiles: ~1.15 sq ft per sq ft (includes cutting wastage)
    """
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
    Computes dynamic construction cost estimate in Indian Rupees (₹).
    """
    sqft = max(500, min(15000, int(sqft)))
    floors = max(1, min(5, int(floors)))

    reg_mult = INDIAN_REGIONS.get(region, 1.15)
    base_sqft_rate = GRADE_BASE_RATES_INR.get(finish_grade, 2650)
    style_info = STYLE_FACTORS.get(style, STYLE_FACTORS['MODERN'])
    roof_info = ROOF_FACTORS.get(roof_type, ROOF_FACTORS['FLAT'])

    # Multiplied base rate per sq ft in INR
    adjusted_sqft_rate = round(base_sqft_rate * reg_mult * style_info['mat_mult'] * roof_info['rate_mult'])

    subtotal_inr = sqft * adjusted_sqft_rate

    # Component Percentages
    foundation_inr = subtotal_inr * 0.18
    structure_inr = subtotal_inr * 0.28
    brickwork_plaster_inr = subtotal_inr * 0.16
    flooring_finishes_inr = subtotal_inr * 0.18
    mep_electrical_plumbing_inr = subtotal_inr * 0.12
    painting_waterproofing_inr = subtotal_inr * 0.08

    # Materials vs Labor Split (Standard Indian ratio: ~60% Material, ~40% Labor)
    total_material_inr = subtotal_inr * 0.60
    total_labor_inr = subtotal_inr * 0.40

    gst_and_contingency = subtotal_inr * 0.10  # 10% for Architect Fee, Approvals & Contingency Fund
    grand_total_inr = subtotal_inr + gst_and_contingency

    # Format human friendly Indian currency string
    if grand_total_inr >= 10000000:
        formatted_total = f"₹ {(grand_total_inr / 10000000):.2f} Cr"
    else:
        formatted_total = f"₹ {(grand_total_inr / 100000):.2f} Lakhs"

    bhk_label = "2 BHK" if sqft < 1400 else ("3 BHK" if sqft < 2800 else ("4 BHK Villa" if sqft < 4500 else "5 BHK Luxury Estate"))
    floor_plan_rooms = generate_dynamic_floor_plan(sqft, floors, bhk_label)
    material_quantities = calculate_material_quantities(sqft)

    breakdown = [
        {
            "category": "Foundation & Sub-Structure Work",
            "cost_inr": round(foundation_inr),
            "percentage": 18.0,
            "details": f"Excavation, PCC, RCC footing, anti-termite treatment for {sqft/floors:,.0f} sq ft footprint."
        },
        {
            "category": "RCC Super-Structure (Columns, Beams, Slab)",
            "cost_inr": round(structure_inr),
            "percentage": 28.0,
            "details": f"Tata/JSW TMT steel reinforcement & Ready-Mix Concrete for {floors} floors."
        },
        {
            "category": "Brickwork, AAC Blocks & Plastering",
            "cost_inr": round(brickwork_plaster_inr),
            "percentage": 16.0,
            "details": "9-inch exterior brick walls, 4-inch interior partitions, double-coat plastering."
        },
        {
            "category": "Flooring, Wall Cladding & Marble",
            "cost_inr": round(flooring_finishes_inr),
            "percentage": 18.0,
            "details": f"{finish_grade.title()} grade vitrified tiles / marble flooring, granite kitchen counter."
        },
        {
            "category": "Electrical Wiring & Plumbing Fixtures",
            "cost_inr": round(mep_electrical_plumbing_inr),
            "percentage": 12.0,
            "details": "Concealed copper wiring (Finolex/Polycab), CPVC pipes (Astral), premium sanitary ware."
        },
        {
            "category": "Painting, Waterproofing & Finishing",
            "cost_inr": round(painting_waterproofing_inr),
            "percentage": 8.0,
            "details": "Terrace waterproofing membrane, Asian Paints Royale exterior & interior finish."
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
        "material_quantities": material_quantities,
        "floor_plan_rooms": floor_plan_rooms,
        "breakdown": breakdown
    }
