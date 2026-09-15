import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Sparkles, 
  MessageSquare, 
  Compass, 
  Briefcase, 
  Lock,
  Home
} from 'lucide-react';
import { bouncyTap } from '../animations/iosSprings';

export function Navbar({ onToggleChat, isChatOpen, activeTab, setActiveTab, onOpenHiddenAdmin }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200 px-4 lg:px-8 py-3 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
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
                Turn-Key Builder
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Civil Engineering & Architectural Excellence</p>
          </div>
        </div>

        {/* Public Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1.5 rounded-full bg-slate-100 border border-slate-200 space-x-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'services'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>5 Core Services</span>
          </button>

          <button
            onClick={() => setActiveTab('blueprints')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'blueprints'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>House Blueprints</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'portfolio'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Assistant</span>
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.button
            whileTap={bouncyTap}
            onClick={onToggleChat}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              isChatOpen
                ? 'bg-amber-500 text-white font-bold'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </motion.button>

          {/* Discreet Admin Lock Button */}
          <button
            onClick={onOpenHiddenAdmin}
            title="Internal Staff Login"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
