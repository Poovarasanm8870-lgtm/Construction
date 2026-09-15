import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles, ArrowRight, ShieldCheck, Award, Users, CheckCircle2 } from 'lucide-react';
import { buttonTapScale } from '../utils/animations';

export function HeroSection({ onCalculateClick, onViewProjectsClick }) {
  return (
    <section className="relative w-full py-12 lg:py-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
      
      {/* Background Subtle Ambient Circles */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-12">
        
        {/* Main Hero Header Stack */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* iOS Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="text-xs font-semibold text-amber-900 tracking-wide">
              Next-Gen Architectural Construction & AI Estimation
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
          >
            Build Your Dream House with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
              Precision & 3D Clarity
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Experience turn-key home construction with real-time 3D house wireframes, instant Indian Rupee (₹) civil cost estimation powered by Groq AI, and interactive Vastu floor plans.
          </motion.p>

          {/* Dual Action CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <motion.button
              onClick={onCalculateClick}
              {...buttonTapScale}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2.5 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Calculate Turn-Key Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={onViewProjectsClick}
              {...buttonTapScale}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-2xs flex items-center justify-center space-x-2 transition-all"
            >
              <span>Explore Completed Projects</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Live Metrics Cards Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
        >
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">150+</div>
            <div className="text-xs font-semibold text-slate-600">Turn-Key Projects Delivered</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">100%</div>
            <div className="text-xs font-semibold text-slate-600">Vastu Compliant Layouts</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">₹ 1,750</div>
            <div className="text-xs font-semibold text-slate-600">Starting Rate / Sq Ft</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">10-Year</div>
            <div className="text-xs font-semibold text-slate-600">Structural Build Warranty</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
