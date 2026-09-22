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
  const [activeFloor, setActiveFloor] = useState('ground');

  const activePlan = blueprints.find(b => b.id === activeBlueprintId) || blueprints[0];

  const renderBlueprintLayout = () => {
    if (activePlan.id === 'compact1200') {
      return (
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center bg-slate-900 text-white p-2.5 rounded-xl text-xs">
            <span className="font-bold text-amber-400">Ground Floor Plan (2 BHK Single Story)</span>
            <span className="text-slate-300 font-mono">East Entrance (Vastu Compliant)</span>
          </div>

          <div className="grid grid-cols-12 gap-2.5 border-4 border-slate-900 p-4 bg-slate-50 font-mono text-slate-900">
            <div className="col-span-12 border-2 border-dashed border-emerald-600 p-3 bg-emerald-50/60 rounded text-center">
              <div className="font-bold text-xs uppercase text-emerald-950">Covered Entrance Verandah & Porch</div>
              <div className="text-sm font-extrabold text-emerald-800">10'0" x 12'0" (120 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Main East Entry Gate • Anti-skid Granite Finish</div>
            </div>

            <div className="col-span-8 border-2 border-slate-900 p-5 bg-amber-50/60 rounded text-center flex flex-col justify-center space-y-1">
              <div className="font-bold text-xs uppercase text-amber-950">Living & Dining Hall</div>
              <div className="text-base font-extrabold text-amber-900">12'0" x 15'0" (180 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Cross Ventilation UPVC Windows • TV Wall Unit</div>
            </div>

            <div className="col-span-4 border-2 border-slate-900 p-4 bg-blue-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-blue-950">Kitchen & Utility</div>
              <div className="text-sm font-extrabold text-blue-900">8'0" x 10'0" (80 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Granite Counter & Hob • Agni Corner</div>
            </div>

            <div className="col-span-6 border-2 border-slate-900 p-4 bg-indigo-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-indigo-950">Master Bedroom</div>
              <div className="text-sm font-extrabold text-indigo-900">11'0" x 12'0" (132 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">South-West Kuber Location • Wardrobe Niche</div>
            </div>

            <div className="col-span-6 border-2 border-slate-900 p-4 bg-purple-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-purple-950">Bedroom 2 / Kids Room</div>
              <div className="text-sm font-extrabold text-purple-900">10'0" x 11'0" (110 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Study Desk Niche • North Window</div>
            </div>

            <div className="col-span-12 border-2 border-slate-900 p-3 bg-rose-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-rose-950">Common Bathroom & Toilet</div>
              <div className="text-sm font-extrabold text-rose-900">5'0" x 7'0" (35 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Concealed CPVC Fittings • Vertical Exhaust Shaft</div>
            </div>
          </div>
        </div>
      );
    }

    if (activePlan.id === 'luxury3200') {
      return (
        <div className="space-y-4 w-full">
          <div className="flex flex-wrap items-center justify-between bg-slate-900 text-white p-2.5 rounded-xl text-xs gap-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <span>Select Triplex Floor Plan:</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'ground', label: 'Ground (Grand Foyer)' },
                { id: 'first', label: '1st Floor (Presidential)' },
                { id: 'second', label: '2nd Floor (Sky Lounge)' }
              ].map((fl) => (
                <button
                  key={fl.id}
                  onClick={() => setActiveFloor(fl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFloor === fl.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {fl.label}
                </button>
              ))}
            </div>
          </div>

          {activeFloor === 'ground' && (
            <div className="grid grid-cols-12 gap-2.5 border-4 border-slate-900 p-4 bg-slate-50 font-mono text-slate-900">
              <div className="col-span-8 border-2 border-slate-900 p-6 bg-amber-50/60 rounded text-center space-y-1.5">
                <div className="font-bold text-xs uppercase text-amber-950">Double-Height Grand Foyer & Living</div>
                <div className="text-base font-extrabold text-amber-900">20'0" x 25'0" (500 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">22ft Ceiling Clearance • Italian Bottochino Marble • Glass Atrium</div>
              </div>

              <div className="col-span-4 border-2 border-slate-900 p-4 bg-blue-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-blue-950">Gourmet Island Kitchen & Pantry</div>
                <div className="text-sm font-extrabold text-blue-900">12'0" x 14'0" (168 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Breakfast Bar • Built-in Oven Unit • Agni Corner</div>
              </div>

              <div className="col-span-7 border-2 border-slate-900 p-4 bg-indigo-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-indigo-950">Ground Guest Suite + Bath</div>
                <div className="text-sm font-extrabold text-indigo-900">14'0" x 16'0" (224 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Attached 6'x9' Bathroom • Garden View French Door</div>
              </div>

              <div className="col-span-5 border-2 border-slate-900 p-4 bg-purple-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-purple-950">Servant Quarter & Utility</div>
                <div className="text-sm font-extrabold text-purple-900">8'0" x 10'0" (80 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Separate External Entrance • Utility Wash</div>
              </div>

              <div className="col-span-12 border-2 border-dashed border-amber-600 p-2.5 bg-amber-100/50 rounded text-center">
                <div className="font-bold text-xs text-amber-900">Hydraulic Glass Elevator & Grand Curved Spiral Staircase (8'x8')</div>
              </div>
            </div>
          )}

          {activeFloor === 'first' && (
            <div className="grid grid-cols-12 gap-2.5 border-4 border-slate-900 p-4 bg-slate-50 font-mono text-slate-900">
              <div className="col-span-7 border-2 border-slate-900 p-5 bg-indigo-50/60 rounded text-center space-y-1.5">
                <div className="font-bold text-xs uppercase text-indigo-950">Presidential Master Suite</div>
                <div className="text-base font-extrabold text-indigo-900">16'0" x 20'0" (320 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Walk-in Closet (8'x10') • Jacuzzi Bath (8'x10') • Teak Wood Flooring</div>
              </div>

              <div className="col-span-5 border-2 border-slate-900 p-4 bg-amber-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-amber-950">Home Theatre & Family Lounge</div>
                <div className="text-sm font-extrabold text-amber-900">16'0" x 18'0" (288 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Acoustic Wall Panels • 4K Projector Setup</div>
              </div>

              <div className="col-span-8 border-2 border-slate-900 p-4 bg-purple-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-purple-950">Bedroom 2 En-Suite Suite</div>
                <div className="text-sm font-extrabold text-purple-900">14'0" x 15'0" (210 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Private Balcony Access • Attached Bath</div>
              </div>

              <div className="col-span-4 border-2 border-dashed border-slate-400 p-4 bg-slate-200/60 rounded text-center space-y-1 flex flex-col justify-center">
                <div className="font-bold text-xs uppercase text-slate-700">Double Height Void Cutout</div>
                <div className="text-[10px] text-slate-500">Overlooks Ground Floor Grand Foyer</div>
              </div>
            </div>
          )}

          {activeFloor === 'second' && (
            <div className="grid grid-cols-12 gap-2.5 border-4 border-slate-900 p-4 bg-slate-50 font-mono text-slate-900">
              <div className="col-span-7 border-2 border-slate-900 p-5 bg-sky-50/60 rounded text-center space-y-1.5">
                <div className="font-bold text-xs uppercase text-sky-950">Penthouse Sky Lounge & Bar Zone</div>
                <div className="text-base font-extrabold text-sky-900">18'0" x 22'0" (396 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Motorized Glass Pergola • Bar Counter • Ambient Lighting</div>
              </div>

              <div className="col-span-5 border-2 border-slate-900 p-4 bg-emerald-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-emerald-950">Covered Deck & Jacuzzi Zone</div>
                <div className="text-sm font-extrabold text-emerald-900">12'0" x 14'0" (168 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Heated 6-Seater Outdoor Jacuzzi • Deck Wood Flooring</div>
              </div>

              <div className="col-span-12 border-2 border-slate-900 p-4 bg-rose-50/60 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-rose-950">Private Gym & Wellness Sauna</div>
                <div className="text-sm font-extrabold text-rose-900">14'0" x 16'0" (224 Sq Ft)</div>
                <div className="text-[10px] text-slate-600">Rubberized Flooring • Steam Bath & Cedar Sauna Cabin</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default Villa 1500 Layout
    return (
      <div className="space-y-4 w-full">
        <div className="flex flex-wrap items-center justify-between bg-slate-900 text-white p-2.5 rounded-xl text-xs gap-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <span>Select Duplex Floor Plan:</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'ground', label: 'Ground Floor (G)' },
              { id: 'first', label: 'First Floor (F1)' }
            ].map((fl) => (
              <button
                key={fl.id}
                onClick={() => setActiveFloor(fl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFloor === fl.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {fl.label}
              </button>
            ))}
          </div>
        </div>

        {activeFloor === 'ground' ? (
          <div className="grid grid-cols-12 gap-2.5 border-4 border-slate-900 p-4 bg-slate-50 font-mono text-slate-900">
            <div className="col-span-6 border-2 border-slate-900 p-4 bg-amber-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-amber-950">Master Bedroom 1</div>
              <div className="text-sm font-extrabold text-amber-900">10'0" x 12'0" (120 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">South-West Vastu Kuber • Attached Bath (4'x7')</div>
            </div>

            <div className="col-span-6 border-2 border-slate-900 p-4 bg-indigo-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-indigo-950">Guest Bedroom 2</div>
              <div className="text-sm font-extrabold text-indigo-900">10'0" x 12'0" (120 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">North-West Corner • UPVC Window</div>
            </div>

            <div className="col-span-4 border-2 border-slate-900 p-4 bg-blue-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-blue-950">Modular Kitchen</div>
              <div className="text-sm font-extrabold text-blue-900">8'4" x 11'0" (92 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Agni South-East Corner • Quartz Top</div>
            </div>

            <div className="col-span-4 border-2 border-slate-900 p-5 bg-emerald-50/60 rounded text-center flex flex-col justify-center space-y-1">
              <div className="font-bold text-xs uppercase text-emerald-950">Dining & Living Foyer</div>
              <div className="text-base font-extrabold text-emerald-900">11'0" x 16'0" (176 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">North-East Eshanya Main Entrance</div>
            </div>

            <div className="col-span-4 border-2 border-slate-900 p-4 bg-purple-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-purple-950">RCC Staircase & Lift</div>
              <div className="text-sm font-extrabold text-purple-900">5'3" x 5'0" (26 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Dog-legged Stairs to F1</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-2.5 border-4 border-slate-900 p-4 bg-slate-50 font-mono text-slate-900">
            <div className="col-span-7 border-2 border-slate-900 p-5 bg-amber-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-amber-950">Upper Bedroom 3 Suite</div>
              <div className="text-base font-extrabold text-amber-900">11'4" x 10'0" (115 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Wooden Flooring • Walk-in Closet • En-suite Bath</div>
            </div>

            <div className="col-span-5 border-2 border-slate-900 p-4 bg-emerald-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-emerald-950">Private Open Terrace & Balcony</div>
              <div className="text-sm font-extrabold text-emerald-900">14'0" x 12'0" (168 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Glass Railing • Weatherproof Deck Tiles</div>
            </div>

            <div className="col-span-8 border-2 border-slate-900 p-4 bg-indigo-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-indigo-950">Upper Family Lobby & Sitout</div>
              <div className="text-sm font-extrabold text-indigo-900">11'0" x 10'0" (110 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Seating Area • Sky Light</div>
            </div>

            <div className="col-span-4 border-2 border-slate-900 p-4 bg-purple-50/60 rounded text-center space-y-1">
              <div className="font-bold text-xs uppercase text-purple-950">Stair Landing & Lift</div>
              <div className="text-sm font-extrabold text-purple-900">5'3" x 5'0" (26 Sq Ft)</div>
              <div className="text-[10px] text-slate-600">Access from Ground Floor</div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10 group shadow-2xl transition-all duration-500">
              <motion.img
                key={selectedReferenceImage}
                initial={{ opacity: 0.8, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springTransition}
                src={activePlan.referenceImages[selectedReferenceImage]?.url || activePlan.referenceImages[0].url}
                alt={activePlan.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              
              {/* Glossy iOS Reflection Sweep on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

              {/* Top Right iOS Hover Badge */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-[11px] font-bold border border-amber-400/30 shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>iOS Interactive View</span>
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
              
              {/* View Top View Blueprint Trigger Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                <div className="text-white">
                  <div className="text-xs text-slate-300 font-medium">{activePlan.title}</div>
                  <div className="text-lg font-bold text-amber-400">{activePlan.sqft} sq ft • {activePlan.bhk}</div>
                </div>

                <motion.button
                  whileTap={bouncyTap}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsTopViewModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 border border-amber-400"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Top-View Blueprint</span>
                </motion.button>
              </div>
            </div>

            {/* Thumbnail Selector Bar */}
            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {activePlan.referenceImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={bouncyTap}
                  onClick={() => setSelectedReferenceImage(idx)}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedReferenceImage === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.03] shadow-lg shadow-amber-500/20'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-950/30 hover:bg-transparent transition-colors" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate text-center bg-slate-950/60 backdrop-blur-sm py-0.5 rounded">
                    {img.label}
                  </span>
                </motion.button>
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
                      {activePlan.title} — 2D Architectural Floor Plan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Official Floor Plan with Room Dimensions & Structural Boundaries
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
                  <div className="w-full">
                    {renderBlueprintLayout()}
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
