import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { 
  Building2, 
  Wrench, 
  Zap, 
  Palette, 
  Home, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ServicesSwiper({ onSelectService }) {
  const [viewMode, setViewMode] = useState('slider'); // 'slider' or 'grid'

  const services = [
    {
      id: 1,
      title: "Full-Scale Construction",
      tagline: "Turn-Key Residential & Commercial Build",
      startingPrice: "₹ 1,750 / sq ft",
      icon: Building2,
      badge: "Most Popular",
      description: "Complete building solutions from ground excavation to RCC framing, brickwork, waterproofing, and final occupancy certificate.",
      features: [
        "Tata Tiscon Steel & UltraTech Cement",
        "Soil Excavation & Foundation RCC",
        "10-Year Structural Guarantee",
        "Dedicated Resident Civil Engineer"
      ]
    },
    {
      id: 2,
      title: "Professional Plumbing",
      tagline: "Concealed Piping & Water Systems",
      startingPrice: "₹ 180 / sq ft",
      icon: Wrench,
      badge: "High Precision",
      description: "Advanced hydro-tested water supply lines, CPVC/UPVC piping, sewer drainage systems, pressure pumps, and luxury bath fixtures.",
      features: [
        "Jaquar & Kohler Fixture Fitting",
        "Terrace Overhead Tank Piping",
        "Zero-Leakage Pressure Testing",
        "Concealed Wall Mixer Valves"
      ]
    },
    {
      id: 3,
      title: "Electrical & Wiring",
      tagline: "Code-Compliant Safe Power Systems",
      startingPrice: "₹ 160 / sq ft",
      icon: Zap,
      badge: "Safety Certified",
      description: "Heavy-duty copper wiring, distribution panels, modular switches, ambient false ceiling lighting, and EV charger point prep.",
      features: [
        "Polycab Flame-Retardant Copper Wires",
        "Schneider / Havells Modular Switches",
        "Three-Phase Main Panel Setup",
        "Inverter & Solar Grid Hookup"
      ]
    },
    {
      id: 4,
      title: "Interior Design & Finishing",
      tagline: "Modular Kitchens & Luxury Flooring",
      startingPrice: "₹ 850 / sq ft",
      icon: Palette,
      badge: "Premium Aesthetics",
      description: "Transform space with Italian marble flooring, factory-made acrylic modular kitchens, wardrobe carpentry, and Asian Paints Royale finish.",
      features: [
        "Italian Bottochino & Marble Fitting",
        "Hafele / Hettich Soft-Close Hardware",
        "Gypsum Board False Ceiling Lighting",
        "Custom Wardrobes & TV Units"
      ]
    },
    {
      id: 5,
      title: "Roofing & Structural Renovation",
      tagline: "Terrace Waterproofing & Retrofitting",
      startingPrice: "₹ 650 / sq ft",
      icon: Home,
      badge: "Long Life Seal",
      description: "Complete roof slab waterproofing, structural retrofitting, wall expansion repair, and modern glass facade elevation upgrades.",
      features: [
        "Dr. Fixit Polymer Roof Coating",
        "Micro-Concrete Beam Reinforcement",
        "Structural Wall Removal Support",
        "Terrace Heat Insulation Tiles"
      ]
    }
  ];

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-12 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Turnkey Expertise</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our 5 Core Construction Services
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-xl">
              End-to-end engineering, plumbing, wiring, and finishing delivered with certified standards and fixed pricing.
            </p>
          </div>


        </div>

        {/* Content Display: Slider vs Grid */}
        {viewMode === 'slider' ? (
          <div className="relative group">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              pagination={{ clickable: true, el: '.swiper-services-pagination' }}
              navigation={{
                nextEl: '.swiper-services-next',
                prevEl: '.swiper-services-prev',
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="pb-12"
            >
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <SwiperSlide key={service.id}>
                    <ServiceCard service={service} IconComponent={IconComponent} onSelectService={onSelectService} />
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Custom Navigation */}
            <div className="flex items-center justify-between mt-4">
              <div className="swiper-services-pagination flex gap-2"></div>
              <div className="flex gap-2">
                <button className="swiper-services-prev p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="swiper-services-next p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <ServiceCard key={service.id} service={service} IconComponent={IconComponent} onSelectService={onSelectService} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service, IconComponent, onSelectService }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={springTransition}
      className="h-full bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-6 group"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-900 text-amber-400 shadow-md">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-bold">
            {service.badge}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {service.title}
        </h3>
        <p className="text-xs font-semibold text-amber-800 mt-0.5 mb-3">
          {service.tagline}
        </p>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Feature List */}
        <div className="space-y-2 pt-2 border-t border-slate-200/60">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Included Standards
          </div>
          {service.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="pt-4 border-t border-slate-200/60 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-semibold text-slate-500">Starting Rate:</span>
          <span className="text-lg font-extrabold text-slate-900 font-mono">{service.startingPrice}</span>
        </div>

        <motion.button
          whileTap={bouncyTap}
          onClick={() => onSelectService && onSelectService(service)}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>Inquire & Request Quote</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </motion.button>
      </div>
    </motion.div>
  );
}
