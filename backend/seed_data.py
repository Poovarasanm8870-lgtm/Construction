import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'constructai.settings')
django.setup()

from estimator.models import LabourRate, PackageConfig, Material

def seed():
    # 1. Labour Rate Initial Seed
    if not LabourRate.objects.filter(is_active=True).exists():
        LabourRate.objects.create(
            head_mason_daily_wage=950.00,
            skilled_labour_daily_wage=800.00,
            helper_daily_wage=650.00,
            other_worker_daily_wage=600.00,
            rcc_structure_rate_sqft=240.00,
            brickwork_plaster_rate_sqft=110.00,
            tile_flooring_rate_sqft=45.00,
            plumbing_elec_rate_sqft=160.00,
            painting_rate_sqft=22.00,
            daily_mason_team_output_sqft=25.00,
            working_hours=8,
            is_active=True
        )
        print("[OK] Seeded LabourRate model")


    # 2. Package Configurations Seed
    packages_data = [
        {
            "name": "Economy",
            "slug": "economy",
            "base_material_rate_per_sqft": 975.00,
            "flooring_spec": "Ceramic Tiles (600x600mm)",
            "plumbing_spec": "Parryware / Cera Standard Sanitary Fixtures",
            "electrical_spec": "Anchor / Havells Standard Modular Wiring",
            "paint_spec": "Tractor Emulsion Paint",
            "doors_windows_spec": "Flush Doors with Powder Coated Aluminium Windows"
        },
        {
            "name": "Standard",
            "slug": "standard",
            "base_material_rate_per_sqft": 1373.00,
            "flooring_spec": "Somany / Nitco Vitrified Tiles (800x800mm)",
            "plumbing_spec": "Jaquar / Hindware Premium Sanitary & CP Fittings",
            "electrical_spec": "Legrand / Schneider Modular Switches & Fireproof Wires",
            "paint_spec": "Asian Paints Royale Luxury Emulsion",
            "doors_windows_spec": "Teak Wood Main Door & UPVC Sliding Glass Windows"
        },
        {
            "name": "Premium",
            "slug": "premium",
            "base_material_rate_per_sqft": 2073.00,
            "flooring_spec": "Italian Marble Flooring & Teak Wooden Planks",
            "plumbing_spec": "Kohler / Grohe Concealed Thermostatic Fixtures",
            "electrical_spec": "Smart Home Automation Touch Panels & Concealed LED",
            "paint_spec": "Asian Paints PU Finish & Textured Wall Panels",
            "doors_windows_spec": "Solid Burma Teak Doors & Double Glazed Soundproof UPVC"
        }
    ]
    for pkg in packages_data:
        PackageConfig.objects.get_or_create(slug=pkg['slug'], defaults=pkg)
    print("[OK] Seeded PackageConfig models")


    # 3. Initial Materials Seed
    materials_data = [
        # Cement
        {"name": "UltraTech PPC Cement", "category": "Cement", "brand": "UltraTech", "grade": "53 Grade PPC", "price": 380.00, "unit": "50 kg bag", "source": "Admin Database", "description": "High durability engineer choice cement"},
        {"name": "ACC Concrete+ Weather Shield", "category": "Cement", "brand": "ACC Concrete+", "grade": "53 Grade PPC", "price": 395.00, "unit": "50 kg bag", "source": "Admin Database", "description": "Water repellent concrete specialist cement"},
        {"name": "Ambuja Kawach Waterproof", "category": "Cement", "brand": "Ambuja", "grade": "PPC", "price": 410.00, "unit": "50 kg bag", "source": "Admin Database", "description": "Shield protection leakproof cement"},
        {"name": "Birla Gold Chetak Cement", "category": "Cement", "brand": "Birla Gold", "grade": "PPC", "price": 375.00, "unit": "50 kg bag", "source": "Admin Database", "description": "Reliable structural foundation cement"},
        # Steel
        {"name": "Tata Tiscon 550D TMT", "category": "Steel", "brand": "Tata Tiscon", "grade": "Fe-550D", "price": 56500.00, "unit": "ton", "source": "Admin Database", "description": "Super ductile earthquake-safe rebars"},
        {"name": "JSW Neosteel 550D TMT", "category": "Steel", "brand": "JSW Neosteel", "grade": "Fe-550D", "price": 54000.00, "unit": "ton", "source": "Admin Database", "description": "High tensile strength structural steel"},
        {"name": "Jindal Panther TMT", "category": "Steel", "brand": "Jindal Panther", "grade": "Fe-550D", "price": 53500.00, "unit": "ton", "source": "Admin Database", "description": "Ribbed TMT rebars for high strength"},
        {"name": "SAIL TMT Rebars", "category": "Steel", "brand": "SAIL TMT", "grade": "Fe-500D", "price": 52800.00, "unit": "ton", "source": "Admin Database", "description": "Government standard structural steel"}
    ]
    for mat in materials_data:
        Material.objects.get_or_create(name=mat['name'], defaults=mat)
    print("[OK] Seeded Material models")


if __name__ == '__main__':
    seed()
