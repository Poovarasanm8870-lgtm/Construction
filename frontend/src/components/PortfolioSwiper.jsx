import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { 
  Building2, 
  MapPin, 
  Ruler, 
  Calendar, 
  IndianRupee, 
  Sparkles, 
  Eye, 
  Layers, 
  ArrowRight, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function PortfolioSwiper({ onSelectProjectForLayout }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeImageToggle, setActiveImageToggle] = useState({});

  const projects = [
    {
      id: 1,
      title: "Aura Horizon Glass Villa",
      category: "LUXURY",
      categoryLabel: "Luxury Villa",
      location: "Juhu, Mumbai",
      sqft: 3400,
      bhk: "4 BHK Duplex",
      duration: "9 Months",
      completedYear: 2026,
      budget: "₹ 1.25 Cr",
      ratePerSqft: "₹ 3,675/sq ft",
      beforeImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      description: "Floor-to-ceiling thermal glass curtain walls, cantilever terrace patio, and automated climate control.",
      highlights: ["Tata Tiscon Steel Rebar", "Italian Bottochino Marble", "Solar Glass Elevation", "Vastu Compliant"],
      layouts: [
        { name: "Grand Living Foyer", sqft: 680, dimensions: "28 ft x 24 ft", level: "Ground Floor" },
        { name: "Master Suite & Jacuzzi", sqft: 480, dimensions: "22 ft x 21 ft", level: "First Floor" },
        { name: "Modular Island Kitchen", sqft: 310, dimensions: "18 ft x 17 ft", level: "Ground Floor" }
      ]
    },
    {
      id: 2,
      title: "Neo-Colonial Brick Estate",
      category: "HERITAGE",
      categoryLabel: "Heritage Build",
      location: "Gurgaon, Delhi NCR",
      sqft: 4200,
      bhk: "5 BHK Estate",
      duration: "11 Months",
      completedYear: 2026,
      budget: "₹ 1.65 Cr",
      ratePerSqft: "₹ 3,928/sq ft",
      beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      description: "Exposed Wire-Cut Clay Brickwork, classical slate hipped roof, double-height living foyer with brass detailing.",
      highlights: ["Exposed Brick Elevation", "Teak Wood Carpentry", "Earthquake Zone IV Compliant", "Rainwater Harvesting"],
      layouts: [
        { name: "Double-Height Foyer", sqft: 820, dimensions: "32 ft x 25 ft", level: "Ground Floor" },
        { name: "Executive Home Office", sqft: 320, dimensions: "18 ft x 17 ft", level: "First Floor" },
        { name: "Chef's Pantry Kitchen", sqft: 340, dimensions: "20 ft x 17 ft", level: "Ground Floor" }
      ]
    },
    {
      id: 3,
      title: "Monolith Eco-Cube Residence",
      category: "MODERN",
      categoryLabel: "Modern Eco-Build",
      location: "Indiranagar, Bengaluru",
      sqft: 1800,
      bhk: "3 BHK Compact",
      duration: "6 Months",
      completedYear: 2025,
      budget: "₹ 52.0 Lakhs",
      ratePerSqft: "₹ 2,888/sq ft",
      beforeImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      description: "Board-formed architectural concrete, passive solar ventilation, low carbon footprint AAC block masonry.",
      highlights: ["OPC 53 Grade Cement", "Terrace Roof Garden", "UPVC Acoustic Glazing", "10-Year Water Seal"],
      layouts: [
        { name: "Zen Open Living Hall", sqft: 450, dimensions: "22 ft x 20 ft", level: "Ground Floor" },
        { name: "Balcony Sunroom Suite", sqft: 310, dimensions: "17 ft x 18 ft", level: "First Floor" }
      ]
    },
    {
      id: 4,
      title: "Vanguard Minimalist Triplex",
      category: "LUXURY",
      categoryLabel: "Luxury Triplex",
      location: "Banjara Hills, Hyderabad",
      sqft: 5100,
      bhk: "6 BHK Mansion",
      duration: "14 Months",
      completedYear: 2026,
      budget: "₹ 2.15 Cr",
      ratePerSqft: "₹ 4,215/sq ft",
      beforeImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      description: "Infinity rooftop pool, private hydraulic elevator, seamless Italian marble flooring across three levels.",
      highlights: ["Hydraulic Elevator", "Rooftop Swimming Pool", "Smart Home Automation", "UltraTech Concrete"],
      layouts: [
        { name: "Penthouse Sky Lounge", sqft: 950, dimensions: "38 ft x 25 ft", level: "Second Floor" },
        { name: "Master Suite & Spa", sqft: 620, dimensions: "28 ft x 22 ft", level: "First Floor" }
      ]
    }
  ];

  const categories = [
    { id: 'ALL', label: 'All Projects' },
    { id: 'LUXURY', label: 'Luxury Villas' },
    { id: 'HERITAGE', label: 'Heritage & Brick' },
    { id: 'MODERN', label: 'Eco Modern' }
  ];

  const filteredProjects = activeCategory === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const toggleImage = (id) => {
    setActiveImageToggle(prev => ({
      ...prev,
      [id]: prev[id] === 'before' ? 'after' : 'before'
    }));
  };

  return (
    <div className="w-full bg-slate-50 py-16 px-4 sm:px-6 lg:px-12 border-t border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Architectural Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Signature Built Projects
            </h2>
            <p className="text-slate-600 text-base mt-2 max-w-2xl">
              Explore turn-key civil engineering marvels delivered with precision, Vastu compliance, and premium structural integrity across India.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm backdrop-blur-md">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Swiper Slider */}
        <div className="relative group">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={28}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1280: { slidesPerView: 2 }
            }}
            pagination={{ clickable: true, el: '.swiper-custom-pagination' }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            className="pb-14"
          >
            {filteredProjects.map((project) => {
              const currentToggle = activeImageToggle[project.id] || 'after';
              const displayImage = currentToggle === 'before' ? project.beforeImage : project.afterImage;

              return (
                <SwiperSlide key={project.id}>
                  <motion.div 
                    whileHover={{ y: -4 }}
                    transition={springTransition}
                    className="h-full bg-white/90 rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Image Header with Transformation Toggle */}
                    <div className="relative h-72 sm:h-80 w-full bg-slate-900 overflow-hidden group/img cursor-pointer">
                      <motion.img 
                        key={displayImage}
                        initial={{ scale: 1.05, opacity: 0.9 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={springTransition}
                        src={displayImage} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110"
                      />
                      
                      {/* Glossy Reflection Sweep on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/img:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent z-10" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold tracking-wide shadow-sm">
                          {project.categoryLabel}
                        </span>
                        
                        <motion.button
                          whileTap={bouncyTap}
                          whileHover={{ scale: 1.05 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImage(project.id);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-slate-900 transition-colors flex items-center gap-1.5 shadow-md"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View {currentToggle === 'before' ? 'After Build' : 'Before Site'}</span>
                        </motion.button>
                      </div>

                      {/* Bottom Info Bar over Image */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mb-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{project.location}</span>
                          <span>•</span>
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          <span>Delivered {project.completedYear}</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                          {project.title}
                        </h3>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {project.description}
                      </p>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Built-Up Area</div>
                          <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{project.sqft.toLocaleString()} sq ft</div>
                        </div>
                        <div className="border-x border-slate-200/60">
                          <div className="text-xs text-slate-500 font-medium">Total Cost</div>
                          <div className="text-sm sm:text-base font-bold text-amber-700 mt-0.5">{project.budget}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Build Time</div>
                          <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{project.duration}</div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Civil & Structural Highlights
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {project.highlights.map((h, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-medium"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Button for Room Layout Modal */}
                      <motion.button
                        whileTap={bouncyTap}
                        onClick={() => onSelectProjectForLayout && onSelectProjectForLayout(project)}
                        className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>View Interactive Room Layouts & 2D Plans</span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="swiper-custom-pagination flex gap-2"></div>
            <div className="flex gap-2">
              <button className="swiper-button-prev-custom p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="swiper-button-next-custom p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
