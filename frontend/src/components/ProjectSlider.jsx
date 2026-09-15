import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Clock, Maximize2, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';
import { buttonTapScale } from '../utils/animations';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export function ProjectSlider({ projects, onSelectProject }) {
  const [beforeAfterPos, setBeforeAfterPos] = useState(50);
  const [selectedBeforeAfter, setSelectedBeforeAfter] = useState(projects?.[0] || null);

  if (!projects || projects.length === 0) return null;

  const currentProject = selectedBeforeAfter || projects[0];

  return (
    <div className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Works Done & Project Portfolio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Completed Architectural Projects & Before/After Transformation
          </h2>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">Touch & drag slider to inspect transformation</p>
      </div>

      {/* 1. Touch-Friendly Interactive Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 rounded-3xl p-6 border border-slate-200/80">
        
        {/* Left Slider Frame (7 Cols) */}
        <div className="lg:col-span-7 w-full space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full">Initial Site (Before)</span>
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full font-bold">Turnkey Result (After)</span>
          </div>

          <div className="relative h-[320px] sm:h-[400px] w-full rounded-2xl overflow-hidden shadow-md select-none">
            {/* After Image */}
            <img
              src={currentProject.after_image}
              alt="After Transformation"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Before Image with Clip */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${beforeAfterPos}%` }}
            >
              <img
                src={currentProject.before_image}
                alt="Before Construction"
                className="w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Range Slider Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={beforeAfterPos}
              onChange={(e) => setBeforeAfterPos(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-xl pointer-events-none z-10"
              style={{ left: `${beforeAfterPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center font-bold text-xs">
                ↔
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{currentProject.category}</span>
            <h3 className="text-2xl font-bold text-slate-900">{currentProject.title}</h3>
            <p className="text-xs text-slate-500 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentProject.location}</span>
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentProject.description}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block">Footprint</span>
              <span className="font-bold text-slate-900">{currentProject.sqft} sq ft</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block">Completion</span>
              <span className="font-bold text-slate-900">{currentProject.duration_months} Months</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block">Budget</span>
              <span className="font-bold text-amber-700">{currentProject.estimated_cost_inr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Swiper.js Portfolio Showcase Carousel */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Browse All Completed Projects</h3>

        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 20,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
          className="w-full py-4"
        >
          {projects.map((proj) => (
            <SwiperSlide key={proj.id} className="w-[300px] sm:w-[360px]">
              <div
                onClick={() => setSelectedBeforeAfter(proj)}
                className={`bg-white rounded-3xl overflow-hidden border transition-all cursor-pointer group ${
                  selectedBeforeAfter?.id === proj.id
                    ? 'border-amber-500 shadow-md ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={proj.after_image}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-900 text-white shadow-sm">
                    {proj.category}
                  </span>
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-white text-slate-900 shadow-sm border border-slate-200">
                    {proj.estimated_cost_inr}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 font-mono">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>{proj.location} • {proj.sqft} sq ft</span>
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

    </div>
  );
}
