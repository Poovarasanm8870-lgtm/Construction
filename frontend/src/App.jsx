import React, { useState } from 'react';
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

  const handleOpenRoomLayout = (project) => {
    setSelectedModalProject(project);
    setIsRoomModalOpen(true);
  };

  const handleSelectServiceForQuote = (service) => {
    setChatInitialPrompt(`Can you give me a detailed cost and timeline breakdown for ${service.title}?`);
    setActiveTab('chat');
  };

  const handleSelectBlueprintForQuote = (blueprint) => {
    setChatInitialPrompt(`I am interested in the ${blueprint.title} (${blueprint.sqft} sq ft). What is the total budget and material quantity list?`);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Header Navbar */}
      <Navbar
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHiddenAdmin={() => setIsHiddenAdminOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 w-full mx-auto">
        
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-12 pb-16">
            <HeroHome
              onExploreServices={() => setActiveTab('services')}
              onExploreBlueprints={() => setActiveTab('blueprints')}
              onOpenChat={() => setActiveTab('chat')}
            />

            <ServicesSwiper onSelectService={handleSelectServiceForQuote} />

            <HouseBlueprints onInquireBlueprint={handleSelectBlueprintForQuote} />

            <PortfolioSwiper onSelectProjectForLayout={handleOpenRoomLayout} />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200/80">
                  Instant Structural Advisor
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Groq AI Construction Advisor</h2>
                <p className="text-slate-600 text-sm mt-1">Get precise Indian civil estimates, material counts & labor rates</p>
              </div>
              <AIAdvisorChat initialPrompt={chatInitialPrompt} onSiteVisitBooked={() => setIsChatOpen(true)} />
            </div>
          </motion.div>
        )}

        {/* TAB 2: 5 CORE SERVICES */}
        {activeTab === 'services' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="py-8">
            <ServicesSwiper onSelectService={handleSelectServiceForQuote} />
          </motion.div>
        )}

        {/* TAB 3: HOUSE BLUEPRINTS */}
        {activeTab === 'blueprints' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="py-8">
            <HouseBlueprints onInquireBlueprint={handleSelectBlueprintForQuote} />
          </motion.div>
        )}

        {/* TAB 4: PORTFOLIO SHOWCASE */}
        {activeTab === 'portfolio' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="py-8">
            <PortfolioSwiper onSelectProjectForLayout={handleOpenRoomLayout} />
          </motion.div>
        )}

        {/* TAB 5: AI ADVISOR CHAT */}
        {activeTab === 'chat' && (
          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                AI Construction Assistant
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">ConstructAI Smart Advisor</h2>
              <p className="text-slate-600 text-sm mt-1">Ask any building query or click a quick suggestion chip below</p>
            </div>
            <AIAdvisorChat initialPrompt={chatInitialPrompt} onSiteVisitBooked={() => setIsChatOpen(true)} />
          </motion.div>
        )}

      </main>

      {/* Groq AI Chatbot Drawer Widget */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentConfig={{ sqft: 1500, floors: 2, region: 'Mumbai MMR' }}
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ConstructAI Pro • Turn-Key Construction & Architectural Excellence</p>
          <button
            onClick={() => setIsHiddenAdminOpen(true)}
            className="text-slate-400 hover:text-slate-600 text-[11px] underline"
          >
            Staff Portal Access
          </button>
        </div>
      </footer>
    </div>
  );
}
