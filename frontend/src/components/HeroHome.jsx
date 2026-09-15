import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Calculator,
  Compass,
  PhoneCall
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

export default function HeroHome({ onExploreServices, onExploreBlueprints, onOpenChat }) {
  const stats = [
    { label: "Delivered Projects", value: "250+", detail: "Residential & Commercial" },
    { label: "Engineering Excellence", value: "15+ Yrs", detail: "IS 456 / NBC 2016 Compliant" },
    { label: "On-Time Guarantee", value: "99.4%", detail: "Strict Milestones" },
    { label: "Structural Warranty", value: "10 Years", detail: "Turnkey Protection" }
  ];

  const highlights = [
    "Vastu Shastra Compliant Plans",
    "Tata Tiscon Steel & UltraTech Cement",
    "Fixed Turnkey Price Guarantee",
    "Bi-weekly Photo Progress Reports"
  ];

  return (
    <div className="w-full bg-slate-50 py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Hero Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Premium Civil & Architectural Construction</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Building Your Dream Home with <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800">Unmatched Quality</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              From full-scale turn-key building and architectural blueprints to professional plumbing, wiring, and luxury interiors. We craft homes built for generations with complete structural transparency.
            </p>

            {/* Feature Bullet Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <motion.button
                whileTap={bouncyTap}
                onClick={onExploreServices}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Explore 5 Core Services</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </motion.button>

              <motion.button
                whileTap={bouncyTap}
                onClick={onExploreBlueprints}
                className="px-6 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-800 font-semibold text-sm sm:text-base hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Inspect House Blueprints</span>
              </motion.button>
            </div>
          </div>

          {/* Right Card Column */}
          <div className="lg:col-span-5">
            <motion.div 
              whileHover={{ y: -4 }}
              transition={springTransition}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Instant Turn-Key Calculator</h3>
                    <p className="text-xs text-slate-500">Live Indian Construction Estimates</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                  2026 Rates
                </span>
              </div>

              {/* Sample Calculation Card */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Reference Project:</span>
                    <span className="text-slate-900 font-bold">1,500 Sq Ft Villa (G+1)</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900">₹ 48.5 Lakhs</span>
                    <span className="text-xs text-amber-800 font-semibold">₹ 1,850 / sq ft</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Building Materials (Cement, Steel, Bricks)</span>
                    <span className="font-bold text-slate-900">₹ 26.67 Lakhs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Skilled Labour & Masonry Work</span>
                    <span className="font-bold text-slate-900">₹ 14.55 Lakhs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Approvals & Structural Reserve Buffer</span>
                    <span className="font-bold text-slate-900">₹ 7.28 Lakhs</span>
                  </div>
                </div>

                <motion.button
                  whileTap={bouncyTap}
                  onClick={onOpenChat}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Get Custom Estimate with AI Assistant</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all text-center space-y-1"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-800">{stat.label}</div>
              <div className="text-[11px] text-slate-500 font-medium">{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
