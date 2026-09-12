import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, PieChart, Package } from 'lucide-react';
import { fadeInUp } from '../utils/animations';

export function CostBreakdownCard({ calculation, isLoading }) {
  if (isLoading || !calculation) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-slate-200 rounded-lg"></div>
        <div className="h-12 w-2/3 bg-slate-200 rounded-xl"></div>
        <div className="space-y-2 pt-4">
          <div className="h-4 w-full bg-slate-200 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { summary, breakdown, material_quantities, bhk_label, region } = calculation;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 tracking-wider uppercase mb-1">
            <PieChart className="w-4 h-4" />
            <span>Turn-Key Project Estimate ({bhk_label})</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline space-x-2">
            <span className="text-amber-600">
              {summary.formatted_grand_total || `₹ ${summary.grand_total_inr.toLocaleString()}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Rate: <span className="text-slate-900 font-bold">₹ {summary.rate_per_sqft_inr} / sq ft</span> built-up area
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
            {region.split('/')[0]}
          </div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>10% Reserve Included</span>
          </div>
        </div>
      </div>

      {/* Physical Materials Box */}
      {material_quantities && (
        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60 space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-amber-900 tracking-wider">
            <Package className="w-4 h-4 text-amber-700" />
            <span>Calculated Material Requirements</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-white p-2.5 rounded-xl border border-amber-200/50">
              <span className="text-slate-500 text-[10px] block">Cement</span>
              <span className="text-slate-900 font-bold">{material_quantities.cement_bags.toLocaleString()} Bags</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200/50">
              <span className="text-slate-500 text-[10px] block">TMT Steel</span>
              <span className="text-slate-900 font-bold">{material_quantities.steel_tons} Tons</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200/50">
              <span className="text-slate-500 text-[10px] block">Bricks / Blocks</span>
              <span className="text-slate-900 font-bold">{material_quantities.bricks_count.toLocaleString()} Pcs</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200/50">
              <span className="text-slate-500 text-[10px] block">Tiles</span>
              <span className="text-slate-900 font-bold">{material_quantities.tiles_sqft.toLocaleString()} Sq Ft</span>
            </div>
          </div>
        </div>
      )}

      {/* Line Item Breakdown */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Line-Item Construction Breakdown</h3>
        
        <div className="space-y-3.5">
          {breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">{item.category}</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹ {item.cost_inr.toLocaleString()}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`h-full rounded-full ${
                    idx % 3 === 0
                      ? 'bg-amber-500'
                      : idx % 3 === 1
                      ? 'bg-emerald-500'
                      : 'bg-sky-500'
                  }`}
                />
              </div>

              <div className="text-[10px] text-slate-500 line-clamp-1">{item.details}</div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
