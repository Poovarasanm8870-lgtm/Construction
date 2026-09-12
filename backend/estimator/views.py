from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services.pricing_engine import calculate_construction_cost
from .services.ai_estimator import process_ai_chat_query

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def calculate_pricing(request):
    """
    POST/GET Endpoint: /api/v1/pricing/calculate/
    Returns real-time dynamic material & labor cost estimation in Indian Rupees (₹).
    """
    if request.method == 'POST':
        data = request.data
    else:
        data = request.query_params

    sqft = data.get('sqft', 2200)
    floors = data.get('floors', 2)
    style = data.get('style', 'MODERN')
    roof_type = data.get('roof_type', 'FLAT')
    finish_grade = data.get('finish_grade', 'PREMIUM')
    region = data.get('region', 'Mumbai MMR / Maharashtra')

    result = calculate_construction_cost(
        sqft=sqft,
        floors=floors,
        style=style,
        roof_type=roof_type,
        finish_grade=finish_grade,
        region=region
    )
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_materials_and_labor(request):
    """
    GET Endpoint: /api/v1/materials/
    Returns Indian construction material spot rates (in ₹) and skilled trade wage indices.
    """
    materials_feed = [
        {"id": 1, "name": "UltraTech 53 Grade OPC Cement", "category": "Cement", "price": 385.00, "unit": "50 kg bag", "trend": "+1.8%", "volatility": "Low", "brand": "UltraTech"},
        {"id": 2, "name": "Tata Tiscon 550D TMT Steel Rebar", "category": "Steel", "price": 64500.00, "unit": "ton", "trend": "-0.8%", "volatility": "Medium", "brand": "Tata Steel"},
        {"id": 3, "name": "M-Sand (Manufactured Sand)", "category": "Aggregates", "price": 55.00, "unit": "cu ft", "trend": "+2.1%", "volatility": "Low", "brand": "Regional Quarries"},
        {"id": 4, "name": "Red Clay Bricks (Class 1)", "category": "Masonry", "price": 9.50, "unit": "unit brick", "trend": "+3.0%", "volatility": "Low", "brand": "Kiln Bricks"},
        {"id": 5, "name": "Somany Vitrified Tiles (800x800mm)", "category": "Flooring", "price": 85.00, "unit": "sq ft", "trend": "0.0%", "volatility": "Low", "brand": "Somany"},
        {"id": 6, "name": "Asian Paints Royale Luxury Emulsion", "category": "Paints", "price": 540.00, "unit": "liter", "trend": "+1.2%", "volatility": "Low", "brand": "Asian Paints"},
    ]

    labor_feed = [
        {"id": 1, "trade": "Civil Site Engineer Supervision", "hourly_rate": 450.00, "sqft_rate": 120.00, "region": "Mumbai MMR"},
        {"id": 2, "trade": "Master Mason & RCC Specialist", "hourly_rate": 350.00, "sqft_rate": 95.00, "region": "Mumbai MMR"},
        {"id": 3, "trade": "Shuttering & Carpenter Specialist", "hourly_rate": 320.00, "sqft_rate": 80.00, "region": "Mumbai MMR"},
        {"id": 4, "trade": "Licensed Master Electrician", "hourly_rate": 380.00, "sqft_rate": 65.00, "region": "Mumbai MMR"},
        {"id": 5, "trade": "Plumbing & Sanitary Technician", "hourly_rate": 360.00, "sqft_rate": 60.00, "region": "Mumbai MMR"},
        {"id": 6, "trade": "Painter & Waterproofing Expert", "hourly_rate": 280.00, "sqft_rate": 35.00, "region": "Mumbai MMR"},
    ]

    return Response({
        "materials": materials_feed,
        "labor_rates": labor_feed,
        "market_status": "Indian Spot Rates Active (INR)",
        "last_synced": "2026-09-12T19:34:00Z"
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_blueprint_templates(request):
    """
    GET Endpoint: /api/v1/projects/
    Returns Indian architectural blueprint templates.
    """
    templates = [
        {
            "id": "blueprint-1",
            "title": "Aura Glass Villa",
            "subtitle": "3 BHK Ultra-Modern Residence",
            "style": "MODERN",
            "roof_type": "FLAT",
            "sqft": 2800,
            "floors": 2,
            "finish_grade": "LUXURY",
            "wall_color": "#38bdf8",
            "estimated_price": "₹ 1.15 Cr",
            "bedrooms": 3,
            "bathrooms": 4,
            "garage": "2 Cars",
            "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "badge": "Popular",
            "description": "Floor-to-ceiling glass panels, cantilevered master terrace, open modular kitchen hall."
        },
        {
            "id": "blueprint-2",
            "title": "Neo-Colonial Brick Estate",
            "subtitle": "4 BHK Classical Brick Heritage",
            "style": "COLONIAL",
            "roof_type": "HIP",
            "sqft": 3600,
            "floors": 2,
            "finish_grade": "PREMIUM",
            "wall_color": "#e11d48",
            "estimated_price": "₹ 1.45 Cr",
            "bedrooms": 4,
            "bathrooms": 5,
            "garage": "2 Cars",
            "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "badge": "Heritage",
            "description": "Exposed clay brick masonry, hipped roof design, double-height living foyer with teak millwork."
        },
        {
            "id": "blueprint-3",
            "title": "Monolith Eco Residence",
            "subtitle": "2 BHK Minimalist Low-Carbon Home",
            "style": "MINIMALIST",
            "roof_type": "FLAT",
            "sqft": 1600,
            "floors": 2,
            "finish_grade": "STANDARD",
            "wall_color": "#94a3b8",
            "estimated_price": "₹ 48.5 Lakhs",
            "bedrooms": 2,
            "bathrooms": 2.5,
            "garage": "1 Car",
            "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "badge": "Value Smart",
            "description": "Board-formed architectural concrete, energy efficient thermal insulation, zero-maintenance exterior."
        },
        {
            "id": "blueprint-4",
            "title": "Nordic Timber Lodge",
            "subtitle": "3 BHK Sustainable Wood Home",
            "style": "NORDIC",
            "roof_type": "GABLED",
            "sqft": 2400,
            "floors": 2,
            "finish_grade": "PREMIUM",
            "wall_color": "#d97706",
            "estimated_price": "₹ 82.0 Lakhs",
            "bedrooms": 3,
            "bathrooms": 3,
            "garage": "1 Car",
            "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "badge": "Sustainable",
            "description": "Cross-laminated timber framing, steep gabled pitch, rooftop solar panel integration."
        },
        {
            "id": "blueprint-5",
            "title": "Cyberia Smart Mansion",
            "subtitle": "5 BHK Automated Luxury Pavilion",
            "style": "FUTURISTIC",
            "roof_type": "SLANTED",
            "sqft": 5200,
            "floors": 3,
            "finish_grade": "LUXURY",
            "wall_color": "#a855f7",
            "estimated_price": "₹ 2.40 Cr",
            "bedrooms": 5,
            "bathrooms": 6,
            "garage": "3 Cars",
            "image": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
            "badge": "Flagship",
            "description": "Integrated solar roof tiles, electrochromic smart glass shading, home automation server."
        }
    ]
    return Response(templates, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat_fallback(request):
    """
    POST Endpoint: /api/v1/chat/
    HTTP API fallback for AI Estimator chatbot.
    """
    prompt = request.data.get('message', '')
    config = request.data.get('config', {})
    result = process_ai_chat_query(prompt, current_config=config)
    return Response({
        "sender": "bot",
        "message": result['text'],
        "calculation": result['calculation'],
        "parameters_used": result['parameters_used']
    }, status=status.HTTP_200_OK)
