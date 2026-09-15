import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Layers, 
  Ruler, 
  Box, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Maximize2,
  Building,
  DollarSign
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

export default function HouseBlueprints({ onInquireBlueprint }) {
  const blueprints = [
    {
      id: 'villa1500',
      title: "Modern 1,500 Sq Ft Villa",
      tagline: "G+1 Contemporary 3 BHK Layout",
      sqft: 1500,
      bhk: "3 BHK Villa",
      floors: "G + 1 Floor",
      estimatedCost: "₹ 48.5 Lakhs",
      ratePerSqft: "₹ 1,850/sq ft",
      blueprint2D: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      render3D: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      rooms: [
        { name: "Grand Living & Foyer", sqft: 450, dimensions: "24.5 ft x 18.2 ft", level: "Ground Floor", finish: "Italian Marble, False Ceiling Cove Lighting" },
        { name: "Master Suite & Closet", sqft: 340, dimensions: "18.0 ft x 18.8 ft", level: "First Floor", finish: "Laminated Wooden Flooring, En-suite Bath" },
        { name: "Modular Island Kitchen", sqft: 220, dimensions: "15.0 ft x 14.6 ft", level: "Ground Floor", finish: "Quartz Countertop, Hafele Fittings" },
        { name: "Bedrooms 2 & 3", sqft: 320, dimensions: "16.0 ft x 10.0 ft", level: "First Floor", finish: "Vitrified Tiles (800x800mm)" },
        { name: "Utility & Sit-out Terrace", sqft: 170, dimensions: "17.0 ft x 10.0 ft", level: "Terrace Floor", finish: "Anti-Skid Decking Tiles" }
      ],
      materials: {
        cement: "600 Bags (UltraTech 53 Grade)",
        steel: "5.25 Tons (Tata Tiscon Fe-550D)",
        bricks: "27,000 Units (AAC Eco-Blocks)",
        tiles: "2,250 Sq Ft (Somany Vitrified)"
      }
    },
    {
      id: 'compact1200',
      title: "Compact Smart Family Home",
      tagline: "Single Story 2 BHK Efficient Footprint",
      sqft: 1200,
      bhk: "2 BHK Smart",
      floors: "Ground Floor",
      estimatedCost: "₹ 34.2 Lakhs",
      ratePerSqft: "₹ 1,780/sq ft",
      blueprint2D: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      render3D: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      rooms: [
        { name: "Open Living & Dining", sqft: 380, dimensions: "20.0 ft x 19.0 ft", level: "Ground Floor", finish: "Vitrified Tile Flooring" },
        { name: "Primary Master Bedroom", sqft: 280, dimensions: "16.0 ft x 17.5 ft", level: "Ground Floor", finish: "Concealed Wiring & UPVC Sliding Windows" },
        { name: "Modern L-Shaped Kitchen", sqft: 180, dimensions: "14.0 ft x 12.8 ft", level: "Ground Floor", finish: "Granite Slab Counter" },
        { name: "Guest Bedroom", sqft: 220, dimensions: "14.0 ft x 15.7 ft", level: "Ground Floor", finish: "Royale Emulsion Painting" }
      ],
      materials: {
        cement: "480 Bags (ACC Concrete+)",
        steel: "4.10 Tons (JSW Neosteel)",
        bricks: "21,500 Units (Red Clay Bricks)",
        tiles: "1,750 Sq Ft (Kajaria Vitrified)"
      }
    },
    {
      id: 'luxury3200',
      title: "Luxury Triplex Mansion",
      tagline: "G+2 Double Height Foyer & Penthouse",
      sqft: 3200,
      bhk: "4 BHK Mansion",
      floors: "G + 2 Floors",
      estimatedCost: "₹ 1.25 Cr",
      ratePerSqft: "₹ 3,900/sq ft",
      blueprint2D: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      render3D: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      rooms: [
        { name: "Double-Height Grand Foyer", sqft: 850, dimensions: "34.0 ft x 25.0 ft", level: "Ground Floor", finish: "Italian Bottochino Marble" },
        { name: "Penthouse Sky Lounge", sqft: 650, dimensions: "28.0 ft x 23.2 ft", level: "Second Floor", finish: "Thermal Glass Wall Elevation" },
        { name: "Presidential Master Suite", sqft: 520, dimensions: "26.0 ft x 20.0 ft", level: "First Floor", finish: "Walk-in Closet & Jacuzzi" }
      ],
      materials: {
        cement: "1,350 Bags (UltraTech RMC)",
        steel: "11.8 Tons (Tata Tiscon)",
        bricks: "54,000 Units (AAC Blocks)",
        tiles: "4,800 Sq Ft (Imported Marble)"
      }
    }
  ];

  const [activeBlueprintId, setActiveBlueprintId] = useState('villa1500');
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'

  const activePlan = blueprints.find(b => b.id === activeBlueprintId) || blueprints[0];

  return (
    <div className="w-full bg-slate-50 py-16 px-4 sm:px-6 lg:px-12 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Architectural Blueprint Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curated House Blueprints & Room Layouts
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-xl">
              Inspect precise 2D architectural blueprints, room footprints, and itemized material quantities.
            </p>
          </div>

          {/* Blueprint Style Selector Pills */}
          <div className="flex flex-wrap gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
            {blueprints.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActiveBlueprintId(plan.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeBlueprintId === plan.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {plan.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Blueprint Inspector Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Visual Blueprint Image View (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 relative min-h-[380px] sm:min-h-[460px] flex flex-col justify-between p-6">
            <img
              src={viewMode === '2D' ? activePlan.blueprint2D : activePlan.render3D}
              alt={activePlan.title}
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Top Toolbar overlay */}
            <div className="relative z-10 flex justify-between items-center">
              <span className="px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-md">
                {activePlan.bhk} • {activePlan.floors}
              </span>

              {/* 2D / 3D Toggle */}
              <div className="flex items-center p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20">
                <button
                  onClick={() => setViewMode('2D')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    viewMode === '2D' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-white hover:text-amber-300'
                  }`}
                >
                  2D Blueprint
                </button>
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === '3D' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-white hover:text-amber-300'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  3D Render
                </button>
              </div>
            </div>

            {/* Bottom Overlay Summary */}
            <div className="relative z-10 p-5 rounded-2xl bg-slate-900/85 backdrop-blur-md text-white border border-white/10 flex justify-between items-center shadow-xl">
              <div>
                <div className="text-xs text-slate-300 font-medium">{activePlan.title}</div>
                <div className="text-xl font-extrabold text-amber-400">{activePlan.sqft.toLocaleString()} sq ft</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-300 font-medium">Estimated Budget</div>
                <div className="text-lg font-bold text-white">{activePlan.estimatedCost}</div>
              </div>
            </div>
          </div>

          {/* Room Specs & Material Quantity Details (5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Itemized Room Footprints
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {activePlan.title}
                </h3>
              </div>

              {/* Rooms List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activePlan.rooms.map((room, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{room.name}</div>
                      <div className="text-slate-500">{room.dimensions} • {room.level}</div>
                    </div>
                    <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {room.sqft} sq ft
                    </span>
                  </div>
                ))}
              </div>

              {/* Structural Material Quantities */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Key Civil Engineering Quantities</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div>• Cement: <span className="font-bold text-white">{activePlan.materials.cement}</span></div>
                  <div>• Steel Rebar: <span className="font-bold text-white">{activePlan.materials.steel}</span></div>
                  <div>• Masonry: <span className="font-bold text-white">{activePlan.materials.bricks}</span></div>
                  <div>• Flooring: <span className="font-bold text-white">{activePlan.materials.tiles}</span></div>
                </div>
              </div>

              {/* Code Compliance Note */}
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Vastu Shastra & NBC Code Structural Approval Guaranteed</span>
              </div>
            </div>

            {/* Action CTA */}
            <motion.button
              whileTap={bouncyTap}
              onClick={() => onInquireBlueprint && onInquireBlueprint(activePlan)}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Get Detailed Quotation for this Blueprint</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
