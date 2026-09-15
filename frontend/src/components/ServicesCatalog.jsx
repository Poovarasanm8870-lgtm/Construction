import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Compass, ShieldCheck, Palette, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { fadeInUp, cardHoverLift } from '../utils/animations';

const ICON_MAP = {
  Building2: Building2,
  Compass: Compass,
  ShieldCheck: ShieldCheck,
  Palette: Palette,
  RefreshCw: RefreshCw,
};

export function ServicesCatalog({ services, onSelectService }) {
  if (!services || services.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Comprehensive Construction Offerings</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Our Core Civil & Architectural Services
          </h2>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">All builds backed by 10-Year Structural Guarantee</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv, idx) => {
          const IconComp = ICON_MAP[srv.icon] || Building2;
          return (
            <motion.div
              key={srv.id || idx}
              {...cardHoverLift}
              className="bg-slate-50/90 rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-5 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                
                {/* Top Icon Badge & Price */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block">Starting From</span>
                    <span className="text-sm font-extrabold text-amber-700">₹ {srv.starting_price_inr}</span>
                    <span className="text-[10px] text-slate-500"> / sq ft</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">{srv.tagline}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  {srv.features?.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectService(srv)}
                className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs transition-all shadow-2xs flex items-center justify-center space-x-2"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
