import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ShieldAlert, TrendingUp, Users, Calendar, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { fadeInUp, cardHoverLift } from '../utils/animations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/analytics/');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        throw new Error('API server busy');
      }
    } catch (e) {
      // Static fallback for dev
      setAnalyticsData({
        kpis: {
          total_queries_today: 48,
          total_sessions: 142,
          active_leads: 38,
          avg_estimate_inr: "₹ 85.4 Lakhs",
          conversion_rate: "26.7%"
        },
        line_chart: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "AI Chatbot Inquiries",
              data: [42, 58, 65, 84, 92, 115, 142],
              borderColor: "#d97706",
              backgroundColor: "rgba(217, 119, 6, 0.12)",
              fill: true,
              tension: 0.4
            }
          ]
        },
        bar_chart: {
          labels: ["< 1200 sq ft", "1200-2000 sq ft", "2000-3500 sq ft", "3500-5000 sq ft", "5000+ sq ft"],
          datasets: [
            {
              label: "Projects Inquired",
              data: [18, 45, 62, 28, 12],
              backgroundColor: ["#3b82f6", "#10b981", "#d97706", "#8b5cf6", "#f43f5e"]
            }
          ]
        },
        doughnut_chart: {
          labels: ["Browsing Inquiries", "Booked Site Visits", "Converted Projects"],
          datasets: [
            {
              data: [104, 38, 16],
              backgroundColor: ["#94a3b8", "#d97706", "#10b981"]
            }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-pulse space-y-6">
        <div className="h-8 w-1/4 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { kpis, line_chart, bar_chart, doughnut_chart } = analyticsData;

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
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Admin Analytics & Lead Insights</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Chatbot Interactions & Conversion Metrics Dashboard
          </h2>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center space-x-2 transition-all border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Queries Today</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{kpis.total_queries_today}</div>
          <div className="text-[10px] text-emerald-600 font-bold">+18% vs yesterday</div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Active Site Visit Leads</div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">{kpis.active_leads}</div>
          <div className="text-[10px] text-slate-500 font-mono">Booked Inspections</div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Avg Inquired Budget</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{kpis.avg_estimate_inr}</div>
          <div className="text-[10px] text-slate-500">Turnkey Calculations</div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Lead Conversion Rate</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">{kpis.conversion_rate}</div>
          <div className="text-[10px] text-slate-500">Inquiry to Site Visit</div>
        </div>
      </div>

      {/* Chart.js Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Line Chart: Interactions over time (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Total Chatbot Interactions Over Time
          </h3>
          <div className="h-[260px] w-full flex items-center justify-center">
            <Line
              data={line_chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e2e8f0" } }
                }
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart: Conversion Funnel (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lead Conversion Funnel
          </h3>
          <div className="h-[260px] w-full flex items-center justify-center">
            <Doughnut
              data={doughnut_chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } }
              }}
            />
          </div>
        </div>

        {/* Bar Chart: Most Requested Sq Ft Distribution (12 Cols) */}
        <div className="lg:col-span-12 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Most Requested Plot Sizes & Sq Ft Distribution
          </h3>
          <div className="h-[240px] w-full">
            <Bar
              data={bar_chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e2e8f0" } }
                }
              }}
            />
          </div>
        </div>
      </div>

    </motion.div>
  );
}
