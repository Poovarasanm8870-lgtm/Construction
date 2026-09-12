import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw, HardHat, Package } from 'lucide-react';
import { fadeInUp, cardHoverLift } from '../utils/animations';

export function MaterialMarketplace() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/materials/');
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      } else {
        throw new Error('Fallback data');
      }
    } catch (e) {
      setMarketData({
        materials: [
          { id: 1, name: "UltraTech 53 Grade OPC Cement", category: "Cement", price: 385.00, unit: "50 kg bag", trend: "+1.8%", volatility: "Low", brand: "UltraTech" },
          { id: 2, name: "Tata Tiscon 550D TMT Steel Rebar", category: "Steel", price: 64500.00, unit: "ton", trend: "-0.8%", volatility: "Medium", brand: "Tata Steel" },
          { id: 3, name: "M-Sand (Manufactured Sand)", category: "Aggregates", price: 55.00, unit: "cu ft", trend: "+2.1%", volatility: "Low", brand: "Regional Quarries" },
          { id: 4, name: "Red Clay Bricks (Class 1)", category: "Masonry", price: 9.50, unit: "unit brick", trend: "+3.0%", volatility: "Low", brand: "Kiln Bricks" },
          { id: 5, name: "Somany Vitrified Tiles (800x800mm)", category: "Flooring", price: 85.00, unit: "sq ft", trend: "0.0%", volatility: "Low", brand: "Somany" },
          { id: 6, name: "Asian Paints Royale Luxury Emulsion", category: "Paints", price: 540.00, unit: "liter", trend: "+1.2%", volatility: "Low", brand: "Asian Paints" }
        ],
        labor_rates: [
          { id: 1, trade: "Civil Site Engineer Supervision", hourly_rate: 450.00, sqft_rate: 120.00, region: "Mumbai MMR" },
          { id: 2, trade: "Master Mason & RCC Specialist", hourly_rate: 350.00, sqft_rate: 95.00, region: "Mumbai MMR" },
          { id: 3, trade: "Shuttering & Carpenter Specialist", hourly_rate: 320.00, sqft_rate: 80.00, region: "Mumbai MMR" },
          { id: 4, trade: "Licensed Master Electrician", hourly_rate: 380.00, sqft_rate: 65.00, region: "Mumbai MMR" },
          { id: 5, trade: "Plumbing & Sanitary Technician", hourly_rate: 360.00, sqft_rate: 60.00, region: "Mumbai MMR" },
          { id: 6, trade: "Painter & Waterproofing Expert", hourly_rate: 280.00, sqft_rate: 35.00, region: "Mumbai MMR" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Live Commodity & Labor Rate Index (₹)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Indian Building Material Spot Rates
          </h2>
        </div>

        <button
          onClick={fetchMarketData}
          className="self-start sm:self-auto bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center space-x-2 transition-all border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Spot Prices</span>
        </button>
      </div>

      {/* Raw Materials Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-2">
          <Package className="w-4 h-4" />
          <span>Building Materials Market Rates</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData?.materials?.map((mat) => (
            <motion.div
              key={mat.id}
              {...cardHoverLift}
              className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3 relative overflow-hidden hover:bg-white"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                    {mat.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">{mat.name}</h4>
                </div>

                <div
                  className={`flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    mat.trend.startsWith('+')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : mat.trend.startsWith('-')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {mat.trend.startsWith('+') && <TrendingUp className="w-3 h-3" />}
                  {mat.trend.startsWith('-') && <TrendingDown className="w-3 h-3" />}
                  {mat.trend === '0.0%' && <Minus className="w-3 h-3" />}
                  <span>{mat.trend}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  ₹ {mat.price.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {mat.unit}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Brand: <span className="text-slate-800 font-semibold">{mat.brand}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skilled Labor Table */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-2">
          <HardHat className="w-4 h-4" />
          <span>Regional Trade Contracting Wage Rates (in ₹)</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono">
              <tr>
                <th className="py-3 px-4">Trade Specialty</th>
                <th className="py-3 px-4">Hourly Rate</th>
                <th className="py-3 px-4">Sq Ft Contracting Rate</th>
                <th className="py-3 px-4">City Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {marketData?.labor_rates?.map((labor) => (
                <tr key={labor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{labor.trade}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">
                    ₹ {labor.hourly_rate} / hr
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700">
                    ₹ {labor.sqft_rate} / sq ft
                  </td>
                  <td className="py-3 px-4 text-slate-500">{labor.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}
