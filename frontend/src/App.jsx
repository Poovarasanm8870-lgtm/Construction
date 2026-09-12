import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HouseVisualizer } from './components/HouseVisualizer';
import { HouseControls } from './components/HouseControls';
import { CostBreakdownCard } from './components/CostBreakdownCard';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { ProjectCarousel } from './components/ProjectCarousel';
import { MaterialMarketplace } from './components/MaterialMarketplace';
import { EstimatorChat } from './components/EstimatorChat';
import { useEstimatorSocket } from './hooks/useEstimatorSocket';
import { staggerContainer, fadeInUp } from './utils/animations';

export default function App() {
  const [houseConfig, setHouseConfig] = useState({
    sqft: 2200,
    floors: 2,
    style: 'MODERN',
    roofType: 'FLAT',
    finishGrade: 'PREMIUM',
    region: 'Mumbai MMR / Maharashtra',
    wallColor: '#d97706',
  });

  const [calculation, setCalculation] = useState(null);
  const [isCalcLoading, setIsCalcLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('visualizer');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { messages, sendMessage, isConnected, isTyping } = useEstimatorSocket(houseConfig);

  const fetchCalculation = useCallback(async (configToUse) => {
    setIsCalcLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/pricing/calculate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sqft: configToUse.sqft,
          floors: configToUse.floors,
          style: configToUse.style,
          roof_type: configToUse.roofType,
          finish_grade: configToUse.finishGrade,
          region: configToUse.region,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data);
      } else {
        throw new Error('API server starting');
      }
    } catch (error) {
      // Local calculation fallback in Indian Rupees
      const sqft = configToUse.sqft;
      const floors = configToUse.floors;
      const rateInr = configToUse.finishGrade === 'LUXURY' ? 3850 : configToUse.finishGrade === 'PREMIUM' ? 2650 : 1750;
      const subtotal = sqft * rateInr;
      const contingency = subtotal * 0.10;
      const grandTotal = subtotal + contingency;
      const formattedTotal = grandTotal >= 10000000 ? `₹ ${(grandTotal/10000000).toFixed(2)} Cr` : `₹ ${(grandTotal/100000).toFixed(2)} Lakhs`;
      const bhkLabel = sqft < 1400 ? "2 BHK" : (sqft < 2800 ? "3 BHK" : "4 BHK Villa");

      setCalculation({
        sqft: sqft,
        floors: floors,
        bhk_label: bhkLabel,
        style: configToUse.style,
        roof_type: configToUse.roofType,
        finish_grade: configToUse.finishGrade,
        region: configToUse.region,
        summary: {
          rate_per_sqft_inr: rateInr,
          total_material_cost_inr: Math.round(subtotal * 0.60),
          total_labor_cost_inr: Math.round(subtotal * 0.40),
          subtotal_inr: Math.round(subtotal),
          contingency_inr: Math.round(contingency),
          grand_total_inr: Math.round(grandTotal),
          formatted_grand_total: formattedTotal,
        },
        material_quantities: {
          cement_bags: Math.round(sqft * 0.42),
          steel_tons: Math.round(sqft * 0.0036 * 100)/100,
          sand_cuft: Math.round(sqft * 1.25),
          aggregate_cuft: Math.round(sqft * 1.38),
          bricks_count: Math.round(sqft * 14.2),
          tiles_sqft: Math.round(sqft * 1.18),
        },
        floor_plan_rooms: [
          { name: "Grand Living & Dining Hall", area_sqft: Math.round(sqft * 0.28), dimensions: "24.5 ft x 18.2 ft", floor: "Ground Floor", type: "Living" },
          { name: "Master Bedroom Suite", area_sqft: Math.round(sqft * 0.22), dimensions: "18.0 ft x 15.0 ft", floor: "1st Floor", type: "Bedroom" },
          { name: "Modular Kitchen & Utility", area_sqft: Math.round(sqft * 0.12), dimensions: "14.0 ft x 11.5 ft", floor: "Ground Floor", type: "Kitchen" },
          { name: "Attached Bathrooms & Toilet", area_sqft: Math.round(sqft * 0.10), dimensions: "10.0 ft x 8.0 ft", floor: "All Floors", type: "Bathroom" },
          { name: "Covered Sit-out Terrace", area_sqft: Math.round(sqft * 0.08), dimensions: "16.0 ft x 8.0 ft", floor: "Upper Floor", type: "Balcony" },
        ],
        breakdown: [
          { category: "Foundation & Sub-Structure Work", cost_inr: Math.round(subtotal * 0.18), percentage: 18.0, details: "Excavation, PCC, RCC footing" },
          { category: "RCC Super-Structure (Columns & Slab)", cost_inr: Math.round(subtotal * 0.28), percentage: 28.0, details: "TMT steel & RMC concrete" },
          { category: "Brickwork, AAC Blocks & Plastering", cost_inr: Math.round(subtotal * 0.16), percentage: 16.0, details: "9-inch exterior & 4-inch interior walls" },
          { category: "Flooring, Wall Cladding & Tiles", cost_inr: Math.round(subtotal * 0.18), percentage: 18.0, details: "Vitrified tiles & granite kitchen counter" },
          { category: "Electrical Wiring & Plumbing Fixtures", cost_inr: Math.round(subtotal * 0.12), percentage: 12.0, details: "Concealed copper wiring & CPVC pipes" },
          { category: "Painting, Waterproofing & Finishing", cost_inr: Math.round(subtotal * 0.08), percentage: 8.0, details: "Asian Paints Royale & terrace waterproofing" },
        ],
      });
    } finally {
      setIsCalcLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalculation(houseConfig);

    fetch('http://127.0.0.1:8000/api/v1/projects/')
      .then((res) => (res.ok ? res.json() : Promise.reject('Fallback')))
      .then((data) => setTemplates(data))
      .catch(() => {
        setTemplates([
          {
            id: "blueprint-1",
            title: "Aura Glass Villa",
            subtitle: "3 BHK Ultra-Modern Residence",
            style: "MODERN",
            roof_type: "FLAT",
            sqft: 2800,
            floors: 2,
            finish_grade: "LUXURY",
            wall_color: "#d97706",
            estimated_price: "₹ 1.15 Cr",
            bedrooms: 3,
            bathrooms: 4,
            garage: "2 Cars",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            badge: "Popular",
            description: "Floor-to-ceiling glass panels, cantilevered master terrace, open modular kitchen hall."
          },
          {
            id: "blueprint-2",
            title: "Neo-Colonial Brick Estate",
            subtitle: "4 BHK Classical Brick Heritage",
            style: "COLONIAL",
            roof_type: "HIP",
            sqft: 3600,
            floors: 2,
            finish_grade: "PREMIUM",
            wall_color: "#b91c1c",
            estimated_price: "₹ 1.45 Cr",
            bedrooms: 4,
            bathrooms: 5,
            garage: "2 Cars",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            badge: "Heritage",
            description: "Exposed clay brick masonry, hipped roof design, double-height living foyer with teak millwork."
          },
          {
            id: "blueprint-3",
            title: "Monolith Eco Residence",
            subtitle: "2 BHK Minimalist Low-Carbon Home",
            style: "MINIMALIST",
            roof_type: "FLAT",
            sqft: 1600,
            floors: 2,
            finish_grade: "STANDARD",
            wall_color: "#64748b",
            estimated_price: "₹ 48.5 Lakhs",
            bedrooms: 2,
            bathrooms: 2.5,
            garage: "1 Car",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            badge: "Value Smart",
            description: "Board-formed architectural concrete, energy efficient thermal insulation, zero-maintenance exterior."
          }
        ]);
      });
  }, []);

  const handleConfigChange = (newConfig) => {
    setHouseConfig(newConfig);
    fetchCalculation(newConfig);
  };

  const handleSelectTemplate = (template) => {
    const updated = {
      ...houseConfig,
      sqft: template.sqft,
      floors: template.floors,
      style: template.style,
      roofType: template.roof_type,
      finishGrade: template.finish_grade,
      wallColor: template.wall_color,
    };
    setHouseConfig(updated);
    fetchCalculation(updated);
    setActiveTab('visualizer');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Navbar */}
      <Navbar
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
        
        {/* TAB 1: 3D Visualizer Studio & Dynamic Controls */}
        {activeTab === 'visualizer' && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left 3D Viewport (7 Cols) */}
              <div className="lg:col-span-7 w-full">
                <HouseVisualizer config={houseConfig} />
              </div>

              {/* Right Cost Breakdown (5 Cols) */}
              <div className="lg:col-span-5 w-full">
                <CostBreakdownCard calculation={calculation} isLoading={isCalcLoading} />
              </div>
            </div>

            {/* Architectural Controls */}
            <HouseControls config={houseConfig} onChange={handleConfigChange} />

            {/* Floor Plan Strip */}
            <FloorPlanViewer
              rooms={calculation?.floor_plan_rooms}
              sqft={houseConfig.sqft}
              floors={houseConfig.floors}
              bhkLabel={calculation?.bhk_label || "3 BHK"}
            />

            {/* Blueprints Carousel */}
            <ProjectCarousel templates={templates} onSelectTemplate={handleSelectTemplate} />
          </motion.div>
        )}

        {/* TAB 2: Floor Plan */}
        {activeTab === 'floorplan' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <FloorPlanViewer
              rooms={calculation?.floor_plan_rooms}
              sqft={houseConfig.sqft}
              floors={houseConfig.floors}
              bhkLabel={calculation?.bhk_label || "3 BHK"}
            />
          </motion.div>
        )}

        {/* TAB 3: Blueprints */}
        {activeTab === 'blueprints' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <ProjectCarousel templates={templates} onSelectTemplate={handleSelectTemplate} />
          </motion.div>
        )}

        {/* TAB 4: Market Rates */}
        {activeTab === 'marketplace' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <MaterialMarketplace />
          </motion.div>
        )}

      </main>

      {/* AI Estimator Floating Chatbot Drawer */}
      <EstimatorChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        isConnected={isConnected}
        isTyping={isTyping}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>ConstructAI Pro • Luxury 3D House Builder & Smart Cost Estimator</p>
      </footer>
    </div>
  );
}
