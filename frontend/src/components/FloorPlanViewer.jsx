import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Compass } from 'lucide-react';
import { cardHoverLift } from '../utils/animations';

export function FloorPlanViewer({ rooms, sqft, floors, bhkLabel }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState('2d');

  if (!rooms || rooms.length === 0) return null;

  const totalCarpetSqft = rooms.reduce((acc, r) => acc + r.area_sqft, 0);

  return (
    <div className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span>Interactive Architectural Floor Plan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>{bhkLabel} Room Layout Blueprint</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {sqft.toLocaleString()} sq ft Built-Up
            </span>
          </h2>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 space-x-1">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === '2d'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D Architectural Plan
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === '3d'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spatial Layout View
          </button>
        </div>
      </div>

      {/* Blueprint Canvas Box */}
      <div className="relative w-full min-h-[380px] rounded-2xl bg-[#F0F7FF] border border-blue-200 p-6 flex flex-col justify-between overflow-hidden group">
        
        {/* Architectural Blue Grid Paper */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(37, 99, 235, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Legend */}
        <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>N <Compass className="inline w-3.5 h-3.5 text-blue-600" /> True North Orientation</span>
          </div>
          <div>Carpet Area: <span className="text-slate-900 font-bold">{totalCarpetSqft.toLocaleString()} sq ft</span></div>
        </div>

        {/* Rooms Grid */}
        <div className="relative z-10 my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, idx) => (
            <motion.div
              key={idx}
              onClick={() => setSelectedRoom(room)}
              {...cardHoverLift}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                selectedRoom?.name === room.name
                  ? 'bg-white border-amber-500 text-slate-900 shadow-md scale-[1.02]'
                  : 'bg-white/90 border-slate-200 text-slate-700 hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {room.type}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{room.floor}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1">{room.name}</h4>
              
              <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 font-mono text-xs">
                <span className="text-slate-500">Dim: {room.dimensions}</span>
                <span className="font-extrabold text-amber-700">{room.area_sqft} sq ft</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Specs Note */}
        <div className="relative z-10 pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-blue-200/60">
          <span>* Room proportions automatically calculated for ventilation & structural efficiency.</span>
          <span className="text-slate-900 font-mono font-semibold">{floors} Floors Layout</span>
        </div>

      </div>

    </div>
  );
}
