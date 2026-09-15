import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Compass, 
  Layers, 
  Box, 
  Ruler, 
  Home, 
  Sparkles, 
  Check, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { modalBackdropVariant, modalSlideUpVariant, bouncyTap } from '../animations/iosSprings';

export default function RoomLayoutModal({ project, isOpen, onClose }) {
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  if (!isOpen || !project) return null;

  const roomList = project.layouts || [
    { name: "Grand Living Foyer", sqft: 580, dimensions: "26.5 ft x 21.8 ft", level: "Ground Floor", finishes: "Italian Bottochino Marble, False Ceiling Cove Lighting" },
    { name: "Master Bedroom Suite", sqft: 420, dimensions: "21.0 ft x 20.0 ft", level: "First Floor", finishes: "Laminated Wooden Flooring, En-suite Jacuzzi" },
    { name: "Modular Island Kitchen", sqft: 240, dimensions: "16.0 ft x 15.0 ft", level: "Ground Floor", finishes: "Quartz Countertop, Hafele Soft-Close Hardware" }
  ];

  const currentRoom = roomList[selectedRoomIndex] || roomList[0];

  const blueprintImage2D = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80";
  const renderImage3D = project.afterImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalSlideUpVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-5xl bg-white/95 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/80 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {project.title} — Architectural Room Layouts
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Total Built-Up Footprint: <span className="font-semibold text-slate-800">{project.sqft.toLocaleString()} sq ft</span> ({project.bhk})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 2D / 3D Toggle */}
              <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl">
                <button
                  onClick={() => setViewMode('2D')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === '2D'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2D Blueprint
                </button>
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === '3D'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  3D Render
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
            {/* Visual Canvas (Left Column) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                <img
                  src={viewMode === '2D' ? blueprintImage2D : renderImage3D}
                  alt="Layout View"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />

                {/* Hotspot Indicator */}
                <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Showing: {currentRoom.name}</span>
                </div>

                {/* Bottom Overlay Specs */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md text-white border border-white/10 flex justify-between items-center shadow-lg">
                  <div>
                    <div className="text-xs text-slate-300 font-medium">Room Footprint</div>
                    <div className="text-lg font-bold text-amber-400">{currentRoom.sqft} sq ft</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-300 font-medium">Dimensions</div>
                    <div className="text-sm font-semibold text-white">{currentRoom.dimensions}</div>
                  </div>
                </div>
              </div>

              {/* Vastu & Code Compliance Note */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-3 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  <span className="font-bold">100% Vastu Shastra & NBC Code Verified:</span> All room layouts adhere to Indian National Building Code (NBC 2016) setback rules and structural load distributions.
                </p>
              </div>
            </div>

            {/* Room Breakdown Selector & Details (Right Column) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
                  <span>Room Breakdown ({roomList.length} Rooms)</span>
                  <span className="text-xs text-amber-800 font-semibold lowercase">click to select</span>
                </h4>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {roomList.map((room, idx) => {
                    const isSelected = selectedRoomIndex === idx;
                    return (
                      <motion.div
                        key={idx}
                        whileTap={bouncyTap}
                        onClick={() => setSelectedRoomIndex(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{room.name}</div>
                            <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {room.dimensions} • {room.level || 'Ground Floor'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isSelected ? 'bg-white/10 text-amber-300' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {room.sqft} sq ft
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Room Specifications */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Selected Specifications</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">{currentRoom.name}</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentRoom.finishes || "Premium Vitrified Tiles (800x800mm), Concealed Copper Wiring (Polycab), Jaquar Sanitary Fittings."}
                </p>
              </div>

              {/* Close / Action Button */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
              >
                Close Layout Inspector
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
