import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Compass, Eye, X, CheckCircle2, MapPin, Layers } from 'lucide-react';
import { cardHoverLift, buttonTapScale } from '../utils/animations';

export function FloorPlanViewer({ rooms, sqft, floors, bhkLabel }) {
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d', '3d', 'render'
  const [selectedBhk, setSelectedBhk] = useState(bhkLabel || '3 BHK');

  if (!rooms || rooms.length === 0) return null;

  const totalCarpetSqft = rooms.reduce((acc, r) => acc + r.area_sqft, 0);

  return (
    <div className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span>Interactive Floor Plan & Hotspot Inspector</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>{selectedBhk} Room Layout Blueprint</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {sqft.toLocaleString()} sq ft Built-Up
            </span>
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === '2d'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D Blueprint
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === '3d'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D Spatial Layout
          </button>
          <button
            onClick={() => setViewMode('render')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'render'
                ? 'bg-amber-500 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interior Render
          </button>
        </div>
      </div>

      {/* Blueprint Canvas Box */}
      <div className="relative w-full min-h-[400px] rounded-2xl bg-[#F0F7FF] border border-blue-200 p-6 flex flex-col justify-between overflow-hidden group">
        
        {/* Blue Grid Paper Background */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(37, 99, 235, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Legend */}
        <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>N <Compass className="inline w-3.5 h-3.5 text-blue-600" /> Vastu Compliant Orientation</span>
          </div>
          <div>Carpet Area: <span className="text-slate-900 font-bold">{totalCarpetSqft.toLocaleString()} sq ft</span></div>
        </div>

        {/* Interactive Hotspot Room Cards */}
        <div className="relative z-10 my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, idx) => (
            <motion.div
              key={idx}
              onClick={() => setSelectedHotspot(room)}
              {...cardHoverLift}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                selectedHotspot?.name === room.name
                  ? 'bg-white border-amber-500 text-slate-900 shadow-md scale-[1.02] ring-2 ring-amber-400/20'
                  : 'bg-white/90 border-slate-200 text-slate-700 hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {room.type}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{room.floor}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>{room.name}</span>
                <Eye className="w-3.5 h-3.5 text-amber-600" />
              </h4>
              
              <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 font-mono text-xs">
                <span className="text-slate-500">Dim: {room.dimensions}</span>
                <span className="font-extrabold text-amber-700">{room.area_sqft} sq ft</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-blue-200/60">
          <span>* Click any room card to inspect detailed material finishes & civil specs.</span>
          <span className="text-slate-900 font-mono font-semibold">{floors} Floors Layout</span>
        </div>

      </div>

      {/* Interactive Hotspot Room Specs Modal */}
      <AnimatePresence>
        {selectedHotspot && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 relative"
            >
              <button
                onClick={() => setSelectedHotspot(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {selectedHotspot.type} Specification
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedHotspot.name}</h3>
                <p className="text-xs font-mono text-slate-500">Dimensions: {selectedHotspot.dimensions} ({selectedHotspot.area_sqft} sq ft)</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700">Civil & Architectural Finishes</h4>
                <div className="space-y-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Flooring: Vitrified Tiles / Italian Marble Fitting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Painting: Asian Paints Royale Luxury Emulsion & Gypsum Plaster</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Electrical: Finolex Copper Concealed Wiring & Modular Switches</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Plumbing: Astral CPVC Pipes & Kohler/Jaquar Sanitary Fittings</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedHotspot(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Close Room Specs
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
