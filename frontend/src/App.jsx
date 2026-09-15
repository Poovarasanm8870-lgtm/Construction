import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesCatalog } from './components/ServicesCatalog';
import { ProjectSlider } from './components/ProjectSlider';
import PortfolioSwiper from './components/PortfolioSwiper';
import RoomLayoutModal from './components/RoomLayoutModal';
import GroqChatEstimator from './components/GroqChatEstimator';
import { HouseVisualizer } from './components/HouseVisualizer';
import { HouseControls } from './components/HouseControls';
import { CostBreakdownCard } from './components/CostBreakdownCard';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { MaterialMarketplace } from './components/MaterialMarketplace';
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
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [floorplans, setFloorplans] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedModalProject, setSelectedModalProject] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const handleOpenRoomLayout = (project) => {
    setSelectedModalProject(project);
    setIsRoomModalOpen(true);
  };


  // Fetch Pricing Calculation
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
        throw new Error('API server fallback');
      }
    } catch (error) {
      // Local calculation engine fallback
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

  // Initial Data Load
  useEffect(() => {
    fetchCalculation(houseConfig);

    // Services API
    fetch('http://127.0.0.1:8000/api/v1/services/')
      .then((res) => (res.ok ? res.json() : Promise.reject('Fallback')))
      .then((data) => setServices(data))
      .catch(() => {
        setServices([
          { id: 1, title: "Turnkey Home Construction", category: "TURNKEY", tagline: "End-to-End Build", description: "Complete architectural build from soil excavation to occupancy.", starting_price_inr: 1750.00, icon: "Building2", features: ["10-Year Warranty", "Tata Steel & UltraTech Cement", "Engineer Supervision"] },
          { id: 2, title: "Architectural Planning & 3D Design", category: "PLANNING", tagline: "Vastu Compliant Blueprints", description: "Architectural layout blueprints, 3D exterior elevations, structural load calculations.", starting_price_inr: 45.00, icon: "Compass", features: ["100% Vastu Shastra Plans", "High-Res 3D Renders", "Sanction Approvals"] },
          { id: 3, title: "Structural Engineering & Detailing", category: "STRUCTURAL", tagline: "Earthquake Resistant Design", description: "Earthquake-resistant structural engineering, RCC column & beam detailing.", starting_price_inr: 25.00, icon: "ShieldCheck", features: ["IS 1893 Seismic Analysis", "Steel Quantity Optimization", "Certified Engineer Audit"] }
        ]);
      });

    // Projects API
    fetch('http://127.0.0.1:8000/api/v1/projects/')
      .then((res) => (res.ok ? res.json() : Promise.reject('Fallback')))
      .then((data) => setProjects(data))
      .catch(() => {
        setProjects([
          { id: 1, title: "Aura Horizon Glass Villa", category: "Turnkey Construction", location: "Juhu, Mumbai", sqft: 3400, duration_months: 9, estimated_cost_inr: "₹ 1.25 Cr", before_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80", after_image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", description: "Floor-to-ceiling glass curtain walls and cantilever terrace patio." },
          { id: 2, title: "Neo-Colonial Brick Estate", category: "Heritage Build", location: "Gurgaon, Delhi NCR", sqft: 4200, duration_months: 11, estimated_cost_inr: "₹ 1.65 Cr", before_image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", after_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", description: "Exposed Wire-Cut Clay Brickwork, classical slate hipped roof." }
        ]);
      });
  }, []);

  const handleConfigChange = (newConfig) => {
    setHouseConfig(newConfig);
    fetchCalculation(newConfig);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-12">
        
        {/* OVERVIEW PAGE (HERO + SERVICES + PORTFOLIO SWIPER + GROQ CHAT) */}
        {activeTab === 'overview' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-12">
            <HeroSection
              onCalculateClick={() => setActiveTab('visualizer')}
              onViewProjectsClick={() => setActiveTab('projects')}
            />
            <ServicesCatalog services={services} onSelectService={() => setIsChatOpen(true)} />
            <PortfolioSwiper onSelectProjectForLayout={handleOpenRoomLayout} />
            <div className="py-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
                  Interactive AI Assistant
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Groq AI Construction Estimator</h2>
                <p className="text-slate-600 text-sm mt-1">Get itemized material quantities & civil estimates instantly</p>
              </div>
              <GroqChatEstimator initialSqft={1500} onBookingTrigger={() => setIsChatOpen(true)} />
            </div>
          </motion.div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <ServicesCatalog services={services} onSelectService={() => setIsChatOpen(true)} />
          </motion.div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <PortfolioSwiper onSelectProjectForLayout={handleOpenRoomLayout} />
          </motion.div>
        )}


        {/* 3D STUDIO TAB */}
        {activeTab === 'visualizer' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 w-full">
                <HouseVisualizer config={houseConfig} />
              </div>
              <div className="lg:col-span-5 w-full">
                <CostBreakdownCard calculation={calculation} isLoading={isCalcLoading} />
              </div>
            </div>
            <HouseControls config={houseConfig} onChange={handleConfigChange} />
            <FloorPlanViewer
              rooms={calculation?.floor_plan_rooms}
              sqft={houseConfig.sqft}
              floors={houseConfig.floors}
              bhkLabel={calculation?.bhk_label || "3 BHK"}
            />
          </motion.div>
        )}

        {/* FLOOR PLAN TAB */}
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

        {/* ADMIN PORTAL TAB */}
        {activeTab === 'analytics' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <AdminDashboard />
          </motion.div>
        )}

        {/* MARKETPLACE TAB */}
        {activeTab === 'marketplace' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <MaterialMarketplace />
          </motion.div>
        )}

      </main>

      {/* Groq AI Chatbot Floating Drawer */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentConfig={houseConfig}
      />

      {/* Room Layout Inspector Modal */}
      <RoomLayoutModal
        project={selectedModalProject}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />

      {/* Footer */}

      <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>ConstructAI Pro • Modern Construction Services & Groq AI Architecture Platform</p>
      </footer>
    </div>
  );
}
