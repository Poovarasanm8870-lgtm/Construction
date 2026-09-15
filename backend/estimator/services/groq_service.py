import os
from .pricing_engine import calculate_construction_cost

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

def query_groq_ai_estimator(user_prompt, current_config=None):
    """
    Queries Groq AI (Llama 3 70B) with civil engineering context & system instructions.
    Returns structured text response, calculation payload, and parameter metadata.
    """
    sqft = current_config.get('sqft', 2200) if current_config else 2200
    floors = current_config.get('floors', 2) if current_config else 2
    style = current_config.get('style', 'MODERN') if current_config else 'MODERN'
    finish_grade = current_config.get('finishGrade', 'PREMIUM') if current_config else 'PREMIUM'
    region = current_config.get('region', 'Mumbai MMR / Maharashtra') if current_config else 'Mumbai MMR / Maharashtra'

    # Compute Civil Engineering Calculations
    calc = calculate_construction_cost(
        sqft=sqft,
        floors=floors,
        style=style,
        finish_grade=finish_grade,
        region=region
    )

    summary = calc['summary']
    materials = calc['material_quantities']

    if GROQ_AVAILABLE and GROQ_API_KEY:
        try:
            client = Groq(api_key=GROQ_API_KEY)
            
            system_prompt = (
                "You are ConstructAI's Chief Civil Structural Engineer & Construction Estimator in India.\n"
                "Provide an accurate, spacious, and beautifully formatted construction cost estimate in Indian Rupees (₹) "
                "using Lakhs/Crores formatting based on Indian civil engineering standards.\n\n"
                "CRITICAL FORMATTING INSTRUCTIONS:\n"
                "- Write with GENEROUS line breaks and wide section spacing.\n"
                "- Never produce dense or congested walls of text.\n"
                "- Use clear numbered headings and concise, spacious bullet points.\n\n"
                "Reference House Context:\n"
                f"• Built-Up Footprint: {sqft:,} sq ft ({calc['bhk_label']}, {floors} Floors)\n"
                f"• Style: {style}, Region: {region}, Grade: {finish_grade}\n"
                f"• Estimated Total Budget: {summary['formatted_grand_total']} (Rate: ₹ {summary['rate_per_sqft_inr']:,}/sq ft)\n"
                f"• Materials Required: Cement: {materials['cement_bags']:,} bags (50kg), Steel: {materials['steel_tons']} Tons, "
                f"Bricks: {materials['bricks_count']:,} Units, Tiles: {materials['tiles_sqft']:,} sq ft.\n\n"
                "Format your response with clean spacing:\n"
                "1. 🏠 Project Overview & Total Estimated Budget\n\n"
                "2. 💰 Itemized Cost Breakdown (Materials, Labour & Buffer)\n\n"
                "3. 📦 Key Civil Engineering Materials Required\n\n"
                "4. 📌 Short Disclaimer regarding site soil inspection."
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
                "model_used": "Groq Llama 3 70B Versatile"
            }
        except Exception as e:
            # Fallback if Groq API error occurs
            pass

    # Fallback Deterministic Response
    ai_text = (
        f"🏠 **ConstructAI Turn-Key Construction Estimate**\n\n"
        f"Estimated total budget for a **{sqft:,} sq ft** project ({calc['bhk_label']}, {floors} Floors) in **{region}** is **{summary['formatted_grand_total']}** (approx. **₹ {summary['rate_per_sqft_inr']:,}/sq ft**).\n\n"
        f"**💰 Itemized Cost Breakdown:**\n"
        f"• **Building Materials (55%):** ₹ {summary['total_material_cost_inr']:,}\n"
        f"• **Skilled Labour & Masonry (30%):** ₹ {summary['total_labor_cost_inr']:,}\n"
        f"• **Approvals & Reserve Buffer (15%):** ₹ {summary['contingency_inr']:,}\n"
        f"• **Grand Total:** **{summary['formatted_grand_total']}**\n\n"
        f"**📦 Required Material Quantities:**\n"
        f"• Cement (50kg bags): **{materials['cement_bags']:,} Bags**\n"
        f"• TMT Steel Rebar: **{materials['steel_tons']} Tons**\n"
        f"• AAC Masonry Blocks: **{materials['bricks_count']:,} Pcs**\n"
        f"• Flooring Tiles: **{materials['tiles_sqft']:,} Sq Ft**\n\n"
        f"📌 *Note: Final quotation is subject to site soil inspection and approved architectural plan.*"
    )

    return {
        "text": ai_text,
        "calculation": calc,
        "model_used": "Civil Engine Fallback"
    }

