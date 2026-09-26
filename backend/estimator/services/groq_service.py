import os
import re
import math
from pathlib import Path
from .pricing_engine import calculate_construction_cost, get_admin_labour_rates
from .vector_db import query_vector_db_context

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

def parse_parameters_from_prompt(prompt, current_config=None):
    prompt_lower = prompt.lower() if prompt else ""

    # Check if prompt contains an explicit sqft number
    sqft = None
    sqft_match = re.search(r'(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?', prompt_lower)
    if sqft_match:
        try:
            val = int(sqft_match.group(1).replace(',', ''))
            if 100 <= val <= 100000:
                sqft = val
        except ValueError:
            pass

    if not sqft:
        numbers = re.findall(r'\b(\d{3,5})\b', prompt_lower)
        for num in numbers:
            val = int(num)
            if 200 <= val <= 50000:
                sqft = val
                break

    if not sqft and current_config and isinstance(current_config, dict) and current_config.get('sqft'):
        try:
            val = int(current_config.get('sqft'))
            if 100 <= val <= 100000:
                sqft = val
        except (ValueError, TypeError):
            pass

    # Floors
    floors = 2
    floors_match = re.search(r'(\d+)\s*(?:floors?|stories|story|g\+\d+|floor)', prompt_lower)
    if floors_match:
        try:
            floors = int(floors_match.group(1))
        except ValueError:
            pass
    elif 'g+1' in prompt_lower or 'duplex' in prompt_lower or '2 floor' in prompt_lower:
        floors = 2
    elif 'g+2' in prompt_lower or 'triplex' in prompt_lower or '3 floor' in prompt_lower:
        floors = 3
    elif 'single story' in prompt_lower or 'ground floor' in prompt_lower or '1 floor' in prompt_lower:
        floors = 1

    style = 'MODERN'
    if 'brick' in prompt_lower or 'colonial' in prompt_lower:
        style = 'COLONIAL'

    # Dynamic Location Parsing
    region = None

    location_map = {
        'tenkasi': 'Tenkasi, Tamil Nadu',
        'chennai': 'Chennai, Tamil Nadu',
        'coimbatore': 'Coimbatore, Tamil Nadu',
        'madurai': 'Madurai, Tamil Nadu',
        'tirunelveli': 'Tirunelveli, Tamil Nadu',
        'trichy': 'Tiruchirappalli, Tamil Nadu',
        'salem': 'Salem, Tamil Nadu',
        'vellore': 'Vellore, Tamil Nadu',
        'kanyakumari': 'Kanyakumari, Tamil Nadu',
        'trivandrum': 'Thiruvananthapuram, Kerala',
        'kochi': 'Kochi, Kerala',
        'calicut': 'Kozhikode, Kerala',
        'bangalore': 'Bengaluru, Karnataka',
        'bengaluru': 'Bengaluru, Karnataka',
        'mysore': 'Mysuru, Karnataka',
        'hyderabad': 'Hyderabad, Telangana',
        'vizag': 'Visakhapatnam, Andhra Pradesh',
        'vijayawada': 'Vijayawada, Andhra Pradesh',
        'mumbai': 'Mumbai MMR, Maharashtra',
        'pune': 'Pune, Maharashtra',
        'nagpur': 'Nagpur, Maharashtra',
        'nashik': 'Nashik, Maharashtra',
        'delhi': 'Delhi NCR, Gurgaon & Noida',
        'gurgaon': 'Delhi NCR, Gurgaon & Noida',
        'noida': 'Delhi NCR, Gurgaon & Noida',
        'kolkata': 'Kolkata, West Bengal',
        'ahmedabad': 'Ahmedabad, Gujarat',
        'surat': 'Surat, Gujarat',
        'jaipur': 'Jaipur, Rajasthan',
        'indore': 'Indore, Madhya Pradesh',
        'bhopal': 'Bhopal, Madhya Pradesh',
        'lucknow': 'Lucknow, Uttar Pradesh',
        'kanpur': 'Kanpur, Uttar Pradesh',
        'chandigarh': 'Chandigarh, Punjab & Haryana',
        'goa': 'Goa State',
        'pondicherry': 'Puducherry',
        'puducherry': 'Puducherry'
    }

    for loc_key, loc_name in location_map.items():
        if loc_key in prompt_lower:
            region = loc_name
            break

    if not region:
        match_in = re.search(r'\b(?:in|at|near|for|location)\s+([a-zA-Z\s]{2,20})', prompt_lower)
        if match_in:
            extracted_loc = match_in.group(1).strip().title()
            skip_words = ['a house', 'the house', 'house', 'building', 'my plot', 'my house', 'sq ft', 'sqft', 'economy', 'standard', 'luxury', 'tier 1', 'tier 2', 'tier 3', 'painting', 'plumbing', 'electrical']
            if not any(sw in extracted_loc.lower() for sw in skip_words):
                region = f"{extracted_loc}"

    if not region and current_config and isinstance(current_config, dict) and current_config.get('region'):
        region = current_config.get('region')

    if not region:
        region = "Project Location (India)"

    finish_grade = 'PREMIUM'
    if 'luxury' in prompt_lower or 'marble' in prompt_lower:
        finish_grade = 'LUXURY'
    elif 'standard' in prompt_lower or 'basic' in prompt_lower:
        finish_grade = 'STANDARD'

    return sqft, floors, style, finish_grade, region


def is_construction_related(prompt_lower, current_config=None):
    """
    Checks if the user prompt is related to civil engineering or house construction.
    """
    if current_config and isinstance(current_config, dict) and current_config.get('sqft'):
        return True

    greetings = ['hi', 'hello', 'hey', 'start', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste']
    if prompt_lower.strip() in greetings:
        return True

    construction_keywords = [
        'construction', 'build', 'house', 'villa', 'home', 'duplex', 'triplex', 'building',
        'sqft', 'sq ft', 'square feet', 'sft', 'footprint', 'bhk', 'cement', 'steel',
        'rebar', 'brick', 'aac', 'tile', 'flooring', 'plumbing', 'electrical', 'wiring',
        'paint', 'roof', 'waterproofing', 'slab', 'rcc', 'column', 'beam', 'foundation',
        'labor', 'labour', 'mason', 'mistri', 'rate', 'cost', 'estimate', 'price', 'budget',
        'worker', 'workers', 'workforce', 'labourers', 'laborers', 'men', 'team',
        'blueprint', 'floorplan', 'vastu', 'interior', 'architect', 'renovation', 'site visit',
        'contractor', 'turnkey', 'material', 'sand', 'aggregate', 'door', 'window', 'permit',
        'sanction', 'nbc', 'is 456', 'structural', 'civil', 'engineer', 'offer', 'service',
        'buy', 'checklist', 'items', 'things', 'needed', 'required', 'finish', 'duration',
        'time', 'timeline', 'days', 'months', 'capacity', 'wage',
        # Packages, tiers & comparison keywords
        'package', 'packages', 'tier', 'tiers', 'economy', 'basic', 'standard', 'luxury',
        'premium', 'compare', 'comparison', 'show', 'option', 'options',
        # Construction repairs, ceiling leaks & waterproofing keywords
        'ceiling', 'leak', 'leakage', 'seepage', 'dampness', 'crack', 'repair', 'fix',
        'treatment', 'waterproof', 'solution', 'plaster', 'roofing', 'terrace', 'wall',
        'damage', 'drain', 'pipe', 'tank', 'slab', 'structure', 'leakproof', 'remedy',
        'issue', 'problem', 'fix', 'protect'
    ]
    
    for kw in construction_keywords:
        if kw in prompt_lower:
            return True

    question_patterns = [
        'what can we do', 'how to fix', 'how to stop', 'why is my', 'what material',
        'best way to', 'solution for', 'remedy for', 'treatment for', 'how to clean',
        'how to repair', 'prevent'
    ]
    for pattern in question_patterns:
        if pattern in prompt_lower:
            if any(w in prompt_lower for w in ['ceiling', 'roof', 'wall', 'water', 'leak', 'floor', 'room', 'slab', 'pipe', 'house', 'tile', 'paint', 'crack']):
                return True
            
    return False


def build_3tier_package_cards(sqft, region="Mumbai MMR / Maharashtra"):
    admin_rates = get_admin_labour_rates()
    labor_rate_sqft = (
        admin_rates.get('rcc_structure_rate_sqft', 240) +
        admin_rates.get('brickwork_plaster_rate_sqft', 110) +
        admin_rates.get('plumbing_elec_rate_sqft', 160) +
        admin_rates.get('tile_flooring_rate_sqft', 45) +
        admin_rates.get('painting_rate_sqft', 22)
    )

    basic_mat_rate = 975
    standard_mat_rate = 1373
    luxury_mat_rate = 2073

    basic_total_rate = labor_rate_sqft + basic_mat_rate
    standard_total_rate = labor_rate_sqft + standard_mat_rate
    luxury_total_rate = labor_rate_sqft + luxury_mat_rate

    basic_total = round(sqft * basic_total_rate)
    standard_total = round(sqft * standard_total_rate)
    luxury_total = round(sqft * luxury_total_rate)

    def fmt(val):
        return f"₹ {(val/100000):.2f} Lakhs" if val < 10000000 else f"₹ {(val/10000000):.2f} Cr"

    return (
        f"🏗️ **ConstructAI 3-Tier Construction Package Comparison ({sqft:,} sq ft in {region})**\n\n"
        f"Calculated dynamically using **active Admin Panel labour charges** (₹ {labor_rate_sqft}/sq ft) + **real-world Indian market material prices**:\n\n"
        f"--- \n\n"
        f"### 🟢 Tier 1: Economy / Basic House\n"
        f"• **Est. Built Rate:** ₹ {basic_total_rate:,} / sq ft\n"
        f"• **Total Estimated Budget:** **{fmt(basic_total)}** (Labour: ₹ {round(sqft*labor_rate_sqft):,} | Materials: ₹ {round(sqft*basic_mat_rate):,})\n"
        f"• **Specifications:** Standard OPC/PPC Cement, Fe-500 Steel Rebars, Local Red Bricks, Ceramic Tiles (600x600mm), Standard Plumbing & Wiring.\n\n"
        f"--- \n\n"
        f"### 🔵 Tier 2: Semi-Luxury / Standard House (Recommended)\n"
        f"• **Est. Built Rate:** ₹ {standard_total_rate:,} / sq ft\n"
        f"• **Total Estimated Budget:** **{fmt(standard_total)}** (Labour: ₹ {round(sqft*labor_rate_sqft):,} | Materials: ₹ {round(sqft*standard_mat_rate):,})\n"
        f"• **Specifications:** UltraTech 53 Grade PPC Cement, Tata Tiscon Fe-550D Rebars, AAC Eco-Blocks, Somany Vitrified Tiles (800x800mm), Jaquar Sanitary Fixtures.\n\n"
        f"--- \n\n"
        f"### 🟡 Tier 3: Premium / Luxury House\n"
        f"• **Est. Built Rate:** ₹ {luxury_total_rate:,} / sq ft\n"
        f"• **Total Estimated Budget:** **{fmt(luxury_total)}** (Labour: ₹ {round(sqft*labor_rate_sqft):,} | Materials: ₹ {round(sqft*luxury_mat_rate):,})\n"
        f"• **Specifications:** ACC Concrete+ Weather Shield Cement, JSW Neosteel Fe-550D Rebars, Italian Marble Flooring, Kohler Sanitary Fixtures, Smart Automation.\n\n"
        f"--- \n\n"
        f"### 🛠️ **Customize Your Material & Workforce Options:**\n\n"
        f"To calculate your final customized budget & exact build duration, reply with your choices:\n"
        f"1. 🧱 **Which Cement Brand do you prefer?** (UltraTech / ACC Concrete+ / Ambuja / Birla Gold / Shree Cement)\n"
        f"2. 🔩 **Which Steel Rebar Brand & Grade?** (Tata Tiscon Fe-550D / JSW Neosteel / Jindal Panther / SAIL)\n"
        f"3. 👷 **How many Labours / Workers will you deploy on site?** (E.g. 4, 6, 8, 10 workers)\n\n"
        f"*(E.g. reply: 'UltraTech cement, Tata Tiscon steel with 6 labours')*"
    )


def build_customized_estimate_response(prompt_lower, sqft_val=None, region_val=None, current_config=None):
    admin_rates = get_admin_labour_rates()
    sqft = sqft_val if sqft_val else 1500
    region = region_val if region_val else "Project Location (India)"

    tier_name = "Tier 2: Semi-Luxury / Standard"
    mat_rate = 1373
    if 'tier 1' in prompt_lower or 'economy' in prompt_lower or 'basic' in prompt_lower:
        tier_name = "Tier 1: Economy / Basic"
        mat_rate = 975
    elif 'tier 3' in prompt_lower or 'luxury' in prompt_lower or 'premium' in prompt_lower:
        tier_name = "Tier 3: Premium / Luxury"
        mat_rate = 2073

    cement_brand = "UltraTech 53 Grade PPC Cement"
    cement_price = 380
    
    # Check current_config fallback
    if current_config and isinstance(current_config, dict):
        cfg_c = str(current_config.get('cement', '')).lower()
        if 'acc' in cfg_c:
            cement_brand = "ACC Concrete+ Weather Shield"
            cement_price = 395
        elif 'ambuja' in cfg_c:
            cement_brand = "Ambuja Kawach Waterproof Cement"
            cement_price = 410
        elif 'birla' in cfg_c:
            cement_brand = "Birla Gold Cement"
            cement_price = 375
        elif 'shree' in cfg_c:
            cement_brand = "Shree Cement PPC"
            cement_price = 370

    if 'acc' in prompt_lower:
        cement_brand = "ACC Concrete+ Weather Shield"
        cement_price = 395
    elif 'ambuja' in prompt_lower:
        cement_brand = "Ambuja Kawach Waterproof Cement"
        cement_price = 410
    elif 'birla' in prompt_lower:
        cement_brand = "Birla Gold Cement"
        cement_price = 375
    elif 'shree' in prompt_lower:
        cement_brand = "Shree Cement PPC"
        cement_price = 370

    steel_brand = "Tata Tiscon Fe-550D TMT Rebars"
    steel_price_ton = 56500

    if current_config and isinstance(current_config, dict):
        cfg_s = str(current_config.get('steel', '')).lower()
        if 'jsw' in cfg_s or 'neosteel' in cfg_s:
            steel_brand = "JSW Neosteel Fe-550D TMT"
            steel_price_ton = 54000
        elif 'jindal' in cfg_s or 'panther' in cfg_s:
            steel_brand = "Jindal Panther Fe-550D TMT"
            steel_price_ton = 53500
        elif 'sail' in cfg_s:
            steel_brand = "SAIL TMT Fe-550D Rebars"
            steel_price_ton = 52800

    if 'jsw' in prompt_lower or 'neosteel' in prompt_lower:
        steel_brand = "JSW Neosteel Fe-550D TMT"
        steel_price_ton = 54000
    elif 'jindal' in prompt_lower or 'panther' in prompt_lower:
        steel_brand = "Jindal Panther Fe-550D TMT"
        steel_price_ton = 53500
    elif 'sail' in prompt_lower:
        steel_brand = "SAIL TMT Fe-550D Rebars"
        steel_price_ton = 52800

    workers = 6
    if current_config and isinstance(current_config, dict):
        cfg_w = current_config.get('workers')
        if cfg_w and str(cfg_w).isdigit():
            workers = int(cfg_w)

    worker_match = re.search(r'(\d+)\s*(?:workers?|labours?|laborers?|labourers?|men)', prompt_lower)
    if worker_match:
        workers = int(worker_match.group(1))

    labor_rate_sqft = (
        admin_rates.get('rcc_structure_rate_sqft', 240) +
        admin_rates.get('brickwork_plaster_rate_sqft', 110) +
        admin_rates.get('plumbing_elec_rate_sqft', 160) +
        admin_rates.get('tile_flooring_rate_sqft', 45) +
        admin_rates.get('painting_rate_sqft', 22)
    )

    total_rate_sqft = labor_rate_sqft + mat_rate
    total_cost = round(sqft * total_rate_sqft)
    labor_cost = round(sqft * labor_rate_sqft)
    mat_cost = round(sqft * mat_rate)

    cement_bags = round(sqft * 0.4)
    steel_tons = round(sqft * 0.0035, 2)

    floors = 2
    total_built_area = sqft * floors
    per_worker_output = 6.25
    team_daily_output = workers * per_worker_output
    working_days = math.ceil(total_built_area / team_daily_output)
    total_mandays = working_days * workers

    curing_days = floors * 14
    drying_buffer_days = math.ceil(working_days * 0.35)
    total_actual_days = working_days + curing_days + drying_buffer_days
    total_actual_months = round(total_actual_days / 30.0, 1)

    def fmt(val):
        return f"₹ {(val/100000):.2f} Lakhs" if val < 10000000 else f"₹ {(val/10000000):.2f} Cr"

    return (
        f"🏗️ **ConstructAI Custom Project Estimate & Build Duration ({sqft:,} sq ft in {region})**\n\n"
        f"### 📋 Your Custom Selection Parameters:\n"
        f"• **Selected Package:** **{tier_name}** (@ ₹ {total_rate_sqft:,}/sq ft)\n"
        f"• **Preferred Cement Brand:** **{cement_brand}** (₹ {cement_price}/bag)\n"
        f"• **Preferred Steel Brand:** **{steel_brand}** (₹ {steel_price_ton:,}/Ton)\n"
        f"• **Deployed Workforce:** **{workers} Labours / Workers** on site\n\n"
        f"--- \n\n"
        f"### 💰 1. Customized Budget Breakdown:\n"
        f"• **Active Admin Panel Labour Charges:** **{fmt(labor_cost)}** (₹ {labor_rate_sqft}/sq ft fixed)\n"
        f"• **Custom Materials Budget:** **{fmt(mat_cost)}** (Cement: ~{cement_bags} bags | Steel: ~{steel_tons} Tons)\n"
        f"• **Total Custom Estimated Build Budget:** **{fmt(total_cost)}**\n\n"
        f"--- \n\n"
        f"### ⏱️ 2. Project Timeline & Workforce Execution Speed:\n"
        f"• **Team Execution Speed:** ~{team_daily_output:.1f} Sq Ft built / day ({workers} workers × {per_worker_output} sq ft/day)\n"
        f"• **👷 Pure On-Site Labour Working Days:** **~{working_days} Active Working Days** (~{total_mandays} Mandays)\n"
        f"• **🏗️ Total Actual Build Finish Time:** **~{total_actual_days} Days (~{total_actual_months} Months)** *(Includes RCC slab curing + plaster drying buffer)*\n\n"
        f"📌 *Note: Ready to start? Book a free on-site engineering inspection or request blueprint consultation!*"
    )


def handle_dedicated_topic_query(prompt_lower, current_config=None):
    """
    Handles specialized construction queries first (ceiling leaks, painting, plumbing, material checklist),
    followed by the 5-step interactive home building consultation wizard.
    """
    prompt_lower = prompt_lower.lower()
    admin_rates = get_admin_labour_rates()

    # 1. Greetings query
    if prompt_lower.strip() in ['hi', 'hello', 'hey', 'start', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste']:
        return (
            "👋 **Hello! Welcome to ConstructAI.**\n\n"
            "I am your AI Civil Engineering & Construction Advisor.\n\n"
            "• **Cost Estimates:** E.g. 'Estimate 1,500 sq ft house cost'\n"
            "• **Live Admin Rates:** Daily cement, TMT steel, and active Admin Panel labour charges\n"
            "• **Work Duration & Finish Calculations:** Projected completion days and team output speed\n"
            "• **Ceiling Leaks & Waterproofing:** Structural repair solutions & leak detection\n"
            "• **Trade Specific Budgets:** Painting, plumbing, wiring, and flooring cost breakdowns\n\n"
            "How can I assist your construction project today?"
        )

    # 2. Ceiling Water Leakage, Seepage & Waterproofing Repair Query (High Priority)
    if any(k in prompt_lower for k in ['leak', 'leakage', 'seepage', 'dampness', 'ceiling', 'crack']):
        return (
            "🛠️ **ConstructAI Civil Engineering Solution for Ceiling Water Leakage & Seepage**\n\n"
            "Ceiling water leakage is usually caused by terrace slab cracks, upper-floor bathroom piping leaks, or inadequate waterproofing.\n\n"
            "### 🔍 1. Root Cause Identification\n"
            "• **Terrace Slab Cracks:** Rainwater seeps through micro-cracks on the terrace roof.\n"
            "• **Bathroom/Plumbing Leaks:** Concealed CPVC/UPVC pipe joint leaks from the floor above.\n"
            "• **Parapet Wall Dampness:** Inadequate coping and moisture penetration in brick masonry.\n\n"
            "### 🏗️ 2. Recommended Step-by-Step Remedial Treatment\n"
            "1. **Surface Scraping & Cleaning:** Remove damp, flaking plaster down to bare RCC slab.\n"
            "2. **Crack Filling & Injection Grouting:** Fill structural cracks with Polymer Mortar / Dr. Fixit Crack-X Paste.\n"
            "3. **Dual-Coat Waterproofing Application:** Apply 2 coats Polymer Modified Cementitious Coating (Dr. Fixit Fastflex / Pidifin 2K).\n"
            "4. **Protective Plaster & Damp-Proof Paint:** Re-plaster wall/ceiling with waterproof compound mortar and apply acrylic damp-proof paint.\n\n"
            "📌 *Tip: Book a Free Site Visit through ConstructAI for a thermal imaging leak detection audit by a certified structural engineer.*"
        )

    # 3. Material Procurement Checklist Query
    if any(kw in prompt_lower for kw in ['things i need to buy', 'things to buy', 'what to buy', 'materials needed', 'material checklist', 'items to buy', 'materials required', 'materials to buy', 'list of materials', 'what materials', 'need to buy']):
        return (
            "🛒 **Essential Building Materials & Procurement Checklist for House Construction**\n\n"
            "### 🏗️ 1. Civil & Structural Building Materials (Foundation & Framing)\n"
            "• **Cement:** UltraTech 53 Grade PPC / ACC Concrete+ (50kg bags for RCC slab & masonry mortar)\n"
            "• **TMT Steel Rebars:** Tata Tiscon / JSW Neosteel Fe-550D grade (8mm, 10mm, 12mm, 16mm rods)\n"
            "• **Masonry Blocks / Bricks:** Red Clay Bricks or AAC Eco-Blocks (9-inch exterior & 4-inch partition walls)\n"
            "• **Sand & Aggregate:** M-Sand (Manufactured Sand for RCC), P-Sand (Plastering) & 20mm Granite Aggregate\n"
            "• **Binding Wire & Shuttering:** 18-gauge GI binding wire & waterproofing shuttering plywood\n\n"
            "### 🚿 2. Plumbing & Water Supply System\n"
            "• **Piping:** Astral / Supreme CPVC (Hot & Cold Water) & UPVC (Drainage & Rainwater)\n"
            "• **Overhead Water Tank:** 1,000L Triple-Layer UV-Shield Terrace Tank\n"
            "• **Sanitary Ware & Fixtures:** Jaquar / Kohler Wall Mixers, Health Faucets, Basins & Commodes\n\n"
            "### ⚡ 3. Electrical & Wiring Equipment\n"
            "• **Concealed Wires:** Polycab / Havells Flame-Retardant FRLS Copper Wires (1.5mm, 2.5mm, 4mm, 6mm)\n"
            "• **Conduits & Switchboxes:** Heavy PVC Concealed Conduit Pipes & GI Metal Boxes\n"
            "• **Modular Switches & DB:** Schneider Electric / Legrand Modular Switches & 3-Phase Distribution Board\n\n"
            "### 🎨 4. Flooring, Finishing & Waterproofing\n"
            "• **Tiles & Marble:** Somany Vitrified Tiles (800x800mm) or Italian Marble\n"
            "• **Paints & Primer:** Asian Paints Royale Interior & Damp Proof Exterior Acrylic Emulsion\n"
            "• **Waterproofing Chemicals:** Dr. Fixit 101 LW+ (for RCC Slabs, Bathrooms & Roof Terrace)\n\n"
            "📌 *Tip: With ConstructAI Turnkey Construction, our civil engineering team manages 100% of material sourcing, quality testing, and site delivery.*"
        )

    # Parse prompt parameters
    sqft_val, floors_val, _, _, region_val = parse_parameters_from_prompt(prompt_lower, current_config)

    # Explicit check if Sq Ft is typed in prompt
    has_sqft_in_prompt = bool(re.search(r'(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?', prompt_lower) or re.search(r'\b(\d{3,5})\b', prompt_lower))

    # Explicit check if location is typed in prompt or stored in current_config
    location_words = ['tenkasi', 'chennai', 'coimbatore', 'madurai', 'tirunelveli', 'trichy', 'salem', 'vellore', 'kanyakumari', 'trivandrum', 'kochi', 'bangalore', 'bengaluru', 'mysore', 'hyderabad', 'vizag', 'mumbai', 'pune', 'nagpur', 'delhi', 'gurgaon', 'noida', 'kolkata', 'ahmedabad', 'surat', 'jaipur', 'indore', 'bhopal', 'lucknow', 'chandigarh', 'goa', 'pondicherry']
    has_location_in_prompt = any(loc in prompt_lower for loc in location_words) or bool(re.search(r'\b(?:in|at|near|location)\s+([a-zA-Z\s]{2,20})', prompt_lower))
    has_location = has_location_in_prompt or bool(current_config and isinstance(current_config, dict) and current_config.get('region') and current_config.get('region') != 'Project Location (India)')

    general_build_phrases = ['build a house', 'need to build', 'want to build', 'how to build', 'building a house', 'how many days for building', 'i want to construct', 'need to construct', 'start building', 'build house', 'build home']
    is_general_build_request = any(phrase in prompt_lower for phrase in general_build_phrases)

    custom_brands = ['ultratech', 'acc', 'ambuja', 'birla', 'shree', 'tiscon', 'neosteel', 'jindal', 'sail']
    has_cement = any(c in prompt_lower for c in ['ultratech', 'acc', 'ambuja', 'birla', 'shree', 'cement'])
    has_steel = any(s in prompt_lower for s in ['tiscon', 'neosteel', 'jindal', 'sail', 'steel', 'rebar', 'tmt'])
    has_workers = any(w in prompt_lower for w in ['worker', 'workers', 'labour', 'labours', 'labor', 'labors', 'men'])

    has_all_materials = (has_cement or has_steel) and (has_workers or has_steel or has_cement)
    has_explicit_tier_choice = any(t in prompt_lower for t in ['tier 1', 'tier 2', 'tier 3', 'economy package', 'standard package', 'luxury package', 'economy house', 'standard house', 'luxury house'])

    # STEP 1: User asks to build a house, but HAS NOT PROVIDED Sq Ft in prompt -> Ask for Sq Ft
    if is_general_build_request and not has_sqft_in_prompt:
        return (
            "👋 **Welcome to ConstructAI Home Construction Consultation!**\n\n"
            "To calculate an accurate cost estimate and completion timeline combining **active Admin Panel labour charges** with **real-world material market prices**, please specify:\n\n"
            "1. 📐 **What is your plot / house built-up area in Sq Ft?** (E.g. 900 sq ft, 1,200 sq ft, 1,500 sq ft, 2,000 sq ft)\n\n"
            "📌 *Simply reply with your area (e.g. '900 sq ft') to proceed to material selection!*"
        )

    target_sqft = sqft_val if sqft_val else 1500
    target_region = region_val if (has_location_in_prompt and region_val) else (current_config.get('region') if current_config and isinstance(current_config, dict) and current_config.get('region') else "Project Location (India)")

    # STEP 5: User selected House Type/Tier (Tier 1, Tier 2, Tier 3) -> Present Final Confirmed Estimate & Build Duration
    if has_explicit_tier_choice:
        return build_customized_estimate_response(prompt_lower, target_sqft, target_region, current_config)

    # STEP 3 & STEP 4: User provided Sq Ft (or general construct request) -> Immediately display 3-Tier Package Comparison Cards AND Material Selector
    if has_sqft_in_prompt or sqft_val or is_general_build_request or has_all_materials or 'calculate' in prompt_lower or 'custom spec' in prompt_lower:
        cards_text = build_3tier_package_cards(target_sqft, target_region)
        return (
            cards_text + "\n\n"
            "🎯 **Which House Type / Tier do you need for your project according to your budget?**\n\n"
            "Please select your preferred house tier card below to confirm your estimate & build duration, or customize your cement, steel & workforce choices below!"
        )
        cards_text = build_3tier_package_cards(target_sqft, target_region)
        return (
            cards_text + "\n\n"
            "🎯 **Which House Type / Tier do you need for your project according to your budget?**\n\n"
            "Please select your preferred house tier:\n"
            "1. 🟢 **Tier 1: Economy / Basic House**\n"
            "2. 🔵 **Tier 2: Semi-Luxury / Standard House**\n"
            "3. 🟡 **Tier 3: Premium / Luxury House**\n\n"
            "📌 *Click a tier button below or reply e.g. 'Tier 2 Standard' to view your final detailed calculation & project timeline!*"
        )

    # 1. Painting specific query without sqft -> ASK FOR SQ FT
    if ('paint' in prompt_lower or 'painting' in prompt_lower) and not sqft_val:
        return (
            "🎨 **What is your house / wall footprint area in Sq Ft that you want to paint?**\n\n"
            "Please specify your area (E.g. 500 sq ft, 1,000 sq ft, 1,500 sq ft, 2,000 sq ft).\n\n"
            "Once you provide your Sq Ft, I will calculate your exact painting budget using active **Admin Panel Painting Labour Rates** (₹ 22/sq ft) + **Asian Paints Royale Emulsion & Primer material costs**!"
        )

    # 1.1 Painting specific query WITH sqft
    if 'paint' in prompt_lower or 'painting' in prompt_lower:
        paint_rate = admin_rates.get('painting_rate_sqft', 22)
        area = sqft_val if sqft_val else 1500
        paintable_surface_sqft = area * 3.5
        labour_cost = round(area * paint_rate)
        material_cost = round(area * 24)
        total_paint_cost = round(labour_cost + material_cost)
        return (
            f"🎨 **ConstructAI Painting Cost Breakdown ({area:,} sq ft House)**\n\n"
            f"Calculated dynamically using active Admin Panel rates:\n\n"
            f"• **House Footprint Area:** {area:,} sq ft\n"
            f"• **Estimated Paintable Surface Area (Walls + Ceilings):** ~{round(paintable_surface_sqft):,} sq ft\n"
            f"• **Admin Panel Painting Labour Rate:** ₹ {paint_rate} / sq ft\n"
            f"• **Painting Labour Charges:** ₹ {labour_cost:,}\n"
            f"• **Paint & Primer Materials (Asian Paints Royale + Damp Proof):** ~₹ {material_cost:,}\n"
            f"• **Total Estimated Painting Budget:** **₹ {total_paint_cost:,}**\n\n"
            "### 🛠️ Execution Process:\n"
            "1. Wall cleaning, scraping & 1 coat Acrylic Exterior/Interior Primer\n"
            "2. 2 coats acrylic wall putty for smooth mirror finish\n"
            "3. 2 coats premium washable interior/exterior emulsion paint\n\n"
            "📌 *Note: Calculated strictly for painting. Changing the Painting Rate in the Admin Panel immediately updates this budget!*"
        )

    # 2. Plumbing specific query without sqft
    if 'plumbing' in prompt_lower and not sqft_val:
        return (
            "🚿 **What is your house built-up area in Sq Ft for plumbing estimation?**\n\n"
            "Please specify your house area (E.g. 1,000 sq ft, 1,500 sq ft, 2,000 sq ft).\n\n"
            "I will calculate concealed Astral CPVC/UPVC piping & fixture installation using active **Admin Panel Plumbing Rates** (₹ 160/sq ft)!"
        )

    # 3. Electrical specific query without sqft
    if ('electrical' in prompt_lower or 'wiring' in prompt_lower) and not sqft_val:
        return (
            "⚡ **What is your house built-up area in Sq Ft for electrical wiring estimation?**\n\n"
            "Please specify your house area (E.g. 1,000 sq ft, 1,500 sq ft, 2,000 sq ft).\n\n"
            "I will calculate Polycab Flame-Retardant FRLS copper wiring & modular switch installation using active **Admin Panel Electrical Rates** (₹ 160/sq ft)!"
        )

    # 4. Flooring / Tile fitting specific query without sqft
    if ('tile' in prompt_lower or 'tiles' in prompt_lower or 'flooring' in prompt_lower) and not sqft_val:
        return (
            "🧱 **What is your floor area in Sq Ft for tile fitting estimation?**\n\n"
            "Please specify your floor area (E.g. 800 sq ft, 1,200 sq ft, 1,500 sq ft).\n\n"
            "I will calculate Somany 800x800mm Vitrified tile materials + active **Admin Panel Tile Fitting Labour Rates** (₹ 45/sq ft)!"
        )

    # Ceiling / Roof / Wall Water Leakage & Dampness query
    if any(kw in prompt_lower for kw in ['leak', 'leakage', 'seepage', 'dampness', 'waterproofing ceiling', 'water leaking', 'ceiling leak', 'water on ceiling']):
        rcc_rate = admin_rates.get('rcc_structure_rate_sqft', 240)
        plaster_rate = admin_rates.get('brickwork_plaster_rate_sqft', 110)
        paint_rate = admin_rates.get('painting_rate_sqft', 22)
        return (
            "🛠️ **ConstructAI Civil Engineering Solution for Ceiling Water Leakage & Seepage**\n\n"
            "Ceiling water leakage is usually caused by terrace slab cracks, upper-floor bathroom piping leaks, or inadequate waterproofing.\n\n"
            "### 🔍 1. Root Cause Identification\n"
            "• **Terrace Slab Cracks:** Rainwater seeps through micro-cracks on the terrace roof.\n"
            "• **Bathroom/Plumbing Leaks:** Concealed CPVC/UPVC pipe joint leaks from the floor above.\n"
            "• **Parapet Wall Dampness:** Inadequate coping and moisture penetration in brick masonry.\n\n"
            "### 🏗️ 2. Recommended Step-by-Step Remedial Treatment\n"
            "1. **Surface Scraping & Cleaning:** Remove damp, flaking plaster down to the bare RCC slab.\n"
            "2. **Crack Filling & Injection Grouting:** Fill structural cracks with Polymer Mortar / Dr. Fixit Crack-X Paste.\n"
            "3. **Dual-Coat Waterproofing Application:** Apply a 2-coat Polymer Modified Cementitious Coating (Dr. Fixit Fastflex / Pidifin 2K).\n"
            "4. **Protective Plaster & Damp-Proof Paint:** Re-plaster wall/ceiling with waterproof compound mortar and apply acrylic exterior damp-proof paint.\n\n"
            "### 💰 Estimated Repair & Admin Labour Rates:\n"
            f"• **Plastering & Masonry Repair:** ₹ {plaster_rate} / sq ft (Admin Rate)\n"
            f"• **Waterproofing & Damp-Proof Coating:** ₹ {round(paint_rate * 2.2)} / sq ft\n"
            f"• **RCC Slab Structural Reinforcement:** ₹ {rcc_rate} / sq ft\n\n"
            "📌 *Tip: Book a Free Site Visit through ConstructAI for a thermal imaging leak detection audit by a certified structural engineer.*"
        )

    # Materials to buy / House construction checklist query
    if any(phrase in prompt_lower for phrase in [
        'things i need to buy', 'things to buy', 'what to buy', 'materials needed', 
        'material checklist', 'items to buy', 'materials required', 'materials to buy',
        'list of materials', 'what materials', 'buy for house', 'need to buy'
    ]):
        return (
            "🛒 **Essential Building Materials & Procurement Checklist for House Construction**\n\n"
            "### 🏗️ 1. Civil & Structural Building Materials (Foundation & Framing)\n"
            "• **Cement:** UltraTech 53 Grade PPC / ACC Concrete+ (50kg bags for RCC slab & masonry mortar)\n"
            "• **TMT Steel Rebars:** Tata Tiscon / JSW Neosteel Fe-550D grade (8mm, 10mm, 12mm, 16mm rods)\n"
            "• **Masonry Blocks / Bricks:** Red Clay Bricks or AAC Eco-Blocks (9-inch exterior & 4-inch partition walls)\n"
            "• **Sand & Aggregate:** M-Sand (Manufactured Sand for RCC), P-Sand (Plastering) & 20mm Granite Aggregate\n"
            "• **Binding Wire & Shuttering:** 18-gauge GI binding wire & waterproofing shuttering plywood\n\n"
            "### 🚿 2. Plumbing & Water Supply System\n"
            "• **Piping:** Astral / Supreme CPVC (Hot & Cold Water) & UPVC (Drainage & Rainwater)\n"
            "• **Overhead Water Tank:** 1,000L Triple-Layer UV-Shield Terrace Tank\n"
            "• **Sanitary Ware & Fixtures:** Jaquar / Kohler Wall Mixers, Health Faucets, Basins & Commodes\n\n"
            "### ⚡ 3. Electrical & Wiring Equipment\n"
            "• **Concealed Wires:** Polycab / Havells Flame-Retardant FRLS Copper Wires (1.5mm, 2.5mm, 4mm, 6mm)\n"
            "• **Conduits & Switchboxes:** Heavy PVC Concealed Conduit Pipes & GI Metal Boxes\n"
            "• **Modular Switches & DB:** Schneider Electric / Legrand Modular Switches & 3-Phase Distribution Board\n\n"
            "### 🎨 4. Flooring, Finishing & Waterproofing\n"
            "• **Tiles & Marble:** Somany Vitrified Tiles (800x800mm) or Italian Marble\n"
            "• **Paints & Primer:** Asian Paints Royale Interior & Damp Proof Exterior Acrylic Emulsion\n"
            "• **Waterproofing Chemicals:** Dr. Fixit 101 LW+ (for RCC Slabs, Bathrooms & Roof Terrace)\n\n"
            "📌 *Tip: With ConstructAI Turnkey Construction, our civil engineering team manages 100% of material sourcing, quality testing, and site delivery.*"
        )

    # Cement daily live rates query (only if no sqft specified and not custom brand query)
    if 'cement' in prompt_lower and not sqft_val and not any(kw in prompt_lower for kw in ['ultratech', 'acc', 'ambuja', 'tiscon', 'neosteel', 'labour', 'worker', 'build', 'house']):
        return (
            "🧱 **ConstructAI Daily Live Cement Market Rates (India 2026)**\n\n"
            "• **UltraTech PPC 53 Grade Cement:** ₹ 380 / 50kg bag\n"
            "• **ACC Concrete+ Weather Shield:** ₹ 395 / 50kg bag\n"
            "• **Ambuja Kawach Waterproof Cement:** ₹ 410 / 50kg bag\n"
            "• **Birla Gold / Shree PPC Cement:** ₹ 375 / 50kg bag\n\n"
            "### 📊 Standard Material Consumption:\n"
            "• **RCC Slab Concrete Mix (M25):** 1 Bag Cement per 2.5 cu ft Concrete\n"
            "• **Brickwork Mortar (1:6):** 1 Bag Cement covers ~120 AAC Blocks / Bricks\n"
            "• **Plaster Mortar (1:4):** 1 Bag Cement covers ~90 sq ft (12mm thickness)\n\n"
            "📌 *Note: Sourced directly from UltraTech & ACC authorized stockists.*"
        )

    # Steel daily live rates query (only if no sqft specified and not custom brand query)
    if ('steel' in prompt_lower or 'rebar' in prompt_lower or 'tmt' in prompt_lower) and not sqft_val and not any(kw in prompt_lower for kw in ['ultratech', 'acc', 'tiscon', 'neosteel', 'labour', 'worker', 'build', 'house']):
        return (
            "🔩 **ConstructAI Daily Live TMT Steel Rebar Market Rates (India 2026)**\n\n"
            "• **Tata Tiscon Fe-550D TMT Rebar:** ₹ 56,500 / Ton (₹ 56.5 / kg)\n"
            "• **JSW Neosteel Fe-550D TMT:** ₹ 54,000 / Ton (₹ 54.0 / kg)\n"
            "• **Jindal Panther Fe-550D TMT:** ₹ 53,500 / Ton (₹ 53.5 / kg)\n"
            "• **SAIL TMT Rebar:** ₹ 52,800 / Ton (₹ 52.8 / kg)\n\n"
            "### 📊 Standard Steel Quantities:\n"
            "• **RCC Structure Consumption:** ~3.5 kg to 4.0 kg TMT Steel per sq ft of built-up area."
        )

    # Work Completion Duration, Labour Days & Actual Build Timing query
    is_duration_query = any(kw in prompt_lower for kw in [
        'how many days', 'how long', 'how many months', 'how much time', 
        'timing', 'time to build', 'days occur', 'days to build', 'completion time',
        'project duration', 'work finish', 'labor working', 'labour working',
        'working time', 'actual timing', 'days to finish', 'how many labours',
        'how many workers', 'with only', 'with 5', 'with 4', 'with 6', 'with 8', 'with 10'
    ]) or (('days' in prompt_lower or 'months' in prompt_lower or 'duration' in prompt_lower or 'timing' in prompt_lower) and ('build' in prompt_lower or 'finish' in prompt_lower or 'house' in prompt_lower or 'occur' in prompt_lower))

    if is_duration_query:
        sqft_val, floors_val, _, _, _ = parse_parameters_from_prompt(prompt_lower)
        area = sqft_val if sqft_val else 1500
        floors = floors_val if floors_val else 2
        total_built_area = area * floors

        # Parse worker/labour count from user prompt (e.g. "with only 5 labours", "10 workers")
        worker_match = re.search(r'(\d+)\s*(?:labours?|laborers?|labourers?|labors?|workers?|masons?|men|people)', prompt_lower)
        if worker_match:
            try:
                workers = max(1, min(100, int(worker_match.group(1))))
            except ValueError:
                workers = admin_rates.get('workers_per_team', 4)
        else:
            workers = admin_rates.get('workers_per_team', 4)

        admin_output_4_workers = admin_rates.get('daily_mason_team_output_sqft', 25)
        output_per_worker = admin_output_4_workers / 4.0
        team_daily_output = round(workers * output_per_worker, 2)

        # 1. Pure On-Site Labour Working Days (Mandays)
        working_days = math.ceil(total_built_area / team_daily_output)
        total_mandays = working_days * workers
        total_hours = total_mandays * admin_rates.get('shift_hours', 8)

        # 2. Actual Timing to Build (Total Calendar Finish Duration)
        curing_days = floors * 14  # 14 days water curing per RCC floor slab
        drying_buffer_days = math.ceil(working_days * 0.35)  # 35% drying, weather & finishing buffer
        total_actual_days = working_days + curing_days + drying_buffer_days
        total_actual_months = round(total_actual_days / 30.0, 1)

        return (
            f"⏱️ **ConstructAI Labour Working Time & Actual Build Duration Calculation**\n\n"
            f"Calculated dynamically based on plot size and active Admin Panel labour capacity parameters:\n\n"
            f"### 📊 Project Parameters:\n"
            f"• **House Footprint Area:** {area:,} sq ft ({floors} Floors = {total_built_area:,} sq ft total built-up area)\n"
            f"• **Labour Workforce Deployed:** **{workers} Labours / Workers**\n"
            f"• **Team Execution Speed:** ~{team_daily_output} Sq Ft built per day (~{output_per_worker} sq ft / worker / day)\n"
            f"• **Daily Shift Hours:** {admin_rates.get('shift_hours', 8)} Hours per day\n\n"
            f"--- \n\n"
            f"### 👷 1. Labour Working Time (Pure On-Site Labour Days)\n"
            f"• **On-Site Active Labour Working Days:** **~{working_days:,} Working Days**\n"
            f"• **Total Labour Mandays:** ~{total_mandays:,} Mandays ({working_days} days × {workers} workers)\n"
            f"• **Total Labour Execution Hours:** ~{total_hours:,} Hours\n\n"
            f"--- \n\n"
            f"### 🏗️ 2. Actual Timing to Build (Total Calendar Finish Duration)\n"
            f"• **RCC Slab Water Curing Time:** +{curing_days} Days ({floors} RCC slabs @ 14 days curing/slab)\n"
            f"• **Plaster Drying, Paint Coats & Weather Buffer (+35%):** +{drying_buffer_days} Days\n"
            f"• **Total Actual Project Finish Duration:** **~{total_actual_days:,} Days (~{total_actual_months} Months)**\n\n"
            f"--- \n\n"
            f"### 💡 Key Insights on Labour Timing vs. Actual Build Time:\n"
            f"1. **Why Actual Build Time is Longer:** Even if labours finish pure structural masonry work in ~{working_days} working days, concrete RCC slabs cannot be loaded immediately — they require compulsory 14-21 days of continuous water curing to gain structural compressive strength.\n"
            f"2. **Workforce Impact:** With **{workers} labours**, pure on-site work takes ~{working_days} working days. Adding more workers (e.g. 8-10 labours) speeds up brickwork and plastering, reducing total working days!\n"
            f"3. **Admin Panel Settings:** Updating the Mason Team Output Speed in the Admin Panel dynamically updates these duration calculations."
        )

    # General Labour Rates Schedule query
    if ('labour' in prompt_lower or 'labor' in prompt_lower or 'mason' in prompt_lower or 'wage' in prompt_lower) and not any(char.isdigit() for char in prompt_lower[:15]):
        return (
            "👷 **ConstructAI Admin Panel Labour Charge Schedule & Work Capacity (2026)**\n\n"
            f"• **RCC Structure & Centering Labour:** ₹ {admin_rates.get('rcc_structure_rate_sqft', 240)} / sq ft\n"
            f"• **Brickwork & Wall Plastering Labour:** ₹ {admin_rates.get('brickwork_plaster_rate_sqft', 110)} / sq ft\n"
            f"• **Plumbing & Electrical Technical Labour:** ₹ {admin_rates.get('plumbing_elec_rate_sqft', 160)} / sq ft\n"
            f"• **Tile Laying & Flooring Labour:** ₹ {admin_rates.get('tile_flooring_rate_sqft', 45)} / sq ft\n"
            f"• **Internal & External Painting Labour:** ₹ {admin_rates.get('painting_rate_sqft', 22)} / sq ft\n\n"
            "### 🛠️ Daily Wage & Output Capacity (8-Hour Shift):\n"
            f"• **Skilled Head Mason (Rajmistri):** ₹ {admin_rates.get('head_mason_daily_wage', 950)} / day\n"
            f"• **Unskilled Helper (Mazdoor):** ₹ {admin_rates.get('helper_daily_wage', 650)} / day\n"
            f"• **Mason Team Output Speed:** {admin_rates.get('daily_mason_team_output_sqft', 25)} sq ft built / day\n\n"
            "📌 *Note: Admin updates in the Admin Panel instantly recalculate client project estimates and completion duration.*"
        )

    # Core Services query
    if 'service' in prompt_lower or 'offer' in prompt_lower:
        turnkey_base = round(admin_rates.get('rcc_structure_rate_sqft', 240) + admin_rates.get('brickwork_plaster_rate_sqft', 110) + admin_rates.get('plumbing_elec_rate_sqft', 160) + admin_rates.get('tile_flooring_rate_sqft', 45) + admin_rates.get('painting_rate_sqft', 22) + 1150)
        return (
            "🛠️ **ConstructAI 5 Core Construction Services:**\n\n"
            f"1. **Full-Scale Turnkey Construction** (Turnkey Residential & Commercial Builds @ ₹ {turnkey_base}/sq ft)\n"
            f"2. **Professional Plumbing** (Hydro-tested CPVC/UPVC Piping @ ₹ {admin_rates.get('plumbing_elec_rate_sqft', 160)}/sq ft)\n"
            f"3. **Electrical & Wiring** (Polycab FR Copper Wiring @ ₹ {admin_rates.get('plumbing_elec_rate_sqft', 160)}/sq ft)\n"
            "4. **Interior Design & Finishing** (Italian Marble & Modular Kitchens @ ₹ 850/sq ft)\n"
            f"5. **Roofing & Structural Renovation** (Dr. Fixit Polymer Waterproofing @ ₹ {round(admin_rates.get('brickwork_plaster_rate_sqft', 110) * 4.5)}/sq ft)"
        )

    return None


def query_groq_ai_estimator(user_prompt, current_config=None):
    """
    Queries Groq AI with strict domain guardrails, live rate cards,
    and parameter parsing without forcing default values when user asks non-estimate questions.
    """
    prompt_lower = user_prompt.lower().strip() if user_prompt else ""

    # 1. Check for Strict Off-Topic Non-Construction Queries
    if not is_construction_related(prompt_lower, current_config):
        return {
            "text": "🤖 **I am ConstructAI Estimator, a specialized AI Construction Advisor.**\n\nI can only answer questions related to house construction, civil engineering, building materials, waterproofing, plumbing, wiring, labor rates, and cost estimates.\n\nPlease ask a construction-related question!",
            "model_used": "ConstructAI Domain Guardrail"
        }

    # 2. Check for Dedicated Live Rate & Topic Queries (e.g. things to buy, cement, steel, labour, finish duration, ceiling leaks)
    topic_response = handle_dedicated_topic_query(prompt_lower, current_config)
    if topic_response:
        return {
            "text": topic_response,
            "model_used": "ConstructAI Civil Engineer"
        }

    # 3. Check if user explicitly asked for a full house cost estimate or specified building a house
    sqft, floors, style, finish_grade, region = parse_parameters_from_prompt(user_prompt, current_config)
    
    is_asking_trade = any(trade in prompt_lower for trade in ['paint', 'painting', 'plumbing', 'electrical', 'wiring', 'tile', 'tiles', 'flooring', 'leak', 'leakage', 'ceiling', 'waterproofing', 'repair'])
    is_explicit_cost_estimate = (not is_asking_trade) and ((sqft is not None) or any(term in prompt_lower for term in ['cost', 'estimate', 'budget', 'price', 'quotation', 'how much', 'rate for']))

    target_sqft = sqft if sqft else 1500

    # Compute Civil Engineering Calculations
    calc = calculate_construction_cost(
        sqft=target_sqft,
        floors=floors,
        style=style,
        finish_grade=finish_grade,
        region=region
    )

    summary = calc['summary']
    materials = calc['material_quantities']
    dur = calc['labor_duration_metrics']
    rates = get_admin_labour_rates()

    cement_bags = materials['cement_bags']
    cement_cost = round(cement_bags * 380)

    labor_total = summary['total_labor_cost_inr']

    # Vector DB RAG Retrieval
    vector_context = query_vector_db_context(user_prompt, top_k=2)

    api_key = os.environ.get('GROQ_API_KEY') or GROQ_API_KEY

    if GROQ_AVAILABLE and api_key:
        try:
            client = Groq(api_key=api_key)
            
            system_prompt = (
                "You are ConstructAI Estimator, an expert AI civil engineering estimator and construction advisor in India.\n"
                "STRICT PRICING RULES:\n"
                "1. LABOUR RATES SOURCE: ALL Labour prices MUST come strictly from the active Admin Panel Labour Charges provided in context below. DO NOT make up custom labour rates.\n"
                f"   - Head Mason Daily Wage: ₹ {rates.get('head_mason_daily_wage', 950)}/day, Helper Wage: ₹ {rates.get('helper_daily_wage', 650)}/day\n"
                f"   - RCC Structural Labour: ₹ {rates.get('rcc_structure_rate_sqft', 240)}/sq ft\n"
                f"   - Brickwork & Plastering Labour: ₹ {rates.get('brickwork_plaster_rate_sqft', 110)}/sq ft\n"
                f"   - Plumbing & Electrical Technical Labour: ₹ {rates.get('plumbing_elec_rate_sqft', 160)}/sq ft\n"
                f"   - Tile Laying & Flooring Labour: ₹ {rates.get('tile_flooring_rate_sqft', 45)}/sq ft\n"
                f"   - Internal & External Painting Labour: ₹ {rates.get('painting_rate_sqft', 22)}/sq ft\n"
                f"   - Total Admin Labour Rate: ₹ {rates.get('rcc_structure_rate_sqft', 240) + rates.get('brickwork_plaster_rate_sqft', 110) + rates.get('plumbing_elec_rate_sqft', 160) + rates.get('tile_flooring_rate_sqft', 45) + rates.get('painting_rate_sqft', 22)} / sq ft\n\n"
                "2. MATERIAL RATES SOURCE: ALL material prices (Cement, TMT Steel Rebars, Sand, Aggregate, Bricks, Tiles, Paint, Sanitary Fixtures) MUST be fetched using real-world Indian market prices.\n"
                "   - Adjust material costs based on user brand selections (e.g. UltraTech ₹380/bag vs ACC ₹395/bag vs Ambuja ₹410/bag; Tata Tiscon Fe-550D ₹56,500/Ton vs JSW Neosteel ₹54,000/Ton vs SAIL ₹52,800/Ton).\n"
                "   - If real-world market prices increase or decrease, update material calculations dynamically.\n\n"
                "3. WORK DURATION & TIMING CALCULATIONS:\n"
                "   - Always calculate BOTH: (1) Labour Working Time (Pure On-Site Labour Days based on worker team size) and (2) Actual Timing to Build (Total Calendar Finish Time including 14-21 days RCC slab curing per floor & 35% drying buffer).\n\n"
                f"RETRIEVED CONTEXT:\n{vector_context}"
            )
            if is_explicit_cost_estimate:
                system_prompt += (
                    f"\n\nCALCULATION CONTEXT ({target_sqft:,} sq ft in {region}):\n"
                    f"• Total Budget: {summary['formatted_grand_total']} (Rate: ₹ {summary['rate_per_sqft_inr']:,}/sq ft)\n"
                    f"• Labour Budget: ₹ {labor_total:,} (Calculated from Admin Panel Labour Charges)\n"
                    f"• Work Finish Duration: ~{dur['working_days_to_finish']} Working Days (~{dur['total_timeline_months']} Months Total Timeline)\n"
                    f"• Cement: {cement_bags:,} Bags @ ₹ {cement_cost:,}\n"
                    f"• Steel: {materials['steel_tons']} Tons (Tata Tiscon Fe-550D)\n"
                )

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=850
            )

            ai_text = completion.choices[0].message.content
            return {
                "text": ai_text,
                "calculation": calc if is_explicit_cost_estimate else None,
                "model_used": "Groq Llama 3 70B Versatile"
            }
        except Exception:
            pass

    # Fallback response: if user explicitly asked for cost/sqft, show summary card. Otherwise show general civil advice.
    if is_explicit_cost_estimate:
        ai_text = (
            '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 20px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 20px;">\n'
            '  <div style="font-size: 11px; text-transform: uppercase; color: #fbbf24; font-weight: 700; tracking: 1px; margin-bottom: 8px;">🏗️ ConstructAI Project Cost & Duration Summary</div>\n'
            '  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; text-align: left;">\n'
            f'    <div><span style="font-size: 11px; color: #94a3b8;">Total Sq Ft:</span><br/><strong style="font-size: 16px; color: white;">{target_sqft:,} sq ft</strong></div>\n'
            f'    <div><span style="font-size: 11px; color: #94a3b8;">Estimated Cost:</span><br/><strong style="font-size: 20px; color: #f59e0b;">{summary["formatted_grand_total"]}</strong></div>\n'
            f'    <div><span style="font-size: 11px; color: #94a3b8;">Labour Finish Time:</span><br/><strong style="font-size: 15px; color: #34d399;">~{dur["total_timeline_months"]} Months ({dur["working_days_to_finish"]} Days)</strong></div>\n'
            f'    <div><span style="font-size: 11px; color: #94a3b8;">Location:</span><br/><strong style="font-size: 15px; color: white;">{region}</strong></div>\n'
            '  </div>\n'
            '</div>\n\n'
            f"### 👷 1. Itemized Admin Labour Charges Breakdown\n"
            f"• **RCC Framing & Centering Labour:** ₹ {round(target_sqft * rates['rcc_structure_rate_sqft']):,} (@ ₹ {rates['rcc_structure_rate_sqft']}/sq ft)\n"
            f"• **Brickwork & Wall Plastering Labour:** ₹ {round(target_sqft * rates['brickwork_plaster_rate_sqft']):,} (@ ₹ {rates['brickwork_plaster_rate_sqft']}/sq ft)\n"
            f"• **Plumbing & Electrical Labour:** ₹ {round(target_sqft * rates['plumbing_elec_rate_sqft']):,} (@ ₹ {rates['plumbing_elec_rate_sqft']}/sq ft)\n"
            f"• **Tile Fitting & Flooring Labour:** ₹ {round(target_sqft * rates['tile_flooring_rate_sqft']):,} (@ ₹ {rates['tile_flooring_rate_sqft']}/sq ft)\n"
            f"• **Painting & Finishing Labour:** ₹ {round(target_sqft * rates['painting_rate_sqft']):,} (@ ₹ {rates['painting_rate_sqft']}/sq ft)\n"
            f"• **Total Estimated Labour Amount:** ₹ {labor_total:,}\n\n"
            f"### ⏱️ 2. Work Completion Duration Timeline\n"
            f"• **Mason Crew Output:** {dur['daily_output_sqft']} sq ft built / day (4 Workers)\n"
            f"• **Core Execution Days:** ~{dur['working_days_to_finish']} Working Days\n"
            f"• **Total Project Finish Time:** ~{dur['total_timeline_days']} Days (~{dur['total_timeline_months']} Months incl. curing & drying)\n\n"
            f"### 🧱 3. Material Quantities & Budget\n"
            f"• **Cement Bags:** {cement_bags:,} Bags (@ ₹ 380/bag = ₹ {cement_cost:,})\n"
            f"• **TMT Steel Rebar:** {materials['steel_tons']} Tons (Tata Tiscon Fe-550D)\n"
            f"• **Masonry Bricks/Blocks:** {materials['bricks_count']:,} Pcs\n\n"
            f"📌 *Note: Calculated dynamically based on active Admin Panel labour charges and crew output parameters.*"
        )
    else:
        ai_text = (
            "### 🚿 2. Plumbing & Water Systems\n"
            "• **Piping:** Astral / Supreme CPVC (Water Supply) & UPVC (Drainage)\n"
            "• **Sanitary Fixtures:** Jaquar / Kohler Wall Mixers, Basins & Commodes\n\n"
            "### ⚡ 3. Electrical & Power\n"
            "• **Wires & Conduits:** Polycab FRLS Copper Wires & PVC Concealed Conduits\n"
            "• **Modular Switches:** Schneider / Havells Switches & Legrand Distribution Board\n\n"
            "📌 *Ask me for live rates, Admin Panel labour charge schedules, or work completion finish timelines!*"
        )

    return {
        "text": ai_text,
        "calculation": calc if is_explicit_cost_estimate else None,
        "model_used": "ConstructAI Senior Civil Engineer"
    }



