import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Sparkles, Bed, Bath, Car, ArrowRight, Eye } from 'lucide-react';
import { buttonTapScale } from '../utils/animations';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export function ProjectCarousel({ templates, onSelectTemplate }) {
  if (!templates || templates.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Featured Architectural Blueprints</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Curated 3D House Concepts
          </h2>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">Swipe to explore & click to load into 3D visualizer</p>
      </div>

      {/* Swiper Coverflow Carousel */}
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 25,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
        className="w-full py-8"
      >
        {templates.map((tpl) => (
          <SwiperSlide key={tpl.id} className="w-[300px] sm:w-[380px]">
            <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-md group transition-all duration-300 hover:border-amber-500 hover:shadow-lg">
              
              {/* Image Banner */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                <img
                  src={tpl.image}
                  alt={tpl.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                
                {/* Badge */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                  {tpl.badge}
                </span>

                {/* Price Tag */}
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl text-xs font-mono font-extrabold bg-white/95 text-slate-900 border border-slate-200 shadow-sm">
                  {tpl.estimated_price}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 bg-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-500">{tpl.subtitle}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-slate-700 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Bed className="w-3.5 h-3.5 text-amber-600" />
                    <span>{tpl.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Bath className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tpl.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Car className="w-3.5 h-3.5 text-sky-600" />
                    <span>{tpl.garage}</span>
                  </div>
                </div>

                {/* Button */}
                <motion.button
                  onClick={() => onSelectTemplate(tpl)}
                  {...buttonTapScale}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Load into 3D Visualizer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}
