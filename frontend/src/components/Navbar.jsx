import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles, MessageSquare, Layers, TrendingUp, LayoutGrid, Activity, Briefcase } from 'lucide-react';
import { buttonTapScale } from '../utils/animations';

export function Navbar({ onToggleChat, isChatOpen, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200 px-4 lg:px-8 py-3 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <motion.div 
            className="w-10 h-10 rounded-xl bg-amber-500 p-[1.5px] shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
          </motion.div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Construct<span className="text-amber-600">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                PRO BUILDER
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Civil Construction & AI Estimation Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1 ${
              activeTab === 'services'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1 ${
              activeTab === 'projects'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Works Done</span>
          </button>

          <button
            onClick={() => setActiveTab('floorplan')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1 ${
              activeTab === 'floorplan'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Floor Plans</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1 ${
              activeTab === 'visualizer'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1 ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={onToggleChat}
            {...buttonTapScale}
            className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              isChatOpen
                ? 'bg-amber-500 text-white shadow-amber-500/30 font-bold'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Groq AI Assistant</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
