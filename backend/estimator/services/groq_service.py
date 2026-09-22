import os
import re
from .pricing_engine import calculate_construction_cost
from .vector_db import query_vector_db_context

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

    region = 'Mumbai MMR / Maharashtra'
    if 'delhi' in prompt_lower or 'gurgaon' in prompt_lower:
        region = 'Delhi NCR / Gurgaon / Noida'
    elif 'bangalore' in prompt_lower or 'bengaluru' in prompt_lower:
        region = 'Bengaluru / Karnataka'
    elif 'hyderabad' in prompt_lower:
        region = 'Hyderabad / Telangana'

    finish_grade = 'PREMIUM'
    if 'luxury' in prompt_lower or 'marble' in prompt_lower:
        finish_grade = 'LUXURY'
    elif 'standard' in prompt_lower or 'basic' in prompt_lower:
        finish_grade = 'STANDARD'

    return sqft, floors, style, finish_grade, region


def handle_dedicated_topic_query(prompt_lower):
    """
    Handles focused UX queries like 'labour', 'cement', 'plumbing', 'electrical'
    using clean, non-technical language.
    """
    # Labour query
    if prompt_lower.strip() in ['labour', 'labor'] or ('labour' in prompt_lower and not any(char.isdigit() for char in prompt_lower)) or ('labor' in prompt_lower and not any(char.isdigit() for char in prompt_lower)):
        return (
            "👷 **ConstructAI Skilled Labour & Masonry Rate Card (India 2026)**\n\n"
            "• **RCC Structure & Centering Labour:** ₹ 240 / sq ft\n"
            "• **Brickwork & Wall Plastering Labour:** ₹ 110 / sq ft\n"
            "• **Tile Laying & Flooring Labour:** ₹ 45 / sq ft\n"
            "• **Internal & External Painting Labour:** ₹ 22 / sq ft\n"
            "• **Plumbing & Electrical Technical Labour:** ₹ 160 / sq ft\n\n"
            "### 🛠️ Daily Wage Rates (Standard 8-Hour Shift):\n"
            "• **Skilled Head Mason (Rajmistri):** ₹ 950 - ₹ 1,100 / day\n"
            "• **Bar Bending Steel Worker:** ₹ 900 - ₹ 1,050 / day\n"
            "• **Certified Plumber / Electrician:** ₹ 850 - ₹ 1,000 / day\n"
            "• **Unskilled Helper (Mazdoor):** ₹ 650 - ₹ 750 / day\n\n"
            "📌 *Note: Turnkey packages include full labor supervision, site insurance, and safety equipment.*"
        )

    # Cement query
    if prompt_lower.strip() in ['cement'] or ('cement' in prompt_lower and not any(char.isdigit() for char in prompt_lower)):
        return (
            "🧱 **ConstructAI Cement Specifications & Pricing Guide (2026)**\n\n"
            "• **UltraTech 53 Grade PPC Cement:** ₹ 380 / 50kg bag\n"
            "• **ACC Concrete+ Weather Shield:** ₹ 395 / 50kg bag\n"
            "• **Ambuja Kawach Waterproof Cement:** ₹ 410 / 50kg bag\n"
            "• **Birla Gold / Shree Cement:** ₹ 375 / 50kg bag\n\n"
            "### 📊 Material Consumption & Engineering Standards:\n"
            "• **RCC Structural Consumption:** ~0.4 Bags per sq ft of built-up area\n"
            "• **RCC Slab Concrete Mix (M25 Grade):** 1 : 1.5 : 3 (1 Cement : 1.5 Sand : 3 Aggregate)\n"
            "• **Wall Masonry Mortar (1:6):** 1 Bag Cement per 120 AAC Blocks / Bricks\n"
            "• **Wall Plaster Mortar (1:4):** 1 Bag Cement covers ~90 sq ft (12mm thickness)\n\n"
            "📌 *Note: We source 100% factory-sealed fresh batch cement directly from UltraTech & ACC authorized stockists.*"
        )

    # Plumbing query
    if 'plumbing' in prompt_lower and not any(char.isdigit() for char in prompt_lower):
        return (
            "🚿 **ConstructAI Professional Plumbing Rates & Specs**\n\n"
            "• **Concealed Water & Drainage Line Setup:** ₹ 180 / sq ft\n"
            "• **Piping Specification:** Astral / Supreme CPVC (Hot & Cold) & UPVC Drainage\n"
            "• **Jaquar / Kohler Fixture Fitting:** Included in Turnkey Package\n"
            "• **Overhead Terrace Water Tank Setup:** 1,000L Triple-Layer UV Shield Tank Included\n"
            "• **Pressure Testing:** 10 bar zero-leakage hydro testing completed before wall tiling."
        )

    # Electrical query
    if ('electrical' in prompt_lower or 'wiring' in prompt_lower) and not any(char.isdigit() for char in prompt_lower):
        return (
            "⚡ **ConstructAI Electrical System Rates & Specs**\n\n"
            "• **Concealed Heavy-Duty Copper Wiring:** ₹ 160 / sq ft\n"
            "• **Wiring Brand:** Polycab Flame-Retardant FRLS Copper Wires\n"
            "• **Modular Switches:** Schneider Electric / Havells Modular Switches & Plates\n"
            "• **Distribution Board & MCB:** Legrand / Siemens 3-Phase Main Distribution Board\n"
            "• **EV Charger & Solar Prep:** Concealed conduit prep included."
        )

    return None


def query_groq_ai_estimator(user_prompt, current_config=None):
    """
    Queries Groq AI (Llama 3 70B) with dynamic parameter extraction and human-friendly UX copy.
    """
    prompt_lower = user_prompt.lower() if user_prompt else ""

    # 1. Check for dedicated topic queries like 'labour', 'cement', 'plumbing', 'electrical'
    topic_response = handle_dedicated_topic_query(prompt_lower)
    if topic_response:
        return {
            "text": topic_response,
            "model_used": "ConstructAI Senior Civil Engineer"
        }

    # 2. Extract parameters or sqft if user asked for a house estimate
    sqft, floors, style, finish_grade, region = parse_parameters_from_prompt(user_prompt, current_config)
    target_sqft = sqft if sqft else (current_config.get('sqft', 1500) if current_config else 1500)

    # Compute Civil Engineering Calculations for extracted parameters
    calc = calculate_construction_cost(
        sqft=target_sqft,
        floors=floors,
        style=style,
        finish_grade=finish_grade,
        region=region
    )

    summary = calc['summary']
    materials = calc['material_quantities']

    cement_bags = materials['cement_bags']
    cement_cost = round(cement_bags * 380)

    labor_total = summary['total_labor_cost_inr']
    labor_masonry = round(labor_total * 0.65)
    labor_plumbing_elec = round(labor_total * 0.22)
    labor_finishing = round(labor_total * 0.13)

    # Vector DB RAG Retrieval
    vector_context = query_vector_db_context(user_prompt, top_k=2)

    if GROQ_AVAILABLE and GROQ_API_KEY:
        try:
            client = Groq(api_key=GROQ_API_KEY)
            
            system_prompt = (
                "You are ConstructAI's senior civil engineer & construction cost advisor for India.\n"
                f"User requested analysis for a {target_sqft:,} sq ft project ({calc['bhk_label']}, {floors} Floors, {style} style, {finish_grade} grade in {region}).\n\n"
                "Whenever a user requests a cost or material estimate for a house footprint, structure your response "
                "using a distinct Project Cost Summary card at the very beginning of your output, followed by detailed bullet point breakdowns.\n"
                "ALWAYS format all breakdown outputs as concise BULLET POINTS (`• Item`) using clear, professional, user-friendly language.\n"
                "IMPORTANT: You MUST provide CEMENT details and LABOUR details SEPARATELY in itemized bullet points.\n\n"
                f"DYNAMIC CIVIL CALCULATIONS context for {target_sqft:,} sq ft:\n"
                f"• Total Area: {target_sqft:,} sq ft\n"
                f"• Total Estimated Cost: {summary['formatted_grand_total']} (Base Rate: ₹ {summary['rate_per_sqft_inr']:,}/sq ft)\n"
                f"• Cement Breakdown: {cement_bags:,} Bags (50kg UltraTech 53 Grade) @ ₹ {cement_cost:,}\n"
                f"• Labour Breakdown (Total ₹ {labor_total:,}): Masonry & RCC: ₹ {labor_masonry:,}, Plumbing & Electrical: ₹ {labor_plumbing_elec:,}, Finishing & Painting: ₹ {labor_finishing:,}\n"
                f"• Steel Breakdown: {materials['steel_tons']} Tons (Tata Tiscon Fe-550D)\n"
                f"• Bricks Breakdown: {materials['bricks_count']:,} Pcs (AAC / Clay Bricks)\n\n"
                f"VECTOR DATABASE RETRIEVED CONTEXT:\n{vector_context}\n\n"
                "STRICT RESPONSE FORMAT:\n"
                "1. PROJECT COST SUMMARY CARD (HTML Callout Container):\n"
                '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 20px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 20px;">\n'
                '  <div style="font-size: 11px; text-transform: uppercase; color: #fbbf24; font-weight: 700; tracking: 1px; margin-bottom: 8px;">🏗️ ConstructAI Project Cost Summary</div>\n'
                '  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; text-align: left;">\n'
                f'    <div><span style="font-size: 11px; color: #94a3b8;">Total Sq Ft:</span><br/><strong style="font-size: 16px; color: white;">{target_sqft:,} sq ft</strong></div>\n'
                f'    <div><span style="font-size: 11px; color: #94a3b8;">Estimated Cost:</span><br/><strong style="font-size: 20px; color: #f59e0b;">{summary["formatted_grand_total"]}</strong></div>\n'
                f'    <div><span style="font-size: 11px; color: #94a3b8;">Package Type:</span><br/><strong style="font-size: 15px; color: #34d399;">{finish_grade.title()} Turnkey</strong></div>\n'
                f'    <div><span style="font-size: 11px; color: #94a3b8;">Location:</span><br/><strong style="font-size: 15px; color: white;">{region}</strong></div>\n'
                '  </div>\n'
                '</div>\n\n'
                "2. DETAILED SEPARATE BREAKDOWN SECTIONS:\n"
                "### 👷 1. Itemized Labour Breakdown (Separately Specified)\n"
                f"• **Base Rate:** ₹ {summary['rate_per_sqft_inr']:,} per sq ft for {target_sqft:,} sq ft\n"
                f"• **Total Labour Wages (30%):** ₹ {labor_total:,}\n"
                f"• **Skilled Masonry & RCC Structure Labour:** ₹ {labor_masonry:,} (Masons @ ₹ 950/day)\n"
                f"• **Plumbing & Electrical Technical Labour:** ₹ {labor_plumbing_elec:,}\n"
                f"• **Painting & Finishing Labour:** ₹ {labor_finishing:,}\n\n"
                "### 🧱 2. Cement Material Breakdown (Separately Specified)\n"
                f"• **Total Cement Quantity:** {cement_bags:,} Bags (50kg Bags)\n"
                f"• **Estimated Cement Cost:** ₹ {cement_cost:,} (@ ₹ 380 per bag)\n"
                f"• **Grade & Brand Specification:** UltraTech 53 Grade / ACC Concrete+ (M25 RCC Mix)\n\n"
                "### 📦 3. Other Essential Material Quantities\n"
                f"• **TMT Steel Rebar:** {materials['steel_tons']} Tons (Tata Tiscon Fe-550D)\n"
                f"• **Bricks / AAC Blocks:** {materials['bricks_count']:,} Pcs\n"
                f"• **Flooring Tiles:** {materials['tiles_sqft']:,} Sq Ft\n\n"
                "### ⏳ 4. Project Timeline & Approvals\n"
                "• **Estimated Build Duration:** Months\n"
                f"• **Approvals & Reserve Buffer:** ₹ {summary['contingency_inr']:,}\n\n"
                "📌 *Note: Final quotation is subject to site soil inspection and detailed structural drawing approval.*"
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
                "calculation": calc,
                "model_used": "ConstructAI Senior Civil Engineer"
            }
        except Exception as e:
            pass

    # Dynamic Engine Response matching requested sqft with user-friendly UX copy
    ai_text = (
        '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 20px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 20px;">\n'
        '  <div style="font-size: 11px; text-transform: uppercase; color: #fbbf24; font-weight: 700; tracking: 1px; margin-bottom: 8px;">🏗️ ConstructAI Project Cost Summary</div>\n'
        '  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; text-align: left;">\n'
        f'    <div><span style="font-size: 11px; color: #94a3b8;">Total Sq Ft:</span><br/><strong style="font-size: 16px; color: white;">{target_sqft:,} sq ft</strong></div>\n'
        f'    <div><span style="font-size: 11px; color: #94a3b8;">Estimated Cost:</span><br/><strong style="font-size: 20px; color: #f59e0b;">{summary["formatted_grand_total"]}</strong></div>\n'
        f'    <div><span style="font-size: 11px; color: #94a3b8;">Package Type:</span><br/><strong style="font-size: 15px; color: #34d399;">{finish_grade.title()} Turnkey</strong></div>\n'
        f'    <div><span style="font-size: 11px; color: #94a3b8;">Location:</span><br/><strong style="font-size: 15px; color: white;">{region}</strong></div>\n'
        '  </div>\n'
        '</div>\n\n'
        f"### 👷 1. Itemized Labour Breakdown (Separately Specified)\n"
        f"• **Base Rate:** ₹ {summary['rate_per_sqft_inr']:,} per sq ft ({calc['bhk_label']}, {floors} Floors)\n"
        f"• **Total Labour Wages (30%):** ₹ {labor_total:,}\n"
        f"• **Skilled Masonry & RCC Structure Labour:** ₹ {labor_masonry:,} (Skilled Masons @ ₹ 950/day)\n"
        f"• **Plumbing & Electrical Technical Labour:** ₹ {labor_plumbing_elec:,}\n"
        f"• **Painting & Finishing Labour:** ₹ {labor_finishing:,}\n\n"
        f"### 🧱 2. Cement Material Breakdown (Separately Specified)\n"
        f"• **Total Cement Quantity:** {cement_bags:,} Bags (50kg Bags)\n"
        f"• **Estimated Cement Cost:** ₹ {cement_cost:,} (@ ₹ 380 per bag)\n"
        f"• **Brand & Grade Specification:** UltraTech 53 Grade / ACC Concrete+ (IS 456 M25 Mix)\n\n"
        f"### 📦 3. Other Essential Material Quantities\n"
        f"• **Total Material Budget (55%):** ₹ {summary['total_material_cost_inr']:,}\n"
        f"• **TMT Steel Rebar:** {materials['steel_tons']} Tons (Tata Tiscon Fe-550D)\n"
        f"• **Bricks / AAC Blocks:** {materials['bricks_count']:,} Pcs\n"
        f"• **Flooring Tiles:** {materials['tiles_sqft']:,} Sq Ft\n\n"
        f"### ⏳ 4. Project Timeline & Approvals\n"
        f"• **Estimated Build Duration:** 6 - 8 Months\n"
        f"• **Approvals & 10% Reserve Buffer:** ₹ {summary['contingency_inr']:,}\n\n"
        f"📌 *Note: Calculated dynamically for exact area of {target_sqft:,} sq ft.*"
    )

    return {
        "text": ai_text,
        "calculation": calc,
        "model_used": "ConstructAI Senior Civil Engineer"
    }
