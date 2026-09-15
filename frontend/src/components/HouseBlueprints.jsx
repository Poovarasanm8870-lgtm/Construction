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
  Eye,
  X,
  FileText,
  Home
} from 'lucide-react';
import { bouncyTap, springTransition, modalBackdropVariant, modalSlideUpVariant } from '../animations/iosSprings';

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
      referenceImages: [
        { label: "Exterior Elevation", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" },
        { label: "Living Foyer Interior", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" },
        { label: "Master Suite", url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80" },
        { label: "Modular Kitchen", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" }
      ],
      blueprintTopView2D: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
      rooms: [
        { name: "Bedroom 1 (Master)", dimensions: '10\'0" x 12\'0"', sqft: 120, level: "Ground Floor" },
        { name: "Bedroom 2 (Guest)", dimensions: '10\'0" x 12\'0"', sqft: 120, level: "Ground Floor" },
        { name: "Bedroom 3 (Upper Suite)", dimensions: '11\'4" x 10\'0"', sqft: 115, level: "First Floor" },
        { name: "Dining & Living Foyer", dimensions: '11\'0" x 16\'0"', sqft: 176, level: "Ground Floor" },
        { name: "Modular Kitchen", dimensions: '8\'4" x 11\'0"', sqft: 92, level: "Ground Floor" },
        { name: "En-suite Bath & Toilet", dimensions: '4\'0" x 7\'0"', sqft: 28, level: "Ground Floor" },
        { name: "Staircase & Lift Shaft", dimensions: '5\'3" x 5\'0"', sqft: 26, level: "All Floors" }
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
      referenceImages: [
        { label: "Exterior Facade", url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80" },
        { label: "Open Living Area", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" },
        { label: "Compact Bedroom", url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80" }
      ],
      blueprintTopView2D: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
      rooms: [
        { name: "Living & Dining Hall", dimensions: '12\'0" x 15\'0"', sqft: 180, level: "Ground Floor" },
        { name: "Master Bedroom", dimensions: '11\'0" x 12\'0"', sqft: 132, level: "Ground Floor" },
        { name: "Bedroom 2", dimensions: '10\'0" x 11\'0"', sqft: 110, level: "Ground Floor" },
        { name: "Kitchen & Utility", dimensions: '8\'0" x 10\'0"', sqft: 80, level: "Ground Floor" }
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
      tagline: "G+2 Double Height Foyer & Sky Lounge",
      sqft: 3200,
      bhk: "4 BHK Mansion",
      floors: "G + 2 Floors",
      estimatedCost: "₹ 1.25 Cr",
      ratePerSqft: "₹ 3,900/sq ft",
      referenceImages: [
        { label: "Mansion Elevation", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80" },
        { label: "Double Height Foyer", url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80" },
        { label: "Penthouse Lounge", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" }
      ],
      blueprintTopView2D: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
      rooms: [
        { name: "Double-Height Grand Foyer", dimensions: '20\'0" x 25\'0"', sqft: 500, level: "Ground Floor" },
        { name: "Presidential Suite", dimensions: '16\'0" x 20\'0"', sqft: 320, level: "First Floor" },
        { name: "Sky Lounge & Terrace", dimensions: '18\'0" x 22\'0"', sqft: 396, level: "Second Floor" }
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
  const [selectedReferenceImage, setSelectedReferenceImage] = useState(0);
  const [isTopViewModalOpen, setIsTopViewModalOpen] = useState(false);

  const activePlan = blueprints.find(b => b.id === activeBlueprintId) || blueprints[0];

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-12 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>House Blueprints & Reference Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Architectural House Blueprints & Details
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-xl">
              Inspect reference exterior & interior images, house details, and open the 2D top-view blueprint layout.
            </p>
          </div>

          {/* Blueprint Style Selector Pills */}
          <div className="flex flex-wrap gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
            {blueprints.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setActiveBlueprintId(plan.id);
                  setSelectedReferenceImage(0);
                }}
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

        {/* Main Content: House Details + Reference Image Gallery */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Reference Image Gallery Column (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 p-6 flex flex-col justify-between space-y-4">
            {/* Main Featured Reference Photo */}
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10 group">
              <img
                src={activePlan.referenceImages[selectedReferenceImage]?.url || activePlan.referenceImages[0].url}
                alt={activePlan.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                📷 Reference View: {activePlan.referenceImages[selectedReferenceImage]?.label}
              </div>

              {/* View Top View Blueprint Trigger Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="text-white">
                  <div className="text-xs text-slate-300 font-medium">{activePlan.title}</div>
                  <div className="text-lg font-bold text-amber-400">{activePlan.sqft} sq ft • {activePlan.bhk}</div>
                </div>

                <motion.button
                  whileTap={bouncyTap}
                  onClick={() => setIsTopViewModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 border border-amber-400"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Top-View Blueprint</span>
                </motion.button>
              </div>
            </div>

            {/* Thumbnail Selector Bar */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {activePlan.referenceImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedReferenceImage(idx)}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedReferenceImage === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/30" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate text-center">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* House Details & Room Specs Column (5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Civil Specifications
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {activePlan.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{activePlan.tagline}</p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-slate-900">{activePlan.estimatedCost}</div>
                  <div className="text-xs text-amber-800 font-bold">{activePlan.ratePerSqft}</div>
                </div>
              </div>

              {/* Room Footprints List */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-600" />
                  <span>Itemized Room Dimensions</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activePlan.rooms.map((room, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{room.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{room.dimensions} • {room.level}</div>
                      </div>
                      <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border text-[11px]">
                        {room.sqft} sq ft
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Quantities */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Required Material Quantities</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>• Cement: <span className="font-bold text-white">{activePlan.materials.cement}</span></div>
                  <div>• Steel: <span className="font-bold text-white">{activePlan.materials.steel}</span></div>
                  <div>• Masonry: <span className="font-bold text-white">{activePlan.materials.bricks}</span></div>
                  <div>• Tiles: <span className="font-bold text-white">{activePlan.materials.tiles}</span></div>
                </div>
              </div>

              {/* Code Compliance */}
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Vastu Shastra & NBC Structural Code Compliant</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <motion.button
                whileTap={bouncyTap}
                onClick={() => setIsTopViewModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 border border-amber-400"
              >
                <Eye className="w-4 h-4" />
                <span>View Top-View Blueprint Layout</span>
              </motion.button>

              <motion.button
                whileTap={bouncyTap}
                onClick={() => onInquireBlueprint && onInquireBlueprint(activePlan)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Get Itemized Quotation for this House</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP-VIEW BLUEPRINT ARCHITECTURAL MODAL */}
      <AnimatePresence>
        {isTopViewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              variants={modalBackdropVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsTopViewModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Content Window */}
            <motion.div
              variants={modalSlideUpVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-10 my-auto p-6 sm:p-8 max-h-[92vh] flex flex-col justify-between"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {activePlan.title} — 2D Top-View Architectural Blueprint
                    </h3>
                    <p className="text-xs text-slate-500">
                      Official CAD Top-View Plan with Room Dimensions & Wall Boundaries
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTopViewModalOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Top View CAD Blueprint Rendering Area */}
              <div className="my-4 overflow-y-auto max-h-[60vh] rounded-2xl bg-slate-100 border border-slate-300 p-4 relative flex flex-col items-center">
                
                {/* Visual Architectural Top-View SVG CAD Diagram matching User Upload */}
                <div className="w-full max-w-3xl bg-white border-2 border-slate-900 p-6 rounded-lg shadow-inner font-mono text-slate-900 relative">
                  
                  {/* Compass Arrow */}
                  <div className="absolute top-4 right-4 flex flex-col items-center text-xs font-bold text-slate-700">
                    <span>N</span>
                    <span className="text-xl">↑</span>
                  </div>

                  <div className="text-center font-bold text-sm border-b-2 border-slate-900 pb-2 mb-4 uppercase tracking-wider">
                    {activePlan.title} — Top-View Floor Blueprint ({activePlan.sqft} SQ FT)
                  </div>

                  {/* CAD Top View Room Layout Grid */}
                  <div className="grid grid-cols-12 gap-3 border-2 border-slate-900 p-4 bg-slate-50">
                    
                    {/* Top Row: Bedroom 1 & Bedroom 2 */}
                    <div className="col-span-6 border-2 border-slate-800 p-4 bg-amber-50/40 rounded text-center space-y-1">
                      <div className="font-bold text-xs uppercase">Bedroom 1</div>
                      <div className="text-sm font-extrabold text-amber-800">10'0" x 12'0"</div>
                      <div className="text-[10px] text-slate-500">120 Sq Ft • Attached Toilet</div>
                    </div>

                    <div className="col-span-6 border-2 border-slate-800 p-4 bg-amber-50/40 rounded text-center space-y-1">
                      <div className="font-bold text-xs uppercase">Bedroom 2</div>
                      <div className="text-sm font-extrabold text-amber-800">10'0" x 12'0"</div>
                      <div className="text-[10px] text-slate-500">120 Sq Ft • UPVC Window</div>
                    </div>

                    {/* Middle Row: Kitchen, Dining, Staircase */}
                    <div className="col-span-4 border-2 border-slate-800 p-4 bg-blue-50/40 rounded text-center space-y-1">
                      <div className="font-bold text-xs uppercase">Modular Kitchen</div>
                      <div className="text-sm font-extrabold text-blue-900">8'4" x 11'0"</div>
                      <div className="text-[10px] text-slate-500">Quartz Counter & Hob</div>
                    </div>

                    <div className="col-span-4 border-2 border-slate-800 p-6 bg-emerald-50/40 rounded text-center space-y-1 flex flex-col items-center justify-center">
                      <div className="font-bold text-xs uppercase">Dining & Living Foyer</div>
                      <div className="text-base font-extrabold text-emerald-900">11'0" x 16'0"</div>
                      <div className="text-[10px] text-slate-500">176 Sq Ft • Bottochino Marble</div>
                    </div>

                    <div className="col-span-4 border-2 border-slate-800 p-4 bg-purple-50/40 rounded text-center space-y-1">
                      <div className="font-bold text-xs uppercase">Staircase & Lift</div>
                      <div className="text-sm font-extrabold text-purple-900">5'3" x 5'0"</div>
                      <div className="text-[10px] text-slate-500">RCC Dog-Legged Stairs</div>
                    </div>

                    {/* Bottom Row: Bedroom 3 & Bath/Toilet */}
                    <div className="col-span-7 border-2 border-slate-800 p-4 bg-amber-50/40 rounded text-center space-y-1">
                      <div className="font-bold text-xs uppercase">Bedroom 3 (Master Suite)</div>
                      <div className="text-sm font-extrabold text-amber-800">11'4" x 10'0"</div>
                      <div className="text-[10px] text-slate-500">115 Sq Ft • Wooden Flooring</div>
                    </div>

                    <div className="col-span-5 border-2 border-slate-800 p-4 bg-rose-50/40 rounded text-center space-y-1">
                      <div className="font-bold text-xs uppercase">Toilet & Wash</div>
                      <div className="text-sm font-extrabold text-rose-900">4'0" x 7'0"</div>
                      <div className="text-[10px] text-slate-500">Concealed CPVC Piping</div>
                    </div>

                  </div>

                  <div className="mt-4 flex justify-between items-center text-[11px] text-slate-600 font-sans border-t border-slate-300 pt-2">
                    <span>* Blueprint drawn strictly per IS 456 Structural & Vastu Codes.</span>
                    <span className="font-bold text-slate-900">Scale 1:100 (Top-View Plan)</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Action */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <div className="text-xs text-slate-600">
                  Total Footprint: <span className="font-bold text-slate-900">{activePlan.sqft} sq ft</span> ({activePlan.bhk})
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsTopViewModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    Close Blueprint
                  </button>

                  <button
                    onClick={() => {
                      setIsTopViewModalOpen(false);
                      if (onInquireBlueprint) onInquireBlueprint(activePlan);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Request Official CAD Drawings</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
