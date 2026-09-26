import re
import os
import math
from pathlib import Path
from ..models import ChatbotSession, ChatMessage, LabourRate, Material, PackageConfig
from .web_search_service import perform_web_search
from .calculation_engine import calculate_3_house_packages, get_available_materials, get_active_labour_config
from .vector_db import query_vector_db_context

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

OFF_TOPIC_FALLBACK = "🏗️ I'm ConstructAI, an AI assistant specialized in construction and civil engineering. I can help with house construction, materials, labour, cost estimation, construction methods, and related topics. Please ask me a construction-related question."

CONSTRUCTION_KEYWORDS = [
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
    'time', 'timeline', 'days', 'months', 'capacity', 'wage', 'package', 'packages',
    'tier', 'tiers', 'economy', 'basic', 'standard', 'luxury', 'premium', 'compare',
    'ceiling', 'leak', 'leakage', 'seepage', 'dampness', 'crack', 'repair', 'fix',
    'treatment', 'waterproof', 'terrace', 'wall', 'fe500', 'fe550', 'opc', 'ppc'
]

ESTIMATION_TRIGGER_KEYWORDS = [
    'build a house', 'build house', 'cost to build', 'house cost', 'calculate cost', 'estimate cost',
    'construction cost', 'house estimation', 'budget for house', 'cost of building',
    'how much to build', 'build my house', 'cost estimation', 'package price', 'want to build',
    'how much will it cost to build', 'how much does a', 'house in', 'sq ft house', 'calculate the cost'
]


def extract_sqft(prompt):
    """Extracts square feet value from prompt string if explicitly provided."""
    prompt_lower = prompt.lower()
    
    # Guard against steel/concrete grades & standards being misparsed as sqft
    if any(sg in prompt_lower for sg in ['fe500', 'fe550', 'fe415', 'fe 500', 'fe 550', 'm20', 'm25', 'm30', 'm35', 'is456', 'is 456', 'nbc']):
        return None

    sqft_match = re.search(r'(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?', prompt_lower)
    if sqft_match:
        try:
            val = int(sqft_match.group(1).replace(',', ''))
            if 100 <= val <= 100000:
                return val
        except ValueError:
            pass
            
    numbers = re.findall(r'\b(\d{3,5})\b', prompt_lower)
    for num in numbers:
        val = int(num)
        if 200 <= val <= 50000:
            return val
            
    return None


def is_technical_question(prompt):
    """Checks if user prompt is a technical construction query rather than an answer to a state prompt."""
    prompt_lower = prompt.lower().strip()
    tech_keywords = [
        'what is', 'what are', 'difference', 'compare', 'vs', 'fe500', 'fe550', 'fe415',
        'tmt', 'cement', 'steel', 'concrete', 'm20', 'm25', 'opc', 'ppc', 'leak', 'leakage',
        'waterproof', 'waterproofing', 'tile fix', 'tile fixing', 'tiles', 'crack', 'repair',
        'column', 'beam', 'slab', 'foundation', 'rcc', 'how to', 'why', 'which cement',
        'best cement', 'brick', 'plaster', 'python', 'who is'
    ]
    return any(tk in prompt_lower for tk in tech_keywords)


def extract_location(prompt):
    """Extracts city/location name from user prompt."""
    prompt_lower = prompt.lower().strip()

    if is_technical_question(prompt_lower):
        return None

    # Common Indian cities map
    location_map = {
        'tenkasi': 'Tenkasi, Tamil Nadu',
        'pavoorchatram': 'Pavoorchatram, Tamil Nadu',
        'nagercoil': 'Nagercoil, Tamil Nadu',
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
        'kerala': 'Kerala State',
        'bangalore': 'Bengaluru, Karnataka',
        'bengaluru': 'Bengaluru, Karnataka',
        'mysore': 'Mysuru, Karnataka',
        'hyderabad': 'Hyderabad, Telangana',
        'vizag': 'Visakhapatnam, Andhra Pradesh',
        'mumbai': 'Mumbai, Maharashtra',
        'pune': 'Pune, Maharashtra',
        'nagpur': 'Nagpur, Maharashtra',
        'delhi': 'Delhi NCR',
        'gurgaon': 'Gurgaon, Haryana',
        'noida': 'Noida, Uttar Pradesh',
        'kolkata': 'Kolkata, West Bengal',
        'ahmedabad': 'Ahmedabad, Gujarat',
        'jaipur': 'Jaipur, Rajasthan',
        'lucknow': 'Lucknow, Uttar Pradesh'
    }

    for loc_key, loc_name in location_map.items():
        if loc_key in prompt_lower:
            return loc_name

    match_in = re.search(r'\b(?:in|at|near)\s+([a-zA-Z\s,]{2,30})', prompt)
    if match_in:
        extracted = match_in.group(1).strip().title()
        skip_words = ['a house', 'the house', 'house', 'building', 'my plot', 'my house', 'sq ft', 'sqft', 'economy', 'standard', 'luxury', 'tier 1', 'tier 2', 'tier 3', 'cost', 'estimate', 'build', 'want', 'fe500', 'fe550']
        if not any(sw in extracted.lower() for sw in skip_words):
            return extracted

    # Direct location response like "tenkasi", "Tenkasi district", "near Tenkasi", "Pavoorchatram"
    cleaned = prompt.strip()
    skip = ['hi', 'hello', 'yes', 'no', 'build', 'house', 'cost', 'estimate', 'price', '1500', '2000', 'i want to build a house', 'i want to build house', 'calculate cost', 'what is fe500', 'what is fe550']
    action_words = ['want to', 'i want', 'build a', 'need to', 'calculate', 'estimate cost', 'price of', 'what is', 'how to', 'why']

    if any(aw in cleaned.lower() for aw in action_words):
        return None

    if len(cleaned) >= 3 and not any(sw == cleaned.lower() for sw in skip) and not cleaned.isdigit():
        return cleaned.title()

    return None


def is_construction_query(prompt):
    prompt_lower = prompt.lower().strip()
    greetings = ['hi', 'hello', 'hey', 'start', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste']
    if prompt_lower in greetings:
        return True, "greeting"

    off_topic_indicators = ['python', 'who is', 'taylor swift', 'java', 'programming', 'capital of france', 'movie', 'actor', 'president of']
    if any(oti in prompt_lower for oti in off_topic_indicators):
        return False, "off_topic"

    # Specific Steel questions (Fe500, Fe550, TMT)
    if any(sk in prompt_lower for sk in ['fe500', 'fe550', 'fe-500', 'fe-550', 'tmt steel', 'tmt rebar', 'steel grade', 'steel rebars']):
        return True, "steel_question"

    # Specific Cement questions (OPC, PPC)
    if any(ck in prompt_lower for ck in ['ppc cement', 'opc cement', 'types of cement', 'cement types', 'which cement', 'best cement']):
        return True, "cement_question"

    # Specific Concrete questions (M20, M25)
    if any(cnk in prompt_lower for cnk in ['m20', 'm25', 'm30', 'm15', 'concrete grade', 'concrete mix']):
        return True, "concrete_question"

    # Specific Labour questions
    if any(lk in prompt_lower for lk in ['labour cost', 'labor cost', 'worker cost', 'labour rate', 'mason wage', 'worker wage']):
        return True, "labour_question"

    estimation_phrases = [
        'build house', 'build a house', 'need to build a house', 
        'i need to build a house', 'want to build a house', 'i want to build a house',
        'house cost', 'calculate cost', 'estimate cost', 'construction cost',
        'house estimation', 'budget for house', 'cost of building', 'how much to build',
        'start new estimate', 'new estimate', 'need a house construction estimate',
        'want to know house construction cost', 'want to construct a house'
    ]
    if prompt_lower in estimation_phrases or any(ep == prompt_lower for ep in estimation_phrases):
        return True, "estimation_workflow"

    for trigger in ESTIMATION_TRIGGER_KEYWORDS:
        if trigger in prompt_lower:
            return True, "estimation_workflow"

    if ('build' in prompt_lower or 'need' in prompt_lower or 'want' in prompt_lower) and ('house' in prompt_lower or 'villa' in prompt_lower or 'sq' in prompt_lower or 'home' in prompt_lower or 'construct' in prompt_lower):
        return True, "estimation_workflow"

    for kw in CONSTRUCTION_KEYWORDS + ['tata', 'tiscon', 'jsw', 'neosteel', 'jindal', 'panther', 'sail', 'ultratech', 'acc', 'ambuja', 'birla', 'shree', 'workers', 'worker', 'economy', 'standard', 'premium', 'column', 'beam', 'slab', 'foundation', 'rcc', 'mortar', 'brick', 'plaster', 'tile', 'leak', 'waterproof']:
        if kw in prompt_lower:
            return True, "construction_general"

    if any(q in prompt_lower for q in ['how to', 'what is', 'why', 'difference', 'compare', 'price', 'cost', 'cause', 'fix', 'repair']):
        return True, "construction_general"

    return False, "off_topic"


def call_groq_ai(system_prompt, user_query):
    """Calls Groq Llama 3 API for natural language explanation."""
    groq_api_key = os.environ.get('GROQ_API_KEY')
    if GROQ_AVAILABLE and groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                temperature=0.3,
                max_tokens=650
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"[GROQ SERVICE LOG] Groq API call error: {e}")
    return None


def safe_print(msg):
    try:
        print(msg)
    except Exception:
        try:
            print(str(msg).encode('ascii', 'ignore').decode('ascii'))
        except Exception:
            pass


def process_technical_answer(user_message, session):
    """Answers technical construction questions via RAG or Groq AI without modifying session state."""
    prompt_lower = user_message.lower().strip()

    if "fe550" in prompt_lower and "fe500" not in prompt_lower:
        ans = (
            "🔩 **Fe550 TMT Reinforcement Steel Grade:**\n\n"
            "• **Yield Strength:** Fe550 refers to a minimum yield strength of **550 MPa (N/mm²)**.\n"
            "• **High Strength:** Offers 10% higher load-bearing capacity compared to Fe500 grade steel.\n"
            "• **Applications:** Used in high-rise commercial structures, long-span bridges, and heavy load RCC footings.\n"
            "• **Material Optimization:** Can reduce total steel tonnage requirement by 8-10% under proper structural engineering design.\n\n"
            "💡 *Note: Steel grade selection should always follow structural design drawings by a certified civil engineer rather than simply picking higher grade numbers.*"
        )
        sug = ["🔩 What is Fe500?", "⚖️ Fe500 vs Fe550", "🏠 Build a House"]
    elif "fe500" in prompt_lower and "fe550" in prompt_lower or ("fe500" in prompt_lower and ("difference" in prompt_lower or "vs" in prompt_lower)):
        ans = (
            "⚖️ **Comparison: Fe500 vs Fe550 TMT Steel Rebars**\n\n"
            "• **Fe500 Steel:**\n"
            "  - *Yield Strength:* Minimum 500 MPa (N/mm²).\n"
            "  - *Ductility:* Higher elongation & flexibility, excellent for seismic Zone IV & V earthquake resistance.\n"
            "  - *Best For:* Standard independent residential homes, villas, slabs, and columns.\n\n"
            "• **Fe550 Steel:**\n"
            "  - *Yield Strength:* Minimum 550 MPa (N/mm²).\n"
            "  - *Strength:* 10% higher load capacity per unit area.\n"
            "  - *Best For:* Commercial high-rises, heavy industrial foundations, long spans.\n\n"
            "📌 **Engineer Recommendation:** Fe500 is the industry standard for residential house construction due to superior ductility. Fe550 is selected when specific structural design calculations require higher yield capacity."
        )
        sug = ["🔩 What is Fe500?", "🔩 What is Fe550?", "🏠 Build a House"]
    elif "fe500" in prompt_lower:
        ans = (
            "🔩 **Fe500 TMT Reinforcement Steel Grade:**\n\n"
            "• **Yield Strength:** Fe500 refers to a minimum yield strength of **500 MPa (N/mm²)**.\n"
            "• **Ductility & Elongation:** Provides high percentage elongation, making it highly resilient against seismic shock and structural deflection.\n"
            "• **Applications:** Standard choice for residential house construction, RCC beams, columns, footings, and slabs.\n"
            "• **Standards:** Complies with IS 1786:2008 steel rebar manufacturing guidelines.\n\n"
            "💡 *Selection should be based on your structural engineer's drawings and applicable IS 456 building codes.*"
        )
        sug = ["🔩 What is Fe550?", "⚖️ Fe500 vs Fe550", "🏠 Build a House"]
    elif any(pk in prompt_lower for pk in ['paint', 'painting', 'putty', 'primer', 'emulsion']):
        ans = (
            "🎨 **House Painting & Surface Finishing Specifications:**\n\n"
            "• **Surface Preparation:** Apply 2 coats of acrylic wall putty followed by 1 coat of interior/exterior alkali-resistant primer.\n"
            "• **Interior Painting:** 2 coats of Premium Acrylic Emulsion (washable, smooth stain-resistant finish).\n"
            "• **Exterior Painting:** 2 coats of 100% Acrylic Weather-Guard Exterior Emulsion with UV protection.\n"
            "• **Paint Coverage:** Approx. 100-120 sq ft per liter for 2 coats over primed wall surfaces.\n"
            "• **Top Brands:** Asian Paints (Apex/Royale), Berger, Nerolac, Dulux."
        )
        sug = ["🎨 Interior Paint", "🏠 Build a House", "🧱 Wall Plastering"]
    elif any(ck in prompt_lower for ck in ['opc', 'ppc', 'cement']):
        ans = (
            "🧱 **Types of Cement for House Construction (PPC vs OPC):**\n\n"
            "• **PPC (Portland Pozzolana Cement):**\n"
            "  - *Best For:* Brick masonry, plastering, tiling, and residential RCC roof slabs.\n"
            "  - *Benefits:* Lower heat of hydration, prevents micro-cracks, highly resistant to chemical and moisture attacks.\n\n"
            "• **OPC 53 Grade (Ordinary Portland Cement):**\n"
            "  - *Best For:* Heavy structural columns, RCC footings, and fast-track commercial concrete.\n"
            "  - *Benefits:* Rapid initial strength gain (attains 27 MPa in 3 days).\n\n"
            "📌 **Top Brands:** UltraTech PPC, ACC Concrete+, Ambuja Kawach, Birla Gold (~₹380 - ₹430 / 50kg bag)."
        )
        sug = ["🧱 OPC vs PPC", "🏠 Build a House", "🔩 TMT Steel"]
    elif any(plk in prompt_lower for plk in ['plumbing', 'pipe', 'pipes', 'drainage', 'sanitary', 'water tank']):
        ans = (
            "🚰 **Plumbing & Piping Specifications:**\n\n"
            "• **Water Supply Pipes:** CPVC (Chlorinated Polyvinyl Chloride) SDR 11/13.5 for hot and cold internal lines; UPVC for main inlet supply.\n"
            "• **Drainage & Sewerage:** SWR PVC ring-fit pipes (110mm for soil waste, 75mm for wastewater).\n"
            "• **Water Storage Tank:** Triple-layer UV-stabilized food-grade PVC overhead tank (1,000L - 2,000L capacity).\n"
            "• **Pressure Testing:** Hydrostatic pressure test at 10 kg/cm² for 24 hours prior to wall tile laying."
        )
        sug = ["🚰 CPVC vs UPVC", "🏠 Build a House", "🌧️ Waterproofing"]
    elif any(ek in prompt_lower for ck_e in ['electrical', 'wiring', 'conduit', 'switch', 'mcb', 'earthing'] if ck_e in prompt_lower):
        ans = (
            "⚡ **Electrical Wiring & Fitting Specifications:**\n\n"
            "• **Wire Quality:** FRLS (Flame Retardant Low Smoke) copper multi-strand wires (Finolex, Havells, Polycab).\n"
            "• **Conduits:** Heavy-duty rigid PVC concealed conduits (20mm/25mm) embedded in wall brickwork.\n"
            "• **Safety Switchgear:** Main Distribution Board equipped with ELCB/RCCB (30mA trip sensitivity) & individual MCBs for circuit protection.\n"
            "• **Earthing System:** Copper plate or chemical gel grounding with Earth Resistance < 2 ohms."
        )
        sug = ["⚡ Electrical Cost", "🏠 Build a House", "🎨 Painting"]
    elif any(flk in prompt_lower for flk in ['flooring', 'granite', 'marble', 'floors']):
        ans = (
            "📐 **Flooring Materials & Laying Standards:**\n\n"
            "• **Vitrified Tiles:** 800x800mm or 1200x600mm double-charged vitrified tiles for living rooms & bedrooms.\n"
            "• **Granite:** 18mm thick polished jet-black granite for kitchen countertops and main entrance steps.\n"
            "• **Anti-Skid Tiles:** Matte finish anti-skid ceramic tiles for bathrooms and open balconies.\n"
            "• **Tile Adhesive:** Polymer modified Type-2 tile adhesive with 2mm tile spacers and epoxy grouting."
        )
        sug = ["📐 Vitrified Tiles", "🏠 Build a House", "🧱 Tile Fixing"]
    elif any(bk in prompt_lower for bk in ['brick', 'bricks', 'aac', 'masonry', 'flyash', 'plaster']):
        ans = (
            "🧱 **Brickwork, AAC Blocks & Plastering Specifications:**\n\n"
            "• **Red Clay Bricks:** First-class wire-cut bricks (min 10.5 N/mm² crushing strength).\n"
            "• **AAC Blocks:** Autoclaved Aerated Concrete blocks (3x lighter, eco-friendly, superior thermal insulation).\n"
            "• **Mortar Proportions:** 1:6 cement-sand mortar for 9-inch load-bearing walls; 1:4 mortar for 4.5-inch partition walls.\n"
            "• **Wall Plastering:** 12mm thick 1:4 cement mortar for interior walls; 20mm double-coat 1:5 mortar with liquid waterproofing for exterior walls."
        )
        sug = ["🧱 Red Brick vs AAC", "🏠 Build a House", "🎨 Painting"]
    elif any(sk_mat in prompt_lower for sk_mat in ['sand', 'm-sand', 'p-sand', 'aggregate', 'jelly', 'gravel']):
        ans = (
            "⏳ **Sand & Aggregate Specifications:**\n\n"
            "• **M-Sand (Manufactured Sand):** Zone II graded crushed granite sand for RCC concrete structural work and brickwork mortar.\n"
            "• **P-Sand (Plastering Sand):** Sieve-filtered fine sand (Zone IV) engineered specifically for smooth wall plastering.\n"
            "• **Coarse Aggregate:** 20mm and 12mm angular hard crushed blue metal jelly for RCC concrete mixes."
        )
        sug = ["⏳ M-Sand vs River Sand", "🏠 Build a House", "🧱 Cement Types"]
    elif any(dk in prompt_lower for dk in ['door', 'doors', 'window', 'windows', 'upvc', 'teak']):
        ans = (
            "🚪 **Doors & Windows Specifications:**\n\n"
            "• **Main Entrance Door:** Teak wood frame with solid teak wood carved panel door (PU polished with brass hardware).\n"
            "• **Internal Doors:** Flush doors with laminate skin finish over hardwood frames.\n"
            "• **Windows:** UPVC multi-chambered sliding/casement window frames with 5mm clear toughened glass & stainless steel mosquito mesh."
        )
        sug = ["🚪 UPVC Windows", "🏠 Build a House", "🎨 Painting"]
    elif any(lbk in prompt_lower for lbk in ['labour', 'labor', 'mason', 'mistri', 'wages', 'contractor']):
        ans = (
            "👷 **Labour Wages & Contractor Workforce Breakdown:**\n\n"
            "• **Head Mason Wage:** ~₹950 - ₹1,100 / day (depending on city & region).\n"
            "• **Helper / Labourer Wage:** ~₹650 - ₹750 / day.\n"
            "• **Contractor Types:** Turnkey All-Inclusive Material Contract vs Labour-Only Contract.\n"
            "• **Optimal Team Size:** 6 to 8 workers for a 1,500 sq ft residential project to achieve completion within 5 to 6 months."
        )
        sug = ["👷 Labour Wages", "🏠 Build a House", "📦 Packages"]
    elif any(vk in prompt_lower for vk in ['vastu', 'floorplan', 'plan', 'design', 'architect']):
        ans = (
            "🧭 **Vastu Shastra & Architectural Layout Guidelines:**\n\n"
            "• **Main Entrance:** East or North direction recommended for maximum natural daylight and ventilation.\n"
            "• **Master Bedroom:** South-West corner of the house.\n"
            "• **Kitchen:** South-East (Agni corner) with cooking counter facing East.\n"
            "• **Pooja Room:** North-East (Ishaana corner)."
        )
        sug = ["🧭 Vastu Plan", "🏠 Build a House", "📦 Packages"]
    elif any(tk in prompt_lower for tk in ['tmt', 'steel', 'rebar', 'rebars', 'iron rod', 'sariya', 'rod']):
        ans = (
            "🔩 **TMT Steel Rebars (Thermo-Mechanically Treated Steel):**\n\n"
            "• **What is TMT Steel:** High-strength reinforcement steel manufactured via rapid water quenching process, producing a hard outer martensite rim and soft ductile ferrite-pearlite core.\n"
            "• **Grades Used:** Fe-500D and Fe-550D (the 'D' indicates high ductility, crucial for earthquake resistance).\n"
            "• **Key Features:** High tensile yield strength, 16-24% elongation, corrosion resistance, and excellent weldability.\n"
            "• **Top Brands:** Tata Tiscon Fe-550D, JSW Neosteel, SAIL TMT, Jindal Panther (~₹53,000 - ₹58,000 / ton)."
        )
        sug = ["🔩 Fe500 vs Fe550", "🏠 Build a House", "🧱 Cement Types"]
    elif any(lk in prompt_lower for lk in ['leak', 'leack', 'leakage', 'leakge', 'seepage', 'sepage', 'dampness', 'ceiling', 'celeing', 'celing', 'roof leak']):
        ans = (
            "🌧️ **Ceiling Leakage & Waterproofing Remediation Guide:**\n\n"
            "Ceiling leakage is commonly caused by roof waterproofing failure, plumbing leakage, cracks, or water seepage from the floor above.\n\n"
            "**Common Checks & Action Steps:**\n"
            "• **Identify Source:** Check whether leakage occurs during rain, continuously from plumbing, or from an overhead bathroom.\n"
            "• **Inspect Roof Terrace:** Look for terrace micro-cracks, parapet plaster gaps, or choked rainwater outlets.\n"
            "• **Crack Sealing:** Fill slab micro-cracks using elastomeric PU sealant or polymer modified mortar.\n"
            "• **Waterproofing Treatment:** Apply 2 coats of elastomeric polymer waterproofing slurry mesh on clean terrace concrete.\n"
            "• **Plumbing Repair:** Fix concealed pipe leaks before plastering and repainting."
        )
        sug = ["🌧️ Roof Leakage", "💧 Waterproofing", "🏗️ Slab Crack Repair", "🏠 Build a House"]
    elif any(cnk in prompt_lower for cnk in ['m20', 'm25', 'm30', 'concrete grade', 'mix design']):
        ans = (
            "🏗️ **Concrete Grades for Residential House Construction:**\n\n"
            "• **M20 Grade (1 : 1.5 : 3):**\n"
            "  - *Compressive Strength:* 20 N/mm² at 28 days.\n"
            "  - *Usage:* Standard IS 456 minimum grade for RCC roof slabs, beams, and residential staircases.\n\n"
            "• **M25 Grade (1 : 1 : 2):**\n"
            "  - *Compressive Strength:* 25 N/mm² at 28 days.\n"
            "  - *Usage:* Heavy load-bearing columns, footings, and multi-story structural frames.\n\n"
            "• **Nominal Mix Proportions:** Cement : Fine Aggregate (Sand) : Coarse Aggregate (Jelly)."
        )
        sug = ["🏗️ M20 Concrete", "🏠 Build a House", "🔩 Fe500 Steel"]
    elif any(fk in prompt_lower for fk in ['foundation', 'rcc', 'column', 'beam', 'slab']):
        ans = (
            "🏛️ **Structural Components Guide (RCC Construction):**\n\n"
            "• **Foundation / Footing:** Transfers total house building load safely to firm soil. Depth depends on safe bearing capacity (SBC).\n"
            "• **RCC Columns:** Vertical structural members resisting compression loads. Uses M25 concrete with Fe500/Fe550 rebars.\n"
            "• **RCC Beams:** Horizontal load distribution members transferring slab weight to columns.\n"
            "• **Roof Slab:** Monolithic RCC slab (minimum 5 inches / 125mm thickness) with double-mat reinforcement."
        )
        sug = ["🏛️ Foundation Depth", "🏠 Build a House", "🔩 Fe500 Steel"]
    else:
        vector_context = query_vector_db_context(user_message, top_k=2)
        system_prompt = (
            "You are ConstructAI, an expert civil engineering assistant for house construction.\n"
            "Answer the user query accurately in clean markdown formatting (bullet points & bold headers).\n"
            f"RETRIEVED VECTOR DB CONTEXT:\n{vector_context}\n"
        )
        ai_ans = call_groq_ai(system_prompt, user_message)
        if ai_ans:
            ans = ai_ans
        else:
            cleaned_topic = re.sub(r'^(what\s+is|what\s+are|how\s+to|why|which|can\s+you|tell\s+me\s+about)\s+', '', prompt_lower, flags=re.IGNORECASE)
            cleaned_topic = cleaned_topic.rstrip('?').strip().title()
            if not cleaned_topic:
                cleaned_topic = user_message.strip().title()

            ans = (
                f"🏗️ **Civil Engineering Guidance for {cleaned_topic}:**\n\n"
                f"• **Technical Specification:** High-grade certified material adhering to National Building Code (NBC 2016) and relevant IS standards.\n"
                f"• **Quality Control:** Conduct material quality testing, surface preparation, and curing compliance checks prior to execution.\n"
                f"• **Workmanship:** Engage certified trade professionals and follow structural engineering drawings for long-term durability.\n"
                f"• **Budget Estimation:** Factored into standard house construction packages (~10-15% of total building budget)."
            )
        sug = ["🏠 Build a House", "🔩 Fe500 vs Fe550", "🧱 Cement Types"]

    return ans, sug




def process_chat_message(session_id, user_message):
    """
    Master State Machine Chatbot Handler with Strict Intent & State Separation.
    Architecture:
    1. Active Session State HAS PRIORITY over general intent classification.
    2. Technical Questions asked during an active step answer the question without corrupting session state.
    3. Explicit 'Build a House' / 'Start New Estimate' cleanly resets house estimation session state.
    4. Valid answers (sqft, location, cement, steel, workers, package) advance the state machine.
    """
    session, _ = ChatbotSession.objects.get_or_create(session_id=session_id)
    prompt_lower = user_message.lower().strip()

    safe_print("\n" + "="*50)
    safe_print("CHATBOT REQUEST")
    safe_print(f"message = {user_message}")
    safe_print(f"session_id = {session_id}")
    safe_print(f"current_state = {session.state}")

    extracted_sqft = extract_sqft(user_message)
    extracted_loc = extract_location(user_message)
    is_valid_domain, intent = is_construction_query(user_message)

    # 1. EXPLICIT NEW HOUSE ESTIMATION REQUEST / RESET
    is_explicit_new_estimate = (
        prompt_lower in ['build a house', 'build house', 'i want to build a house', 'i want to build house', 'i need to build a house', 'start new estimate', 'new estimate', '🏠 start new estimate', 'i need a house construction estimate', 'i want to know house construction cost', 'i want to construct a house']
        or (intent == "estimation_workflow" and session.state in [None, 'START', 'CONFIRMED'])
    )

    if is_explicit_new_estimate:
        session.inquired_sqft = None
        session.city_region = None
        session.selected_cement = None
        session.selected_steel = None
        session.selected_workers = None
        session.selected_package = None
        session.pending_material = None
        session.is_confirmed = False

        if extracted_sqft and extracted_loc:
            session.inquired_sqft = extracted_sqft
            session.city_region = extracted_loc
            session.state = 'RESEARCH'
            session.save()
            return trigger_research_and_cement_selection(session)

        if extracted_sqft:
            session.inquired_sqft = extracted_sqft
            session.state = 'WAITING_FOR_LOCATION'
            session.save()
            return {
                "type": "location_request",
                "message": f"Sure! I will prepare a custom construction estimate for your **{extracted_sqft:,} sq ft** house.\n\nWhich city or location is the construction planned for?",
                "session_id": session_id,
                "session_state": "WAITING_FOR_LOCATION",
                "project": {"sqft": extracted_sqft, "location": None}
            }
        elif extracted_loc:
            session.city_region = extracted_loc
            session.state = 'WAITING_FOR_SQFT'
            session.save()
            return {
                "type": "sqft_request",
                "message": f"Sure! I can prepare a custom construction estimate for **{extracted_loc}**.\n\nFirst, how many square feet is the house?",
                "session_id": session_id,
                "session_state": "WAITING_FOR_SQFT"
            }
        else:
            session.state = 'WAITING_FOR_SQFT'
            session.save()
            return {
                "type": "sqft_request",
                "message": "Sure! I can prepare a custom construction estimate for you.\n\nFirst, how many square feet is the house?",
                "session_id": session_id,
                "session_state": "WAITING_FOR_SQFT"
            }

    # 2. ACTIVE HOUSE ESTIMATION SESSION STATE MACHINE HANDLERS (STATE HAS PRIORITY!)
    if session.state == 'WAITING_FOR_MATERIAL_LOCATION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            ans += "\n\n📍 *Please enter the city or location to check material prices.*"
            return {
                "type": "text",
                "message": ans,
                "session_id": session_id,
                "session_state": "WAITING_FOR_MATERIAL_LOCATION",
                "suggestions": sug
            }
        loc = extracted_loc or extract_location(user_message)
        if not loc and len(user_message.strip()) >= 3 and not user_message.strip().isdigit():
            loc = user_message.strip().title()

        if loc:
            session.state = 'START'
            material_type = session.pending_material or 'cement'
            session.pending_material = None
            session.save()

            web_res = perform_web_search(f"{material_type} price", location=loc)
            sources = web_res.get('results', [])
            context = web_res.get('extracted_context', '')
            live_used = web_res.get('success', False)

            system_prompt = (
                "You are ConstructAI civil engineering cost estimator.\n"
                f"User asked for {material_type} price in {loc}.\n"
                "Summarize web research into clean bullet points with brand name, price per bag/ton, unit, and indicative tag.\n"
                "Do NOT guarantee quotes. Tag prices as 'Current web-researched indicative price'.\n\n"
                f"WEB SEARCH CONTEXT:\n{context}\n"
            )
            ai_ans = call_groq_ai(system_prompt, f"{material_type} price in {loc}")
            if not ai_ans:
                ai_ans = f"Current indicative prices for **{loc}**:\n• PPC Cement: ~₹ 380 - ₹ 410 / 50kg bag\n• OPC 53 Cement: ~₹ 410 - ₹ 440 / 50kg bag\n• Fe-550D TMT Steel: ~₹ 53,500 - ₹ 56,500 / ton"

            return {
                "type": "web_research",
                "message": ai_ans,
                "session_id": session_id,
                "sources": sources,
                "live_web_pricing_used": live_used
            }
        else:
            return {
                "type": "location_request",
                "message": f"Please enter the city or location (e.g. Tenkasi, Madurai, Chennai) to check {session.pending_material or 'material'} prices.",
                "session_id": session_id,
                "session_state": "WAITING_FOR_MATERIAL_LOCATION"
            }

    if session.state == 'WAITING_FOR_SQFT':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            ans += "\n\n📐 *Please enter the house area in square feet (e.g. 1500 sq ft) to continue your estimate.*"
            return {
                "type": "text",
                "message": ans,
                "session_id": session_id,
                "session_state": "WAITING_FOR_SQFT",
                "suggestions": sug
            }
        elif extracted_sqft:
            session.inquired_sqft = extracted_sqft
            if session.city_region:
                session.state = 'RESEARCH'
                session.save()
                return trigger_research_and_cement_selection(session)
            else:
                session.state = 'WAITING_FOR_LOCATION'
                session.save()
                return {
                    "type": "location_request",
                    "message": f"Got it, **{extracted_sqft:,} sq ft**.\n\nWhich city or location is the house going to be constructed in?",
                    "session_id": session_id,
                    "session_state": "WAITING_FOR_LOCATION",
                    "project": {"sqft": extracted_sqft, "location": None}
                }
        else:
            return {
                "type": "sqft_request",
                "message": "Please enter a valid house built-up area in square feet (e.g., *1500 sq ft*).",
                "session_id": session_id,
                "session_state": "WAITING_FOR_SQFT"
            }

    if session.state == 'WAITING_FOR_LOCATION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            ans += "\n\n📍 *Please enter the city, town, district, or area where you plan to construct the house to continue your estimate.*"
            return {
                "type": "text",
                "message": ans,
                "session_id": session_id,
                "session_state": "WAITING_FOR_LOCATION",
                "suggestions": sug
            }
        elif extracted_loc:
            session.city_region = extracted_loc
            session.state = 'RESEARCH'
            session.save()
            return trigger_research_and_cement_selection(session)
        else:
            return {
                "type": "location_request",
                "message": "Please specify the city, town, district, or area where you plan to construct the house.",
                "session_id": session_id,
                "session_state": "WAITING_FOR_LOCATION"
            }

    if session.state == 'CEMENT_SELECTION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            materials_data = get_available_materials()
            return {
                "type": "cement_selection",
                "message": ans + "\n\n🧱 *Please select your preferred Cement brand below to continue:*",
                "session_id": session_id,
                "session_state": "CEMENT_SELECTION",
                "options": materials_data["cements"],
                "suggestions": sug
            }
        chosen_cement = parse_cement_choice(user_message)
        session.selected_cement = chosen_cement
        session.state = 'STEEL_SELECTION'
        session.save()

        materials_data = get_available_materials()
        steels = materials_data["steels"]

        return {
            "type": "steel_selection",
            "message": f"Selected **{chosen_cement}**. Next, select your preferred **Steel / TMT Rebar** brand:",
            "session_id": session_id,
            "session_state": "STEEL_SELECTION",
            "project": {
                "sqft": session.inquired_sqft,
                "location": session.city_region,
                "cement": chosen_cement
            },
            "options": steels
        }

    if session.state == 'STEEL_SELECTION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            materials_data = get_available_materials()
            return {
                "type": "steel_selection",
                "message": ans + "\n\n🔩 *Please select your preferred Steel / TMT Rebar brand below to continue:*",
                "session_id": session_id,
                "session_state": "STEEL_SELECTION",
                "options": materials_data["steels"],
                "suggestions": sug
            }
        chosen_steel = parse_steel_choice(user_message)
        session.selected_steel = chosen_steel
        session.state = 'WORKER_SELECTION'
        session.save()

        labour_cfg = get_active_labour_config()

        return {
            "type": "workforce_selection",
            "message": f"Selected **{chosen_steel}**. Select the daily workforce size for construction:",
            "session_id": session_id,
            "session_state": "WORKFORCE_SELECTION",
            "project": {
                "sqft": session.inquired_sqft,
                "location": session.city_region,
                "cement": session.selected_cement,
                "steel": chosen_steel
            },
            "options": [4, 6, 8, 10],
            "labour_wages_config": {
                "head_mason_daily_wage": labour_cfg.get("head_mason_daily_wage", 950) if labour_cfg else 950,
                "helper_daily_wage": labour_cfg.get("helper_daily_wage", 650) if labour_cfg else 650
            }
        }

    if session.state == 'WORKER_SELECTION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            labour_cfg = get_active_labour_config()
            return {
                "type": "workforce_selection",
                "message": ans + "\n\n👷 *Please select the daily workforce size (4, 6, 8, or 10 workers) below to continue:*",
                "session_id": session_id,
                "session_state": "WORKFORCE_SELECTION",
                "options": [4, 6, 8, 10],
                "suggestions": sug
            }
        worker_match = re.search(r'(\d+)', prompt_lower)
        worker_count = int(worker_match.group(1)) if worker_match else 8
        if worker_count not in [4, 6, 8, 10]:
            worker_count = 8

        session.selected_workers = worker_count
        session.state = 'PACKAGE_SELECTION'
        session.save()

        pkg_results = calculate_3_house_packages(
            sqft=session.inquired_sqft or 1500,
            location=session.city_region or "Default",
            selected_cement=session.selected_cement or "UltraTech PPC",
            selected_steel=session.selected_steel or "Tata Tiscon Fe-550D",
            selected_workers=worker_count
        )
        packages_data = pkg_results.get("packages", [])

        return {
            "type": "package_selection",
            "message": f"Here are the **3 Custom Construction Package Options** for your **{session.inquired_sqft:,} sq ft** house in **{session.city_region}** with **{worker_count} workers**:",
            "session_id": session_id,
            "session_state": "PACKAGE_SELECTION",
            "project": {
                "sqft": session.inquired_sqft,
                "location": session.city_region,
                "cement": session.selected_cement,
                "steel": session.selected_steel,
                "workforce_count": worker_count
            },
            "packages": packages_data
        }

    if session.state == 'PACKAGE_SELECTION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            pkg_results = calculate_3_house_packages(
                sqft=session.inquired_sqft or 1500,
                location=session.city_region or "Default",
                selected_cement=session.selected_cement or "UltraTech PPC",
                selected_steel=session.selected_steel or "Tata Tiscon Fe-550D",
                selected_workers=session.selected_workers or 8
            )
            return {
                "type": "package_selection",
                "message": ans + "\n\n📦 *Please select one of the construction packages (Economy, Standard, or Premium) below:*",
                "session_id": session_id,
                "session_state": "PACKAGE_SELECTION",
                "packages": pkg_results.get("packages", []),
                "suggestions": sug
            }
        selected_name = "Standard"
        if "economy" in prompt_lower:
            selected_name = "Economy"
        elif "premium" in prompt_lower or "luxury" in prompt_lower:
            selected_name = "Premium"

        session.selected_package = selected_name
        session.state = 'PACKAGE_CONFIRMATION'
        session.save()

        pkg_results = calculate_3_house_packages(
            sqft=session.inquired_sqft or 1500,
            location=session.city_region or "Default",
            selected_cement=session.selected_cement or "UltraTech PPC",
            selected_steel=session.selected_steel or "Tata Tiscon Fe-550D",
            selected_workers=session.selected_workers or 8
        )
        packages_data = pkg_results.get("packages", [])
        selected_pkg_obj = next((p for p in packages_data if p['name'].lower() == selected_name.lower()), packages_data[1] if len(packages_data) > 1 else None)

        return {
            "type": "confirmation",
            "message": f"You selected the **{selected_name}** package for **{session.inquired_sqft:,} sq ft** in **{session.city_region}**. Please confirm to finalize your estimate:",
            "session_id": session_id,
            "session_state": "PACKAGE_CONFIRMATION",
            "project": {
                "sqft": session.inquired_sqft,
                "location": session.city_region,
                "cement": session.selected_cement,
                "steel": session.selected_steel,
                "workforce_count": session.selected_workers
            },
            "selected_package": selected_pkg_obj
        }

    if session.state == 'PACKAGE_CONFIRMATION':
        if is_technical_question(prompt_lower):
            ans, sug = process_technical_answer(user_message, session)
            return {
                "type": "text",
                "message": ans + "\n\n📌 *Please confirm your estimate (click Confirm or say Yes) to complete the house package process.*",
                "session_id": session_id,
                "session_state": "PACKAGE_CONFIRMATION",
                "suggestions": sug
            }
        if any(cw in prompt_lower for cw in ['confirm', 'yes', 'ok', 'proceed', 'select', 'accept']):
            session.is_confirmed = True
            session.state = 'CONFIRMED'
            session.save()

            pkg_results = calculate_3_house_packages(
                sqft=session.inquired_sqft or 1500,
                location=session.city_region or "Default",
                selected_cement=session.selected_cement or "UltraTech PPC",
                selected_steel=session.selected_steel or "Tata Tiscon Fe-550D",
                selected_workers=session.selected_workers or 8
            )
            packages_data = pkg_results.get("packages", [])
            selected_name = session.selected_package or "Standard"
            selected_pkg_obj = next((p for p in packages_data if p['name'].lower() == selected_name.lower()), packages_data[1] if len(packages_data) > 1 else None)

            total_val = selected_pkg_obj.get('total_cost', 0) if selected_pkg_obj else 0
            if total_val >= 10000000:
                cost_str = f"₹ {(total_val / 10000000):.2f} Cr"
            elif total_val >= 100000:
                cost_str = f"₹ {(total_val / 100000):.2f} Lakhs"
            else:
                cost_str = f"₹ {total_val:,.2f}"

            return {
                "type": "text",
                "message": f"🎉 **House Construction Estimate Finalized!**\n\n📍 **Location:** {session.city_region}\n📐 **Total Built-up Area:** {session.inquired_sqft:,} sq ft\n📦 **Package Selected:** {session.selected_package}\n💵 **Estimated Total Budget:** {cost_str}\n\nThank you for using ConstructAI!",
                "session_id": session_id,
                "session_state": "CONFIRMED",
                "is_confirmed": True,
                "project": {
                    "sqft": session.inquired_sqft,
                    "location": session.city_region,
                    "cement": session.selected_cement,
                    "steel": session.selected_steel,
                    "workforce_count": session.selected_workers
                },
                "selected_package": selected_pkg_obj,
                "suggestions": ["🏠 Start New Estimate", "🔩 Fe500 vs Fe550", "🧱 Cement Types"]
            }
        else:
            session.state = 'CEMENT_SELECTION'
            session.save()
            materials_data = get_available_materials()
            return {
                "type": "cement_selection",
                "message": "Let's change your selections. Please choose your preferred **Cement** brand:",
                "session_id": session_id,
                "session_state": "CEMENT_SELECTION",
                "options": materials_data["cements"]
            }

    # 3. IDLE / GENERAL QUESTION PROCESSING (State is START, IDLE, or CONFIRMED)
    if intent == "greeting":
        return {
            "type": "text",
            "message": "👋 **Hello! Welcome to ConstructAI.**\n\nI am your AI assistant specialized in civil engineering & house construction.\n\n• **Cost Estimation:** Say *'I want to build a house'*\n• **Material Prices:** Say *'Cement price in Tenkasi'*\n• **Technical Questions:** Say *'What is the difference between Fe500 and Fe550?'*\n\nHow can I help you today?",
            "session_id": session_id,
            "session_state": session.state,
            "suggestions": ["🏠 Build a House", "🔩 Fe500 vs Fe550", "🧱 Cement Types", "🏗️ TMT Steel"]
        }

    if any(p_kw in prompt_lower for p_kw in ['cement price', 'steel price', 'tmt price', 'brick price', 'sand price']):
        loc = extracted_loc or session.city_region
        material_type = 'cement' if 'cement' in prompt_lower else ('steel' if 'steel' in prompt_lower or 'tmt' in prompt_lower else 'material')
        if not loc:
            session.state = 'WAITING_FOR_MATERIAL_LOCATION'
            session.pending_material = material_type
            session.save()
            safe_print(f"INTENT = MATERIAL_PRICE_LOCATION_REQUIRED")
            safe_print(f"NEXT_STATE = WAITING_FOR_MATERIAL_LOCATION")
            safe_print("="*50 + "\n")
            return {
                "type": "location_request",
                "message": f"Sure! Which city or location should I check the {material_type} price for?",
                "session_id": session_id,
                "session_state": "WAITING_FOR_MATERIAL_LOCATION"
            }
        else:
            # Run Live Web Research for price query
            web_res = perform_web_search(user_message, location=loc)
            sources = web_res.get('results', [])
            context = web_res.get('extracted_context', '')
            live_used = web_res.get('success', False)

            system_prompt = (
                "You are ConstructAI civil engineering cost estimator.\n"
                f"User asked for material price in {loc}.\n"
                "Summarize web research into clean bullet points with brand name, price per bag/ton, unit, and indicative tag.\n"
                "Do NOT guarantee quotes. Tag prices as 'Current web-researched indicative price'.\n\n"
                f"WEB SEARCH CONTEXT:\n{context}\n"
            )
            ai_ans = call_groq_ai(system_prompt, user_message)
            if not ai_ans:
                ai_ans = f"Current indicative prices for **{loc}**:\n• PPC Cement: ~₹ 380 - ₹ 410 / 50kg bag\n• OPC 53 Cement: ~₹ 410 - ₹ 440 / 50kg bag\n• Fe-550D TMT Steel: ~₹ 53,500 - ₹ 56,500 / ton"

            safe_print(f"INTENT = MATERIAL_PRICE_WITH_LOCATION")
            safe_print(f"NEXT_STATE = {session.state}")
            safe_print("="*50 + "\n")

            return {
                "type": "web_research",
                "message": ai_ans,
                "session_id": session_id,
                "sources": sources,
                "live_web_pricing_used": live_used
            }

    if not is_valid_domain:
        return {
            "type": "off_topic",
            "message": "I'm ConstructAI, a construction and civil engineering assistant. I can help with house construction, materials, labour, structural concepts and cost estimation.",
            "session_id": session_id,
            "session_state": session.state,
            "suggestions": ["🏠 Build a House", "🔩 Fe500 vs Fe550", "🧱 Cement Types"]
        }

    # Answer all general construction questions via RAG / AI
    ans, sug = process_technical_answer(user_message, session)
    return {
        "type": "text",
        "message": ans,
        "session_id": session_id,
        "session_state": session.state,
        "suggestions": sug
    }



def trigger_research_and_cement_selection(session):
    """Executes live web research and transitions to CEMENT_SELECTION state."""
    # Perform live web research
    web_res = perform_web_search("current cement and steel price", location=session.city_region)
    sources = web_res.get('results', [])
    live_used = web_res.get('success', False)

    session.web_sources_used = sources
    session.state = 'CEMENT_SELECTION'
    session.save()

    materials_data = get_available_materials()
    cements = materials_data["cements"]

    msg = f"Great. I have:\n📐 **Area:** {session.inquired_sqft:,} sq ft\n📍 **Location:** {session.city_region}\n\nI've checked current market info for **{session.city_region}**. Please choose your preferred **Cement** brand:"
    if not live_used:
        msg += "\n\n*(Note: Live web pricing was unavailable, so this estimate uses configured database rates.)*"

    return {
        "type": "cement_selection",
        "message": msg,
        "session_id": session.session_id,
        "session_state": "CEMENT_SELECTION",
        "project": {
            "sqft": session.inquired_sqft,
            "location": session.city_region
        },
        "options": cements,
        "sources": sources,
        "live_web_pricing_used": live_used
    }


def parse_cement_choice(prompt):
    prompt_lower = prompt.lower()
    if 'acc' in prompt_lower:
        return 'ACC Concrete+'
    if 'ambuja' in prompt_lower:
        return 'Ambuja Kawach'
    if 'birla' in prompt_lower:
        return 'Birla Gold'
    if 'shree' in prompt_lower:
        return 'Shree Cement'
    return 'UltraTech PPC'


def parse_steel_choice(prompt):
    prompt_lower = prompt.lower()
    if 'jsw' in prompt_lower or 'neosteel' in prompt_lower:
        return 'JSW Neosteel'
    if 'jindal' in prompt_lower or 'panther' in prompt_lower:
        return 'Jindal Panther'
    if 'sail' in prompt_lower:
        return 'SAIL TMT'
    return 'Tata Tiscon Fe-550D'
