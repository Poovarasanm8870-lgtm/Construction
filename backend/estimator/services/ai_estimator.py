import re
from .pricing_engine import calculate_construction_cost

def process_ai_chat_query(prompt, current_config=None):
    """
    Parses user queries, extracts house specs, runs the Indian Rupee calculation engine,
    and returns a clean, consumer-friendly natural language response with Indian Rupees (₹).
    """
    prompt_lower = prompt.lower()

    # Extract numbers like '2000 sq ft' or '3 floors'
    sqft_match = re.search(r'(\d+)\s*(?:sq\s*ft|square\s*feet|sqft|ft2)', prompt_lower)
    floors_match = re.search(r'(\d+)\s*(?:floors?|stories|story)', prompt_lower)

    sqft = int(sqft_match.group(1)) if sqft_match else (current_config.get('sqft', 2200) if current_config else 2200)
    floors = int(floors_match.group(1)) if floors_match else (current_config.get('floors', 2) if current_config else 2)

    # Style detection
    style = 'MODERN'
    if 'brick' in prompt_lower or 'colonial' in prompt_lower or 'classic' in prompt_lower:
        style = 'COLONIAL'
    elif 'minimalist' in prompt_lower or 'concrete' in prompt_lower:
        style = 'MINIMALIST'
    elif 'timber' in prompt_lower or 'nordic' in prompt_lower:
        style = 'NORDIC'
    elif 'glass' in prompt_lower or 'futuristic' in prompt_lower:
        style = 'FUTURISTIC'
    elif current_config and 'style' in current_config:
        style = current_config['style']

    # Region detection
    region = 'Mumbai MMR / Maharashtra'
    if 'delhi' in prompt_lower or 'ncr' in prompt_lower or 'gurgaon' in prompt_lower:
        region = 'Delhi NCR / Gurgaon / Noida'
    elif 'bangalore' in prompt_lower or 'bengaluru' in prompt_lower or 'karnataka' in prompt_lower:
        region = 'Bengaluru / Karnataka'
    elif 'hyderabad' in prompt_lower:
        region = 'Hyderabad / Telangana'
    elif 'chennai' in prompt_lower:
        region = 'Chennai / Tamil Nadu'
    elif 'pune' in prompt_lower:
        region = 'Pune / Maharashtra'
    elif current_config and 'region' in current_config:
        region = current_config['region']

    # Grade detection
    finish_grade = 'PREMIUM'
    if 'luxury' in prompt_lower or 'marble' in prompt_lower or 'high end' in prompt_lower:
        finish_grade = 'LUXURY'
    elif 'standard' in prompt_lower or 'basic' in prompt_lower:
        finish_grade = 'STANDARD'
    elif current_config and 'finish_grade' in current_config:
        finish_grade = current_config['finish_grade']

    calc = calculate_construction_cost(
        sqft=sqft,
        floors=floors,
        style=style,
        finish_grade=finish_grade,
        region=region
    )

    summary = calc['summary']
    materials = calc['material_quantities']

    ai_text = (
        f"🏠 **ConstructAI Smart Estimate**\n\n"
        f"Estimated total construction cost for a **{sqft:,} sq ft** ({calc['bhk_label']}, {floors}-story, {finish_grade.title()} grade) home in **{region}** is **{summary['formatted_grand_total']}** (approx. **₹ {summary['rate_per_sqft_inr']:,}/sq ft**).\n\n"
        f"**Cost Breakdown (in Indian Rupees ₹):**\n"
        f"• **Building Materials:** ₹ {summary['total_material_cost_inr']:,}\n"
        f"• **Labor & Contractor Wage:** ₹ {summary['total_labor_cost_inr']:,}\n"
        f"• **Approvals & Reserve (10%):** ₹ {summary['contingency_inr']:,}\n"
        f"• **Grand Total:** **{summary['formatted_grand_total']}**\n\n"
        f"📦 **Estimated Key Material Requirements:**\n"
        f"• Cement: **{materials['cement_bags']:,} Bags** (50kg)\n"
        f"• TMT Steel Rebar: **{materials['steel_tons']} Tons**\n"
        f"• Bricks/Blocks: **{materials['bricks_count']:,} Units**\n"
        f"• Flooring Tiles: **{materials['tiles_sqft']:,} Sq Ft**\n\n"
        f"💡 *Tip: Adjust your house sliders or floor count to instantly recalculate these material quantities.*"
    )

    return {
        "text": ai_text,
        "calculation": calc,
        "parameters_used": {
            "sqft": sqft,
            "floors": floors,
            "style": style,
            "finish_grade": finish_grade,
            "region": region
        }
    }
