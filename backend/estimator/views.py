import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from .models import Service, Project, FloorPlan, ChatbotSession, ChatMessage
from .services.pricing_engine import calculate_construction_cost
from .services.groq_service import query_groq_ai_estimator


@api_view(['GET'])
@permission_classes([AllowAny])
def get_services(request):
    """GET /api/v1/services/"""
    services_data = [
        {
            "id": 1,
            "title": "Turnkey Home Construction",
            "category": "TURNKEY",
            "tagline": "End-to-End Civil & Structural Build",
            "description": "Complete architectural build from excavation to occupancy. Includes soil testing, RCC framing, brickwork, waterproofing, premium finishes, and government approvals.",
            "starting_price_inr": 1750.00,
            "unit": "per sq ft",
            "icon": "Building2",
            "features": [
                "Structure & Finish Warranty",
                "Tata Tiscon Steel & UltraTech Cement",
                "Dedicated Site Engineer Supervision",
                "Bi-weekly Drone & Photo Progress Reports"
            ]
        },
        {
            "id": 2,
            "title": "Architectural Planning & 3D Design",
            "category": "PLANNING",
            "tagline": "Vastu Compliant Blueprints & 3D Renders",
            "description": "Comprehensive architectural layout blueprints, 3D exterior elevations, structural load calculations, and municipal sanction drawings.",
            "starting_price_inr": 45.00,
            "unit": "per sq ft",
            "icon": "Compass",
            "features": [
                "100% Vastu Shastra Compliant Plans",
                "High-Resolution 3D Walkthrough Renders",
                "Structural Load Calculation Certificates",
                "Municipal Approvals Assistance"
            ]
        },
        {
            "id": 3,
            "title": "Structural Engineering & Detailing",
            "category": "STRUCTURAL",
            "tagline": "Earthquake Resistant RCC Design",
            "description": "Earthquake-resistant structural engineering, RCC column & beam detailing, foundation design, and steel rebar bar bending schedules.",
            "starting_price_inr": 25.00,
            "unit": "per sq ft",
            "icon": "ShieldCheck",
            "features": [
                "IS 1893 Seismic Resistant Analysis",
                "Optimized Steel Quantity Reduction",
                "Soil Foundation Load Optimization",
                "Certified Structural Engineer Audit"
            ]
        },
        {
            "id": 4,
            "title": "Interior Architecture & Finishing",
            "category": "INTERIOR",
            "tagline": "Luxury Modular Kitchens & Woodwork",
            "description": "Custom interior design including modular kitchens, Italian marble flooring, false ceiling lighting, wardrobe woodwork, and smart home automation.",
            "starting_price_inr": 850.00,
            "unit": "per sq ft",
            "icon": "Palette",
            "features": [
                "Factory Finished Hettich/Hafele Hardware",
                "Italian Marble & Vitrified Tile Fitting",
                "Concealed Ambient LED False Ceilings",
                "5-Year Workmanship Guarantee"
            ]
        },
        {
            "id": 5,
            "title": "Full Home Renovation & Remodeling",
            "category": "RENOVATION",
            "tagline": "Structural Modifications & Facade Upgrades",
            "description": "Transform old independent houses and villas with structural reinforcement, exterior elevation upgrades, bathroom remodeling, and terrace waterproofing.",
            "starting_price_inr": 650.00,
            "unit": "per sq ft",
            "icon": "RefreshCw",
            "features": [
                "Structural retrofitting & wall removal",
                "Modern Glass Facade Upgrades",
                "Complete Plumbing & Electrical Rewiring",
                "Terrace Polymer Waterproofing"
            ]
        }
    ]
    return Response(services_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_projects(request):
    """GET /api/v1/projects/"""
    projects_data = [
        {
            "id": 1,
            "title": "Aura Horizon Glass Villa",
            "category": "Turnkey Construction",
            "location": "Juhu, Mumbai",
            "sqft": 3400,
            "duration_months": 9,
            "completed_year": 2026,
            "estimated_cost_inr": "₹ 1.25 Cr",
            "before_image": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
            "after_image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "description": "Floor-to-ceiling thermal glass curtain walls, cantilever terrace patio, and automated climate control.",
            "metrics": {"grade": "Ultra Luxury", "carpentry": "Teak Wood", "elevation": "Modern Glass"}
        },
        {
            "id": 2,
            "title": "Neo-Colonial Brick Estate",
            "category": "Heritage Build",
            "location": "Gurgaon, Delhi NCR",
            "sqft": 4200,
            "duration_months": 11,
            "completed_year": 2026,
            "estimated_cost_inr": "₹ 1.65 Cr",
            "before_image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            "after_image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "description": "Exposed Wire-Cut Clay Brickwork, classical slate hipped roof, double-height living foyer.",
            "metrics": {"grade": "Architectural Premium", "structure": "Earthquake Zone IV", "roof": "Hipped Slate"}
        },
        {
            "id": 3,
            "title": "Monolith Eco-Cube Residence",
            "category": "Minimalist Build",
            "location": "Indiranagar, Bengaluru",
            "sqft": 1800,
            "duration_months": 6,
            "completed_year": 2025,
            "estimated_cost_inr": "₹ 52.0 Lakhs",
            "before_image": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
            "after_image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "description": "Board-formed architectural concrete, passive solar ventilation, low carbon footprint materials.",
            "metrics": {"grade": "Standard Plus", "concrete": "OPC 53 Grade", "energy": "Solar Rooftop"}
        }
    ]
    return Response(projects_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_floorplans(request):
    """GET /api/v1/floorplans/"""
    plans = [
        {
            "id": 1,
            "title": "The Imperial 3BHK Villa Layout",
            "bhk_type": "3 BHK",
            "sqft": 2400,
            "floors": 2,
            "blueprint_2d": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
            "render_3d": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
            "room_hotspots": [
                {
                    "room_name": "Grand Living & Dining Foyer",
                    "area_sqft": 580,
                    "dimensions": "26.5 ft x 21.8 ft",
                    "finishes": "Italian Bottochino Marble, False Ceiling Cove Lighting, Double Glazed Windows",
                    "x_percent": 30,
                    "y_percent": 45
                },
                {
                    "room_name": "Master Bedroom Suite",
                    "area_sqft": 420,
                    "dimensions": "21.0 ft x 20.0 ft",
                    "finishes": "Laminated Wooden Flooring, Walk-in Closet, En-suite Jacuzzi Bathroom",
                    "x_percent": 70,
                    "y_percent": 35
                },
                {
                    "room_name": "Modular Island Kitchen",
                    "area_sqft": 240,
                    "dimensions": "16.0 ft x 15.0 ft",
                    "finishes": "Quartz Countertop, Hafele Soft-Close Drawers, Built-in Chimney & Hob",
                    "x_percent": 45,
                    "y_percent": 75
                }
            ]
        },
        {
            "id": 2,
            "title": "Compact 2BHK Urban Smart Layout",
            "bhk_type": "2 BHK",
            "sqft": 1400,
            "floors": 1,
            "blueprint_2d": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
            "render_3d": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
            "room_hotspots": [
                {
                    "room_name": "Open Concept Living Hall",
                    "area_sqft": 380,
                    "dimensions": "20.0 ft x 19.0 ft",
                    "finishes": "Somany Vitrified Tiles (800x800mm), Asian Paints Royale Finish",
                    "x_percent": 35,
                    "y_percent": 40
                },
                {
                    "room_name": "Primary Bedroom",
                    "area_sqft": 260,
                    "dimensions": "16.0 ft x 16.2 ft",
                    "finishes": "Vitrified Tile Flooring, Attached Bathroom, UPVC Sliding Windows",
                    "x_percent": 65,
                    "y_percent": 60
                }
            ]
        }
    ]
    return Response(plans, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def groq_ai_chat(request):
    """
    POST /api/v1/chat/
    Connects to Groq API (llama-3.3-70b-versatile) and logs conversation to ChatbotSession & ChatMessage models.
    """
    user_message = request.data.get('message', '')
    config = request.data.get('config', {})
    session_id = request.data.get('session_id', str(uuid.uuid4())[:8])
    request_visit = request.data.get('request_visit', False)

    if not user_message:
        return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Get or Create ChatbotSession in Django DB
    session, created = ChatbotSession.objects.get_or_create(
        session_id=session_id,
        defaults={
            'inquired_sqft': config.get('sqft', 2200),
            'city_region': config.get('region', 'Mumbai MMR / Maharashtra'),
            'requested_site_visit': request_visit
        }
    )

    if request_visit:
        session.requested_site_visit = True
        session.save()

    # Log User Message
    ChatMessage.objects.create(
        session=session,
        sender='user',
        message=user_message
    )

    # Query Groq AI Service
    ai_response = query_groq_ai_estimator(user_message, current_config=config)

    # Update session metrics
    if ai_response.get('calculation'):
        session.inquired_budget_inr = ai_response['calculation']['summary']['grand_total_inr']
        session.inquired_sqft = ai_response['calculation']['sqft']
        session.save()

    # Log Bot Message
    ChatMessage.objects.create(
        session=session,
        sender='bot',
        message=ai_response['text'],
        calculation_snapshot=ai_response.get('calculation')
    )

    return Response({
        "session_id": session.session_id,
        "sender": "bot",
        "message": ai_response['text'],
        "calculation": ai_response.get('calculation'),
        "model_used": ai_response.get('model_used', 'Groq Llama 3 70B')
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_admin_analytics(request):
    """
    GET /api/v1/analytics/
    Returns analytical KPIs and Chart.js datasets for the React Admin Portal.
    """
    total_sessions = ChatbotSession.objects.count() or 142
    total_queries = ChatMessage.objects.count() or 486
    site_visit_leads = ChatbotSession.objects.filter(requested_site_visit=True).count() or 38
    avg_budget = 8540000.00

    # Line Chart: Interactions Over Last 7 Days
    line_chart_data = {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "datasets": [
            {
                "label": "AI Chatbot Inquiries",
                "data": [42, 58, 65, 84, 92, 115, 142],
                "borderColor": "#d97706",
                "backgroundColor": "rgba(217, 119, 6, 0.15)",
                "fill": True,
                "tension": 0.4
            }
        ]
    }

    # Bar Chart: Requested Sq Ft Distribution
    bar_chart_data = {
        "labels": ["< 1200 sq ft", "1200-2000 sq ft", "2000-3500 sq ft", "3500-5000 sq ft", "5000+ sq ft"],
        "datasets": [
            {
                "label": "Projects Inquired",
                "data": [18, 45, 62, 28, 12],
                "backgroundColor": ["#3b82f6", "#10b981", "#d97706", "#8b5cf6", "#f43f5e"]
            }
        ]
    }

    # Doughnut Chart: Conversion Metrics
    doughnut_chart_data = {
        "labels": ["Browsing Inquiries", "Booked Site Visits", "Converted Projects"],
        "datasets": [
            {
                "data": [104, 38, 16],
                "backgroundColor": ["#94a3b8", "#d97706", "#10b981"]
            }
        ]
    }

    return Response({
        "kpis": {
            "total_queries_today": 48,
            "total_sessions": total_sessions,
            "active_leads": site_visit_leads,
            "avg_estimate_inr": "₹ 85.4 Lakhs",
            "conversion_rate": "26.7%"
        },
        "line_chart": line_chart_data,
        "bar_chart": bar_chart_data,
        "doughnut_chart": doughnut_chart_data
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def calculate_pricing(request):
    """POST/GET /api/v1/pricing/calculate/"""
    data = request.data if request.method == 'POST' else request.query_params
    result = calculate_construction_cost(
        sqft=data.get('sqft', 2200),
        floors=data.get('floors', 2),
        style=data.get('style', 'MODERN'),
        roof_type=data.get('roof_type', 'FLAT'),
        finish_grade=data.get('finish_grade', 'PREMIUM'),
        region=data.get('region', 'Mumbai MMR / Maharashtra')
    )
    return Response(result, status=status.HTTP_200_OK)
