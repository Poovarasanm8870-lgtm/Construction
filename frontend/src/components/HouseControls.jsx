import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Home, Palette, Globe } from 'lucide-react';
import { buttonTapScale } from '../utils/animations';

const STYLES = [
  { id: 'MODERN', label: 'Modern Villa', icon: '🏙️', desc: 'Glass facade & open layout' },
  { id: 'COLONIAL', label: 'Heritage Brick', icon: '🏛️', desc: 'Exposed clay brickwork' },
  { id: 'MINIMALIST', label: 'Eco Concrete', icon: '🔲', desc: 'Clean architectural concrete' },
  { id: 'NORDIC', label: 'Timber Lodge', icon: '🌲', desc: 'Sustainable wood frame' },
  { id: 'FUTURISTIC', label: 'Smart Pavilion', icon: '⚡', desc: 'Solar glass & smart shading' },
];

const ROOFS = [
  { id: 'FLAT', label: 'Flat Terrace', icon: '▬' },
  { id: 'GABLED', label: 'Classic Gable', icon: '▲' },
  { id: 'HIP', label: 'Hipped Roof', icon: '⬟' },
  { id: 'SLANTED', label: 'Modern Slanted', icon: '◢' },
];

const GRADES = [
  { id: 'STANDARD', label: 'Standard Builders', desc: 'Standard materials' },
  { id: 'PREMIUM', label: 'Architectural Premium', desc: 'Somany tiles, Tata Steel' },
  { id: 'LUXURY', label: 'Ultra Luxury Custom', desc: 'Italian Marble, Teak wood' },
];

const INDIAN_REGIONS = [
  'Mumbai MMR / Maharashtra',
  'Delhi NCR / Gurgaon / Noida',
  'Bengaluru / Karnataka',
  'Hyderabad / Telangana',
  'Chennai / Tamil Nadu',
  'Pune / Maharashtra',
  'Kolkata / West Bengal',
  'Tier-2 & Tier-3 Cities',
];

const COLORS = [
  '#d97706', // Champagne Gold
  '#0284c7', // Sky Blue
  '#b91c1c', // Heritage Red Brick
  '#64748b', // Concrete Slate
  '#059669', // Emerald Green
  '#7c3aed', // Royal Purple
  '#1e293b', // Deep Navy
  '#ffffff', // Pure White
];

export function HouseControls({ config, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <Sliders className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">House Architectural Controls</h2>
        </div>
        <span className="text-xs text-amber-600 font-mono font-semibold">Real-Time Sync</span>
      </div>

      {/* 1. Square Footage & Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Footprint */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium">Built-Up Footprint</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {config.sqft.toLocaleString()} sq ft
            </span>
          </div>
          <input
            type="range"
            min="600"
            max="8000"
            step="100"
            value={config.sqft}
            onChange={(e) => handleChange('sqft', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>600 sq ft</span>
            <span>4,000 sq ft</span>
            <span>8,000 sq ft</span>
          </div>
        </div>

        {/* Floors */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium">Floor Stories</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {config.floors} {config.floors > 1 ? 'Floors' : 'Floor'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((f) => (
              <button
                key={f}
                onClick={() => handleChange('floors', f)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  config.floors === f
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f} Floor
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Architectural Style */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-slate-700 flex items-center space-x-2">
          <Home className="w-4 h-4 text-amber-600" />
          <span>Architectural Theme</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {STYLES.map((style) => (
            <motion.button
              key={style.id}
              onClick={() => handleChange('style', style.id)}
              {...buttonTapScale}
              className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                config.style === style.id
                  ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{style.icon}</div>
              <div>
                <div className="text-xs font-bold text-slate-900">{style.label}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{style.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 3. Roof & Grade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Roof Design Geometry</label>
          <div className="grid grid-cols-2 gap-2">
            {ROOFS.map((r) => (
              <button
                key={r.id}
                onClick={() => handleChange('roofType', r.id)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                  config.roofType === r.id
                    ? 'bg-amber-500 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Construction Grade</label>
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleChange('finishGrade', g.id)}
                className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                  config.finishGrade === g.id
                    ? 'bg-amber-500 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {g.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Region & Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Construction City Zone</span>
          </label>
          <select
            value={config.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
          >
            {INDIAN_REGIONS.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 flex items-center space-x-2">
            <Palette className="w-4 h-4 text-amber-600" />
            <span>Exterior Wall Palette</span>
          </label>
          <div className="flex items-center space-x-2 pt-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => handleChange('wallColor', c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border border-slate-300 transition-all ${
                  config.wallColor === c
                    ? 'ring-2 ring-amber-500 ring-offset-2 scale-110'
                    : 'hover:scale-105 opacity-90'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
