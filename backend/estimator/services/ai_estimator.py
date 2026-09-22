import os
import re
from .pricing_engine import calculate_construction_cost
from .vector_db import query_vector_db_context

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

def parse_parameters_from_prompt(prompt, current_config=None):
    prompt_lower = prompt.lower() if prompt else ""

    # 1. Regex for sqft extraction
    sqft = None
    sqft_match = re.search(r'(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)', prompt_lower)
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

    if not sqft:
        if current_config and isinstance(current_config, dict):
            sqft = int(current_config.get('sqft', 2200))
        else:
            sqft = 2200

    # 2. Floors extraction
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
    elif current_config and isinstance(current_config, dict) and current_config.get('floors'):
        floors = int(current_config.get('floors'))

    # 3. Style extraction
    style = 'MODERN'
    if 'brick' in prompt_lower or 'colonial' in prompt_lower or 'classic' in prompt_lower:
        style = 'COLONIAL'
    elif 'minimalist' in prompt_lower or 'concrete' in prompt_lower:
        style = 'MINIMALIST'
    elif 'timber' in prompt_lower or 'nordic' in prompt_lower:
        style = 'NORDIC'
    elif 'glass' in prompt_lower or 'futuristic' in prompt_lower:
        style = 'FUTURISTIC'
    elif current_config and isinstance(current_config, dict) and current_config.get('style'):
        style = current_config.get('style')

    # 4. Region extraction
    region = 'Mumbai MMR / Maharashtra'
    if 'delhi' in prompt_lower or 'ncr' in prompt_lower or 'gurgaon' in prompt_lower or 'noida' in prompt_lower:
        region = 'Delhi NCR / Gurgaon / Noida'
    elif 'bangalore' in prompt_lower or 'bengaluru' in prompt_lower or 'karnataka' in prompt_lower:
        region = 'Bengaluru / Karnataka'
    elif 'hyderabad' in prompt_lower or 'telangana' in prompt_lower:
        region = 'Hyderabad / Telangana'
    elif 'chennai' in prompt_lower or 'tamil nadu' in prompt_lower:
        region = 'Chennai / Tamil Nadu'
    elif 'pune' in prompt_lower:
        region = 'Pune / Maharashtra'
    elif current_config and isinstance(current_config, dict) and current_config.get('region'):
        region = current_config.get('region')

    # 5. Finish grade extraction
    finish_grade = 'PREMIUM'
    if 'luxury' in prompt_lower or 'marble' in prompt_lower or 'high end' in prompt_lower:
        finish_grade = 'LUXURY'
    elif 'standard' in prompt_lower or 'basic' in prompt_lower or 'budget' in prompt_lower:
        finish_grade = 'STANDARD'
    elif current_config and isinstance(current_config, dict):
        finish_grade = current_config.get('finishGrade') or current_config.get('finish_grade') or 'PREMIUM'

    return sqft, floors, style, finish_grade, region


def process_ai_chat_query(prompt, current_config=None):
    """
    Parses user queries, extracts custom parameters (sqft, floors, region), queries Vector DB RAG,
    runs the calculation engine, and queries Groq AI (Llama 3 70B).
    """
    sqft, floors, style, finish_grade, region = parse_parameters_from_prompt(prompt, current_config)

    # Compute Civil Engineering Calculations for custom extracted parameters
    calc = calculate_construction_cost(
        sqft=sqft,
        floors=floors,
        style=style,
        finish_grade=finish_grade,
        region=region
    )

    summary = calc['summary']
    materials = calc['material_quantities']

    # Vector DB RAG Retrieval
    vector_context = query_vector_db_context(prompt, top_k=2)

    groq_api_key = os.environ.get('GROQ_API_KEY')

    if GROQ_AVAILABLE and groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            system_context = (
                "You are ConstructAI's senior civil engineer & construction cost estimator for India powered by Vector DB.\n"
                f"User requested dynamic estimation for: {sqft:,} sq ft ({calc['bhk_label']}, {floors} Floors, {style} style, {finish_grade} grade in {region}).\n"
                "Answer the user query accurately in Indian Rupees (₹) using Lakhs/Crores formatting.\n"
                f"VECTOR DATABASE RETRIEVED CONTEXT:\n{vector_context}\n\n"
                "Use the following calculated context as exact reference for your breakdown:\n"
                f"• Footprint: {sqft:,} sq ft ({calc['bhk_label']}, {floors} Floors)\n"
                f"• Style: {style}, Region: {region}, Grade: {finish_grade}\n"
                f"• Estimated Total Cost: {summary['formatted_grand_total']} (Base Rate: ₹ {summary['rate_per_sqft_inr']:,}/sq ft)\n"
                f"• Material Cost (55%): ₹ {summary['total_material_cost_inr']:,}\n"
                f"• Labor Cost (30%): ₹ {summary['total_labor_cost_inr']:,}\n"
                f"• Materials: Cement: {materials['cement_bags']:,} bags (50kg), Steel: {materials['steel_tons']} tons, "
                f"Bricks: {materials['bricks_count']:,} units, Tiles: {materials['tiles_sqft']:,} sq ft.\n\n"
                "Keep your response structured in BULLET POINTS (`• Item`), clear, and focused on practical Indian construction advice."
            )

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=750
            )

            ai_text = completion.choices[0].message.content
            return {
                "text": ai_text,
                "calculation": calc,
                "parameters_used": {
                    "sqft": sqft,
                    "floors": floors,
                    "style": style,
                    "finish_grade": finish_grade,
                    "region": region,
                    "model_used": "Groq Llama 3 70B"
                }
            }
        except Exception as e:
            pass

    # Dynamic Deterministic Engine Response matching exact sqft
    ai_text = (
        f"🏠 **ConstructAI Smart Estimate Engine ({sqft:,} Sq Ft Project)**\n\n"
        f"Estimated total construction cost for a **{sqft:,} sq ft** ({calc['bhk_label']}, {floors}-story, {finish_grade.title()} grade) home in **{region}** is **{summary['formatted_grand_total']}** (approx. **₹ {summary['rate_per_sqft_inr']:,}/sq ft**).\n\n"
        f"**Cost Breakdown (in Indian Rupees ₹):**\n"
        f"• **Building Materials (55%):** ₹ {summary['total_material_cost_inr']:,}\n"
        f"• **Labor & Contractor Wage (30%):** ₹ {summary['total_labor_cost_inr']:,}\n"
        f"• **Approvals & Reserve (10%):** ₹ {summary['contingency_inr']:,}\n"
        f"• **Grand Total:** **{summary['formatted_grand_total']}**\n\n"
        f"📦 **Estimated Key Material Requirements:**\n"
        f"• Cement: **{materials['cement_bags']:,} Bags** (50kg UltraTech / ACC)\n"
        f"• TMT Steel Rebar: **{materials['steel_tons']} Tons** (Tata Tiscon Fe-550D)\n"
        f"• Bricks/Blocks: **{materials['bricks_count']:,} Units**\n"
        f"• Flooring Tiles: **{materials['tiles_sqft']:,} Sq Ft**\n\n"
        f"📌 *Note: Custom dynamic calculation computed for exact user requested area of {sqft:,} sq ft.*"
    )

    return {
        "text": ai_text,
        "calculation": calc,
        "parameters_used": {
            "sqft": sqft,
            "floors": floors,
            "style": style,
            "finish_grade": finish_grade,
            "region": region,
            "model_used": "Dynamic Civil Calculation Engine"
        }
    }
