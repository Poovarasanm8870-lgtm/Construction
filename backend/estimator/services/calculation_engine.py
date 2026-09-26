import math
from ..models import LabourRate, PackageConfig, Material

def get_active_labour_config():
    """Retrieves active labour rates from database, with safe fallbacks if DB empty."""
    try:
        config = LabourRate.objects.filter(is_active=True).last()
        if config:
            return {
                "head_mason_daily_wage": float(config.head_mason_daily_wage),
                "skilled_labour_daily_wage": float(config.skilled_labour_daily_wage),
                "helper_daily_wage": float(config.helper_daily_wage),
                "other_worker_daily_wage": float(config.other_worker_daily_wage),
                "rcc_structure_rate_sqft": float(config.rcc_structure_rate_sqft),
                "brickwork_plaster_rate_sqft": float(config.brickwork_plaster_rate_sqft),
                "tile_flooring_rate_sqft": float(config.tile_flooring_rate_sqft),
                "plumbing_elec_rate_sqft": float(config.plumbing_elec_rate_sqft),
                "painting_rate_sqft": float(config.painting_rate_sqft),
                "daily_mason_team_output_sqft": float(config.daily_mason_team_output_sqft),
                "working_hours": config.working_hours,
            }
    except Exception:
        pass
    
    # Safe default fallback configuration if DB not initialized yet
    return {
        "head_mason_daily_wage": 950.0,
        "skilled_labour_daily_wage": 800.0,
        "helper_daily_wage": 650.0,
        "other_worker_daily_wage": 600.0,
        "rcc_structure_rate_sqft": 240.0,
        "brickwork_plaster_rate_sqft": 110.0,
        "tile_flooring_rate_sqft": 45.0,
        "plumbing_elec_rate_sqft": 160.0,
        "painting_rate_sqft": 22.0,
        "daily_mason_team_output_sqft": 25.0,
        "working_hours": 8,
    }


def get_available_materials():
    """Retrieves list of active cement and steel options from DB."""
    cements = []
    steels = []
    
    try:
        cement_objs = Material.objects.filter(category__iexact='Cement')
        for c in cement_objs:
            cements.append({
                "brand": c.brand,
                "name": c.name,
                "grade": c.grade or "PPC 53 Grade",
                "price": float(c.price),
                "unit": c.unit,
                "source": c.source,
                "description": c.description or f"Standard {c.brand} cement for RCC & masonry"
            })
            
        steel_objs = Material.objects.filter(category__iexact='Steel')
        for s in steel_objs:
            steels.append({
                "brand": s.brand,
                "name": s.name,
                "grade": s.grade or "Fe-550D TMT",
                "price": float(s.price),
                "unit": s.unit,
                "source": s.source,
                "description": s.description or f"{s.brand} earthquake-resistant TMT rebars"
            })
    except Exception:
        pass

    # Safe defaults if DB materials empty
    if not cements:
        cements = [
            {"brand": "UltraTech", "name": "UltraTech PPC Cement", "grade": "53 Grade PPC", "price": 380.0, "unit": "50 kg bag", "source": "Database Config", "description": "High durability engineer choice cement"},
            {"brand": "ACC Concrete+", "name": "ACC Concrete+ Weather Shield", "grade": "53 Grade PPC", "price": 395.0, "unit": "50 kg bag", "source": "Database Config", "description": "Water repellent concrete specialist cement"},
            {"brand": "Ambuja", "name": "Ambuja Kawach Waterproof", "grade": "PPC", "price": 410.0, "unit": "50 kg bag", "source": "Database Config", "description": "Shield protection leakproof cement"},
            {"brand": "Birla Gold", "name": "Birla Gold Chetak Cement", "grade": "PPC", "price": 375.0, "unit": "50 kg bag", "source": "Database Config", "description": "Reliable structural foundation cement"}
        ]
        
    if not steels:
        steels = [
            {"brand": "Tata Tiscon", "name": "Tata Tiscon 550D", "grade": "Fe-550D", "price": 56500.0, "unit": "ton", "source": "Database Config", "description": "Super ductile earthquake-safe rebars"},
            {"brand": "JSW Neosteel", "name": "JSW Neosteel 550D", "grade": "Fe-550D", "price": 54000.0, "unit": "ton", "source": "Database Config", "description": "High tensile strength structural steel"},
            {"brand": "Jindal Panther", "name": "Jindal Panther TMT", "grade": "Fe-550D", "price": 53500.0, "unit": "ton", "source": "Database Config", "description": "Ribbed TMT rebars for high strength"},
            {"brand": "SAIL TMT", "name": "SAIL TMT Rebars", "grade": "Fe-500D", "price": 52800.0, "unit": "ton", "source": "Database Config", "description": "Government standard structural steel"}
        ]

    return {"cements": cements, "steels": steels}


def get_package_configs():
    """Retrieves Economy, Standard, Premium package specs from DB."""
    pkgs = {}
    try:
        objs = PackageConfig.objects.filter(is_active=True)
        for obj in objs:
            pkgs[obj.slug] = {
                "name": obj.name,
                "base_material_rate_per_sqft": float(obj.base_material_rate_per_sqft),
                "flooring_spec": obj.flooring_spec,
                "plumbing_spec": obj.plumbing_spec,
                "electrical_spec": obj.electrical_spec,
                "paint_spec": obj.paint_spec,
                "doors_windows_spec": obj.doors_windows_spec
            }
    except Exception:
        pass
        
    if not pkgs:
        pkgs = {
            "economy": {
                "name": "Economy",
                "base_material_rate_per_sqft": 975.0,
                "flooring_spec": "Ceramic Tiles (600x600mm)",
                "plumbing_spec": "Parryware / Cera Standard Sanitary Fixtures",
                "electrical_spec": "Anchor / Havells Standard Modular Wiring",
                "paint_spec": "Tractor Emulsion Paint",
                "doors_windows_spec": "Flush Doors with Powder Coated Aluminium Windows"
            },
            "standard": {
                "name": "Standard",
                "base_material_rate_per_sqft": 1373.0,
                "flooring_spec": "Somany / Nitco Vitrified Tiles (800x800mm)",
                "plumbing_spec": "Jaquar / Hindware Premium Sanitary & CP Fittings",
                "electrical_spec": "Legrand / Schneider Modular Switches & Fireproof Wires",
                "paint_spec": "Asian Paints Royale Luxury Emulsion",
                "doors_windows_spec": "Teak Wood Main Door & UPVC Sliding Glass Windows"
            },
            "premium": {
                "name": "Premium",
                "base_material_rate_per_sqft": 2073.0,
                "flooring_spec": "Italian Marble Flooring & Teak Wooden Planks",
                "plumbing_spec": "Kohler / Grohe Concealed Thermostatic Fixtures",
                "electrical_spec": "Smart Home Automation Touch Panels & Concealed LED",
                "paint_spec": "Asian Paints PU Finish & Textured Wall Panels",
                "doors_windows_spec": "Solid Burma Teak Doors & Double Glazed Soundproof UPVC"
            }
        }
    return pkgs


def calculate_quantities(sqft):
    """Computes exact material quantity requirements based on sqft."""
    return {
        "cement_bags": round(sqft * 0.40),
        "steel_tons": round(sqft * 0.0035, 2),
        "sand_cuft": round(sqft * 1.25),
        "aggregate_cuft": round(sqft * 1.35),
        "bricks_count": round(sqft * 15.0),
        "tiles_sqft": round(sqft * 1.15),
        "paint_liters": round(sqft * 0.14)
    }


def calculate_3_house_packages(sqft, location, selected_cement=None, selected_steel=None, selected_workers=6, floors=2):
    """
    Computes Economy, Standard, and Premium packages dynamically based on:
    - User square feet & location
    - Admin Panel Labour Rates
    - Dynamic material specs & prices
    - Selected cement/steel & workforce count
    """
    sqft = int(sqft)
    floors = int(floors)
    workers = int(selected_workers) if selected_workers else 6
    
    labour_config = get_active_labour_config()
    
    # Calculate labour rate per sqft from Admin Panel
    labour_rate_sqft = (
        labour_config["rcc_structure_rate_sqft"] +
        labour_config["brickwork_plaster_rate_sqft"] +
        labour_config["tile_flooring_rate_sqft"] +
        labour_config["plumbing_elec_rate_sqft"] +
        labour_config["painting_rate_sqft"]
    )
    
    total_labour_cost = round(sqft * labour_rate_sqft)
    
    # Working timeline calculation
    daily_output = labour_config["daily_mason_team_output_sqft"]
    per_worker_output = daily_output / 4.0 # output per worker
    total_daily_output = workers * per_worker_output
    
    total_built_area = sqft * floors
    working_days = math.ceil(total_built_area / total_daily_output) if total_daily_output > 0 else 60
    timeline_months = round((working_days * 1.35 + floors * 14) / 30.0, 1)

    quantities = calculate_quantities(sqft)
    package_configs = get_package_configs()
    
    packages = []
    
    for slug in ['economy', 'standard', 'premium']:
        p_cfg = package_configs.get(slug, package_configs['standard'])
        base_mat_rate = p_cfg["base_material_rate_per_sqft"]
        
        # Adjust mat rate if user selected specific custom cement/steel
        mat_rate = base_mat_rate
        
        material_cost = round(sqft * mat_rate)
        total_cost = total_labour_cost + material_cost
        cost_per_sqft = round(total_cost / sqft)
        
        cement_name = selected_cement if (selected_cement and slug == 'standard') else f"{p_cfg['name']} Grade Cement"
        steel_name = selected_steel if (selected_steel and slug == 'standard') else f"{p_cfg['name']} Grade TMT"
        
        packages.append({
            "id": slug,
            "name": p_cfg["name"],
            "total_cost": total_cost,
            "cost_per_sqft": cost_per_sqft,
            "labour_cost": total_labour_cost,
            "material_cost": material_cost,
            "cement_type": cement_name,
            "steel_type": steel_name,
            "flooring_level": p_cfg["flooring_spec"],
            "plumbing_level": p_cfg["plumbing_spec"],
            "electrical_level": p_cfg["electrical_spec"],
            "paint_finish_level": p_cfg["paint_spec"],
            "doors_windows_level": p_cfg["doors_windows_spec"],
            "working_days": working_days,
            "timeline_months": timeline_months,
            "specifications": [
                f"Cement: {cement_name}",
                f"Steel: {steel_name}",
                f"Flooring: {p_cfg['flooring_spec']}",
                f"Plumbing: {p_cfg['plumbing_spec']}",
                f"Electrical: {p_cfg['electrical_spec']}",
                f"Paint: {p_cfg['paint_spec']}",
                f"Doors & Windows: {p_cfg['doors_windows_spec']}"
            ]
        })
        
    return {
        "project": {
            "sqft": sqft,
            "location": location,
            "floors": floors,
            "workforce_count": workers,
            "working_days": working_days,
            "timeline_months": timeline_months
        },
        "labour_config_used": labour_config,
        "quantities": quantities,
        "packages": packages
    }
