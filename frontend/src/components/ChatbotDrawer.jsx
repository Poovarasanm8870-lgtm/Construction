import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Zap, CheckCircle2, RefreshCw, ExternalLink, Globe, AlertCircle, HardHat, Building2, Layers, ShieldCheck } from 'lucide-react';
import { drawerSlide } from '../utils/animations';
import { CHAT_API_URL } from '../config/api';

const MAIN_SUGGESTED_CHIPS = [
  { label: "🏠 Build a House", query: "I want to build a house" },
  { label: "🔩 What is Fe500?", query: "What is Fe500?" },
  { label: "⚖️ Fe500 vs Fe550", query: "What is the difference between Fe500 and Fe550?" },
  { label: "🧱 Cement Types", query: "What are the different types of cement used in construction?" },
  { label: "🏗️ TMT Steel", query: "What is TMT steel?" },
  { label: "💰 Construction Cost", query: "What is the approximate cost of building a house?" }
];

function formatINR(amount) {
  if (amount == null) return "₹ 0";
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} Lakhs`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

// 1. Cement Selection Cards Widget
function CementSelectionView({ options, onSelect }) {
  const [selectedBrand, setSelectedBrand] = useState(null);
  if (!options || options.length === 0) return null;

  return (
    <div className="mt-3.5 space-y-2.5">
      <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 px-1">
        <span>🧱 Choose Preferred Cement Brand:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt, idx) => {
          const isSelected = selectedBrand === opt.brand;
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl bg-white border transition-all duration-200 shadow-xs flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? 'border-2 border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              <div>
                <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                  <span>{opt.brand}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{opt.grade}</span>
                </div>
                <div className="text-sm font-black text-amber-600 mt-1">
                  ₹ {opt.price} <span className="text-[10px] text-slate-500 font-normal">/ {opt.unit}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{opt.description}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand(opt.brand);
                  onSelect(opt.brand);
                }}
                className={`w-full mt-2 py-1.5 px-2 rounded-xl font-bold text-xs transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400'
                }`}
              >
                {isSelected ? `✓ Selected ${opt.brand}` : `Select ${opt.brand}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. Steel Selection Cards Widget
function SteelSelectionView({ options, onSelect }) {
  const [selectedBrand, setSelectedBrand] = useState(null);
  if (!options || options.length === 0) return null;

  return (
    <div className="mt-3.5 space-y-2.5">
      <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 px-1">
        <span>🔩 Choose Preferred Steel / TMT Rebar Brand:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt, idx) => {
          const isSelected = selectedBrand === opt.brand;
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl bg-white border transition-all duration-200 shadow-xs flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? 'border-2 border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              <div>
                <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                  <span>{opt.brand}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">{opt.grade}</span>
                </div>
                <div className="text-sm font-black text-amber-600 mt-1">
                  ₹ {opt.price?.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {opt.unit}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{opt.description}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand(opt.brand);
                  onSelect(opt.brand);
                }}
                className={`w-full mt-2 py-1.5 px-2 rounded-xl font-bold text-xs transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400'
                }`}
              >
                {isSelected ? `✓ Selected ${opt.brand}` : `Select ${opt.brand}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3. Workforce Selection Widget
function WorkforceSelectionView({ options = [4, 6, 8, 10], labourConfig, onSelect }) {
  const [selectedNum, setSelectedNum] = useState(null);

  return (
    <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-900 text-white border border-amber-500/40 space-y-3 shadow-md">
      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
        <HardHat size={14} /> Plan Site Workforce Count
      </div>

      <div className="text-[11px] text-slate-300">
        Admin Daily Wages: Head Mason ₹{labourConfig?.head_mason_daily_wage || 950}/day, Helper ₹{labourConfig?.helper_daily_wage || 650}/day
      </div>

      <div className="flex gap-2">
        {options.map((num) => {
          const isSelected = selectedNum === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => {
                setSelectedNum(num);
                onSelect(num.toString());
              }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all text-center cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md scale-105'
                  : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-100 border-slate-700 hover:border-amber-400'
              }`}
            >
              👷 {isSelected ? `✓ ${num}` : num} Workers
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 4. Construction Package Cards (Economy | Standard | Premium)
function ConstructionEstimateCard({ project, packages, onSelectPackage }) {
  if (!packages || packages.length === 0) return null;

  return (
    <div className="mt-3.5 space-y-3">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-800 gap-2">
        <span className="flex items-center gap-1">📐 <strong>Area:</strong> {project?.sqft?.toLocaleString()} sq ft</span>
        <span className="flex items-center gap-1">📍 <strong>Location:</strong> {project?.location}</span>
        {project?.workforce_count && (
          <span className="flex items-center gap-1">👷 <strong>Workforce:</strong> {project.workforce_count} workers</span>
        )}
      </div>

      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
        Three Package Options:
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {packages.map((pkg) => {
          const isStandard = pkg.id === 'standard';
          return (
            <div
              key={pkg.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative shadow-sm hover:-translate-y-1 hover:shadow-md ${
                isStandard
                  ? 'bg-slate-900 text-white border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
              }`}
            >
              {isStandard && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-xl">
                  Popular
                </div>
              )}

              <div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mb-1.5 ${
                  isStandard ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {pkg.name}
                </span>

                <div className="my-1.5">
                  <div className={`text-base font-extrabold ${isStandard ? 'text-amber-400' : 'text-slate-900'}`}>
                    {formatINR(pkg.total_cost)}
                  </div>
                  <div className={`text-[10px] font-mono ${isStandard ? 'text-slate-400' : 'text-slate-500'}`}>
                    ₹ {pkg.cost_per_sqft?.toLocaleString()} / sq ft
                  </div>
                </div>

                <div className={`text-[10px] space-y-1 my-2.5 pt-2 border-t ${isStandard ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                  <div>💰 Labour: {formatINR(pkg.labour_cost)}</div>
                  <div>📦 Materials: {formatINR(pkg.material_cost)}</div>
                  <div>🧱 {pkg.cement_type}</div>
                  <div>🔩 {pkg.steel_type}</div>
                  <div>✨ {pkg.flooring_level}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPackage(`Select ${pkg.name}`)}
                className={`w-full mt-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                  isStandard
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                }`}
              >
                Select {pkg.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 5. Package Confirmation Component
function PackageConfirmationCard({ selectedPackage, project, onConfirm, onChangePackage }) {
  if (!selectedPackage) return null;

  return (
    <div className="mt-3.5 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-100 space-y-3 shadow-lg">
      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider border-b border-emerald-800/60 pb-2">
        <CheckCircle2 size={16} /> Package Summary Confirmation
      </div>

      <div className="text-xs space-y-1.5">
        <div>📍 <strong>Location:</strong> {project?.location}</div>
        <div>📐 <strong>Area:</strong> {project?.sqft?.toLocaleString()} sq ft</div>
        <div>📦 <strong>Selected Package:</strong> <span className="font-extrabold text-amber-400">{selectedPackage.name}</span></div>
        <div>💵 <strong>Total Estimated Cost:</strong> <span className="font-extrabold text-white text-sm">{formatINR(selectedPackage.total_cost)}</span></div>
        <div>👷 <strong>Labour Cost:</strong> {formatINR(selectedPackage.labour_cost)}</div>
        <div>🧱 <strong>Material Cost:</strong> {formatINR(selectedPackage.material_cost)}</div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-800/60">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer text-center"
        >
          ✓ Confirm Package
        </button>
        <button
          type="button"
          onClick={() => onChangePackage("I want to build a house")}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
        >
          Change Selection
        </button>
      </div>
    </div>
  );
}

// 6. Source References Component
function SourceReferences({ sources, liveWebUsed }) {
  if (!sources || sources.length === 0) {
    if (liveWebUsed === false) {
      return (
        <div className="mt-2 text-[10px] text-slate-400 italic bg-slate-100 p-2 rounded-lg border border-slate-200">
          📌 Live web pricing was unavailable, so this estimate uses the configured database rates.
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        <Globe size={11} className="text-amber-600" /> Researched Web Sources:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.slice(0, 4).map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all line-clamp-1 max-w-[220px]"
            title={src.title}
          >
            <span className="truncate">{src.source || src.title}</span>
            <ExternalLink size={9} className="shrink-0 text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}

function renderFormattedMessage(content) {
  if (typeof content !== 'string') return content;

  const lines = content.split('\n');
  return lines.map((line, idx) => {
    let text = line.trim();
    if (!text) return <div key={idx} className="h-1.5" />;

    if (text.startsWith('### ')) {
      return <h4 key={idx} className="font-bold text-slate-900 text-xs sm:text-sm mt-3 mb-1 border-b border-slate-200 pb-0.5">{text.replace('### ', '')}</h4>;
    }
    if (text.startsWith('## ')) {
      return <h3 key={idx} className="font-extrabold text-slate-900 text-sm sm:text-base mt-3 mb-1">{text.replace('## ', '')}</h3>;
    }
    if (text.startsWith('• ') || text.startsWith('- ')) {
      return (
        <div key={idx} className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-700 my-0.5 pl-1 leading-relaxed">
          <span className="text-amber-600 font-bold font-mono text-xs">•</span>
          <span>{parseBold(text.substring(2))}</span>
        </div>
      );
    }

    return <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5">{parseBold(text)}</p>;
  });
}

function parseBold(str) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ChatbotDrawer({ isOpen, onClose, currentConfig, initialPrompt = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      type: 'text',
      message: '🏗️ **Hello! Welcome to ConstructAI.**\n\nI am your AI Construction & Civil Engineering Assistant. I can help with house cost estimation, material specifications, labour wages, structural engineering, and building guidance.\n\nHow can I help your construction project today?',
      suggestions: ["🏠 Build a House", "🔩 What is Fe500?", "⚖️ Fe500 vs Fe550", "🧱 Cement Types"]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query || !query.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', type: 'text', message: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: query,
          config: currentConfig || {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          type: data.type || 'text',
          message: data.message || '',
          project: data.project,
          options: data.options,
          packages: data.packages,
          selected_package: data.selected_package,
          labour_wages_config: data.labour_wages_config,
          sources: data.sources,
          suggestions: data.suggestions || [],
          live_web_pricing_used: data.live_web_pricing_used,
          is_confirmed: data.is_confirmed
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        console.error(`Chatbot API HTTP Error: status=${response.status}, url=${CHAT_API_URL}`);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            type: 'text',
            message: `⚠️ Connection error (HTTP ${response.status}). Please ensure Django backend is running at ${CHAT_API_URL}.`
          }
        ]);
      }
    } catch (err) {
      console.error('Chatbot API Network Exception:', err);
      console.error('Target API URL:', CHAT_API_URL);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          type: 'text',
          message: `⚠️ Network connection issue. Server could not be reached at ${CHAT_API_URL}.`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-[998] cursor-pointer"
          />

          <motion.div
            variants={drawerSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] lg:w-[600px] bg-white shadow-2xl z-[999] flex flex-col border-l border-slate-200 selection:bg-amber-400"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  🏗️
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    ConstructAI Assistant
                  </h3>
                  <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Civil Engineering & Real Research Engine
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Permanent Main Suggested Chips Bar */}
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none">
              {MAIN_SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="text-[10px] font-bold px-3 py-1 rounded-full bg-white hover:bg-amber-400 hover:text-slate-950 text-slate-800 border border-slate-300 transition-all whitespace-nowrap cursor-pointer shadow-2xs hover:shadow-xs hover:border-amber-400"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Feed Container (Independent Scrolling Area) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                      🏗️
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl shadow-xs text-xs sm:text-sm transition-all ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-xs'
                        : msg.type === 'off_topic'
                        ? 'bg-amber-50 border border-amber-300 text-slate-900 rounded-tl-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div>{renderFormattedMessage(msg.message)}</div>

                    {/* Step 1: Cement Selection */}
                    {msg.type === 'cement_selection' && (
                      <CementSelectionView
                        options={msg.options}
                        onSelect={(brand) => handleSendMessage(brand)}
                      />
                    )}

                    {/* Step 2: Steel Selection */}
                    {msg.type === 'steel_selection' && (
                      <SteelSelectionView
                        options={msg.options}
                        onSelect={(brand) => handleSendMessage(brand)}
                      />
                    )}

                    {/* Step 3: Workforce Selection */}
                    {msg.type === 'workforce_selection' && (
                      <WorkforceSelectionView
                        options={msg.options}
                        labourConfig={msg.labour_wages_config}
                        onSelect={(num) => handleSendMessage(num)}
                      />
                    )}

                    {/* Step 4: Package Cards */}
                    {(msg.type === 'package_selection' || msg.type === 'estimate') && msg.packages && (
                      <ConstructionEstimateCard
                        project={msg.project}
                        packages={msg.packages}
                        onSelectPackage={(pkgQuery) => handleSendMessage(pkgQuery)}
                      />
                    )}

                    {/* Step 5: Confirmation Card */}
                    {msg.type === 'confirmation' && msg.selected_package && (
                      <PackageConfirmationCard
                        selectedPackage={msg.selected_package}
                        project={msg.project}
                        onConfirm={() => handleSendMessage('Confirm Package')}
                        onChangePackage={() => handleSendMessage('I want to build a house')}
                      />
                    )}

                    {/* Step 6: Start New Estimate Action Button for Confirmed Estimate */}
                    {msg.is_confirmed && (
                      <div className="mt-3.5 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSendMessage('I want to build a house')}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-lg"
                        >
                          <span>🏠 Start New Estimate</span>
                        </button>
                      </div>
                    )}

                    {/* Sources Display */}
                    {msg.sources && (
                      <SourceReferences sources={msg.sources} liveWebUsed={msg.live_web_pricing_used} />
                    )}

                    {/* Context-Aware Follow-Up Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendMessage(sug)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-400 hover:text-slate-950 text-slate-800 border border-amber-300/60 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-center text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <RefreshCw size={13} className="animate-spin text-amber-500" />
                  <span>ConstructAI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Container (Fixed at Bottom) */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about construction, materials, labour, or house cost..."
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatbotDrawer;
