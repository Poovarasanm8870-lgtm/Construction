import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import HeroHome from './components/HeroHome';
import ServicesSwiper from './components/ServicesSwiper';
import HouseBlueprints from './components/HouseBlueprints';
import PortfolioSwiper from './components/PortfolioSwiper';
import AIAdvisorChat from './components/AIAdvisorChat';
import HiddenAdminView from './components/HiddenAdminView';
import RoomLayoutModal from './components/RoomLayoutModal';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { staggerContainer, fadeInUp } from './utils/animations';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedModalProject, setSelectedModalProject] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isHiddenAdminOpen, setIsHiddenAdminOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');

  // Dynamic Scroll Spy: Updates navbar active tab based on scroll position
  useEffect(() => {
    const sections = ['home', 'services', 'blueprints', 'portfolio'];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'chat') {
      setIsChatOpen(true);
      return;
    }
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenRoomLayout = (project) => {
    setSelectedModalProject(project);
    setIsRoomModalOpen(true);
  };

  const handleSelectServiceForQuote = (service) => {
    setChatInitialPrompt(`Can you give me a detailed cost and timeline breakdown for ${service.title}?`);
    setIsChatOpen(true);
  };

  const handleSelectBlueprintForQuote = (blueprint) => {
    setChatInitialPrompt(`I am interested in the ${blueprint.title} (${blueprint.sqft} sq ft). What is the total budget and material quantity list?`);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Header Navbar */}
      <Navbar
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        setActiveTab={handleTabClick}
        onOpenHiddenAdmin={() => setIsHiddenAdminOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 w-full mx-auto space-y-8 pb-16">
        
        {/* SECTION 1: HOME */}
        <section id="home" className="scroll-mt-16">
          <HeroHome
            onExploreServices={() => handleTabClick('services')}
            onExploreBlueprints={() => handleTabClick('blueprints')}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </section>

        {/* SECTION 2: 5 CORE SERVICES */}
        <section id="services" className="scroll-mt-16 pt-2 pb-6">
          <ServicesSwiper onSelectService={handleSelectServiceForQuote} />
        </section>

        {/* SECTION 3: HOUSE BLUEPRINTS */}
        <section id="blueprints" className="scroll-mt-16 pt-2 pb-6">
          <HouseBlueprints onInquireBlueprint={handleSelectBlueprintForQuote} />
        </section>

        {/* SECTION 4: PORTFOLIO SHOWCASE */}
        <section id="portfolio" className="scroll-mt-16 pt-2 pb-6">
          <PortfolioSwiper onSelectProjectForLayout={handleOpenRoomLayout} />
        </section>

      </main>

      {/* Groq AI Chatbot Drawer Widget */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentConfig={{ sqft: 1500, floors: 2, region: 'Mumbai MMR' }}
        initialPrompt={chatInitialPrompt}
      />

      {/* Room Layout Inspector Modal */}
      <RoomLayoutModal
        project={selectedModalProject}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />

      {/* Hidden Staff Management Analytics Portal */}
      <HiddenAdminView
        isOpen={isHiddenAdminOpen}
        onClose={() => setIsHiddenAdminOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p>
            <span
              onClick={() => setIsHiddenAdminOpen(true)}
              className="cursor-pointer hover:text-slate-900 transition-colors select-none font-bold text-slate-400 p-1"
              title="Staff Portal Access"
            >
              ©
            </span>
            {' '}2026 ConstructAI Pro • Turn-Key Construction & Architectural Excellence
          </p>
        </div>
      </footer>
    </div>
  );
}
