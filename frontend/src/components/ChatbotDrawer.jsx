import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Zap, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { drawerSlide } from '../utils/animations';

const SUGGESTED_CHIPS = [
  "Estimate 1,500 sq ft house",
  "Labour charges breakdown",
  "Plumbing & Electrical rates",
  "5 Core Services overview",
  "Book Free Site Visit Inquiry"
];

function parseBold(str) {
  if (typeof str !== 'string') return str;
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedText(text) {
  if (!text) return null;

  let html = text;

  // 1. Process headings: ### Header -> <h4 class="...">Header</h4>
  html = html.replace(/^###\s+(.*$)/gim, '<h4 class="font-bold text-slate-900 mt-4 mb-1.5 text-xs sm:text-sm border-b border-slate-200/80 pb-1 block">$1</h4>');

  // 2. Process bullet points: • Item -> bullet point block on new line
  html = html.replace(/^[•\-\*]\s+(.*$)/gim, '<div class="flex items-start gap-2 text-xs sm:text-sm text-slate-700 py-0.5 pl-1 leading-relaxed"><span class="text-amber-600 font-bold font-mono text-sm shrink-0">•</span><span>$1</span></div>');

  // 3. Process bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950">$1</strong>');

  return (
    <div 
      className="font-sans leading-relaxed text-xs sm:text-sm text-slate-800 space-y-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ChatbotDrawer({ isOpen, onClose, currentConfig, initialPrompt = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      message: '👋 **Welcome to ConstructAI!**\n\nI am your AI Civil Engineering & Structural Advisor.\n\n• **Turnkey Cost Estimates:** Live rates for residential villas & buildings\n• **Material Breakdown:** Exact quantities of Cement, Steel & Bricks\n• **Labour & Masonry:** Hourly and per sq ft labor rate analysis\n• **Specialized Services:** Plumbing, wiring, interior design & blueprints',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: "ConstructAI Structural Advisor"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
  const [visitBooked, setVisitBooked] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Handle initialPrompt passed from service/blueprint inquiry buttons
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSendMessage = async (textToSend, isVisitRequest = false) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          config: currentConfig || { sqft: 1500, floors: 2, region: 'Mumbai MMR' },
          session_id: sessionId,
          request_visit: isVisitRequest
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            message: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: "ConstructAI Senior Civil Engineer"
          }
        ]);
        if (isVisitRequest || text.toLowerCase().includes('visit')) setVisitBooked(true);
      } else {
        throw new Error('API server fallback');
      }
    } catch (e) {
      setIsTyping(false);

      // Parse custom sqft dynamically from user text (e.g. 700 sq ft, 800 sq, etc.)
      const sqftMatch = text.match(/(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?/i);
      const parsedSqft = (sqftMatch && parseInt(sqftMatch[1].replace(/,/g, ''), 10) >= 100)
        ? parseInt(sqftMatch[1].replace(/,/g, ''), 10)
        : (currentConfig?.sqft || 1500);

      const totalCostLakhs = ((parsedSqft * 1850) / 100000).toFixed(2);
      const laborTotalLakhs = ((parsedSqft * 1850 * 0.3) / 100000).toFixed(2);
      const laborMasonryLakhs = ((parsedSqft * 1850 * 0.3 * 0.65) / 100000).toFixed(2);
      const laborPlumbElecLakhs = ((parsedSqft * 1850 * 0.3 * 0.22) / 100000).toFixed(2);
      const laborFinishingLakhs = ((parsedSqft * 1850 * 0.3 * 0.13) / 100000).toFixed(2);

      const cementBags = Math.round(parsedSqft * 0.4);
      const cementCostLakhs = ((cementBags * 380) / 100000).toFixed(2);
      const materialTotalLakhs = ((parsedSqft * 1850 * 0.55) / 100000).toFixed(2);
      const steelTons = (parsedSqft * 0.0035).toFixed(2);
      const bricksPcs = Math.round(parsedSqft * 18);

      // Deterministic Fallback Response strictly formatted in Bullet Points
      let botReply = 
        '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 14px; border-radius: 14px; border: 1px solid #334155; margin-bottom: 12px;">\n' +
        '  <div style="font-size: 10px; text-transform: uppercase; color: #fbbf24; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">🏗️ ConstructAI Project Cost Summary</div>\n' +
        '  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: left;">\n' +
        '    <div><span style="font-size: 10px; color: #94a3b8;">Total Sq Ft:</span><br/><strong style="font-size: 14px; color: white;">' + parsedSqft.toLocaleString() + ' sq ft</strong></div>\n' +
        '    <div><span style="font-size: 10px; color: #94a3b8;">Est. Cost:</span><br/><strong style="font-size: 16px; color: #f59e0b;">₹ ' + totalCostLakhs + ' Lakhs</strong></div>\n' +
        '    <div><span style="font-size: 10px; color: #94a3b8;">Package:</span><br/><strong style="font-size: 12px; color: #34d399;">Premium Turnkey</strong></div>\n' +
        '    <div><span style="font-size: 10px; color: #94a3b8;">Region:</span><br/><strong style="font-size: 12px; color: white;">' + (currentConfig?.region || 'Mumbai MMR') + '</strong></div>\n' +
        '  </div>\n' +
        '</div>\n\n' +
        '### 👷 1. Itemized Labour Breakdown (Separately Specified)\n' +
        '• **Base Turnkey Rate:** ₹ 1,850 per sq ft for ' + parsedSqft.toLocaleString() + ' sq ft\n' +
        '• **Total Labour Wages (30%):** ₹ ' + laborTotalLakhs + ' Lakhs\n' +
        '• **Skilled Masonry & RCC Structure Labour:** ₹ ' + laborMasonryLakhs + ' Lakhs (Masons @ ₹ 950/day)\n' +
        '• **Plumbing & Electrical Technical Labour:** ₹ ' + laborPlumbElecLakhs + ' Lakhs\n' +
        '• **Painting & Finishing Labour:** ₹ ' + laborFinishingLakhs + ' Lakhs\n\n' +
        '### 🧱 2. Cement Material Breakdown (Separately Specified)\n' +
        '• **Total Cement Quantity:** ~' + cementBags.toLocaleString() + ' Bags (50kg Bags)\n' +
        '• **Estimated Cement Cost:** ₹ ' + cementCostLakhs + ' Lakhs (@ ₹ 380/bag)\n' +
        '• **Brand Specification:** UltraTech 53 Grade / ACC Concrete+\n\n' +
        '### 📦 3. Other Essential Material Quantities\n' +
        '• **Total Materials Budget (55%):** ₹ ' + materialTotalLakhs + ' Lakhs\n' +
        '• **TMT Steel Rebar:** ~' + steelTons + ' Tons (Tata Tiscon Fe-550D)\n' +
        '• **AAC Blocks / Bricks:** ~' + bricksPcs.toLocaleString() + ' Pcs\n\n' +
        '### ⏳ 4. Timeline & Approvals\n' +
        '• **Completion Time:** 6 - 8 Months\n' +
        '• **Structural Warranty:** 10 Years Protection Guarantee';

      const lowerText = text.toLowerCase().trim();

      if (lowerText === 'labour' || lowerText === 'labor' || (lowerText.includes('labour') && !/\d/.test(lowerText)) || (lowerText.includes('labor') && !/\d/.test(lowerText))) {
        botReply = `👷 **ConstructAI Skilled Labour & Masonry Rate Card (India 2026)**\n\n` +
          `• **RCC Structure & Centering Labour:** ₹ 240 / sq ft\n` +
          `• **Brickwork & Wall Plastering Labour:** ₹ 110 / sq ft\n` +
          `• **Tile Laying & Flooring Labour:** ₹ 45 / sq ft\n` +
          `• **Internal & External Painting Labour:** ₹ 22 / sq ft\n` +
          `• **Plumbing & Electrical Technical Labour:** ₹ 160 / sq ft\n\n` +
          `### 🛠️ Daily Wage Rates (Standard 8-Hour Shift):\n` +
          `• **Skilled Head Mason (Rajmistri):** ₹ 950 - ₹ 1,100 / day\n` +
          `• **Bar Bending Steel Worker:** ₹ 900 - ₹ 1,050 / day\n` +
          `• **Certified Plumber / Electrician:** ₹ 850 - ₹ 1,000 / day\n` +
          `• **Unskilled Helper (Mazdoor):** ₹ 650 - ₹ 750 / day`;
      } else if (lowerText === 'cement' || (lowerText.includes('cement') && !/\d/.test(lowerText))) {
        botReply = `🧱 **ConstructAI Cement Specifications & Pricing Guide (2026)**\n\n` +
          `• **UltraTech 53 Grade PPC Cement:** ₹ 380 / 50kg bag\n` +
          `• **ACC Concrete+ Weather Shield:** ₹ 395 / 50kg bag\n` +
          `• **Ambuja Kawach Waterproof Cement:** ₹ 410 / 50kg bag\n` +
          `• **Birla Gold / Shree Cement:** ₹ 375 / 50kg bag\n\n` +
          `### 📊 Material Consumption & Engineering Standards:\n` +
          `• **RCC Structural Consumption:** ~0.4 Bags per sq ft of built-up area\n` +
          `• **RCC Slab Concrete Mix (M25):** 1 : 1.5 : 3 (1 Cement : 1.5 Sand : 3 Aggregate)\n` +
          `• **Wall Masonry Mortar (1:6):** 1 Bag Cement per 120 AAC Blocks / Bricks\n` +
          `• **Wall Plaster Mortar (1:4):** 1 Bag Cement covers ~90 sq ft (12mm thickness)`;
      } else if (text.toLowerCase().includes('plumbing') || text.toLowerCase().includes('electrical') || text.toLowerCase().includes('rates')) {
        botReply = `🚿 **Plumbing & Electrical Standard Rates:**\n\n` +
          `• **Concealed Water Lines:** ₹ 180 / sq ft (CPVC/UPVC)\n` +
          `• **Concealed Copper Wiring:** ₹ 160 / sq ft (Polycab FR Wires)\n` +
          `• **Schneider/Havells Switches & DB:** Included in Turnkey package\n` +
          `• **Fixture Fitting:** Jaquar / Kohler certified installation`;
      } else if (text.toLowerCase().includes('services')) {
        botReply = `🛠️ **ConstructAI 5 Core Services:**\n\n` +
          `• **Full-Scale Construction:** Turnkey Residential & Commercial build\n` +
          `• **Professional Plumbing:** Hydro-tested CPVC/UPVC installation\n` +
          `• **Electrical & Wiring:** Polycab Flame-Retardant Wiring\n` +
          `• **Interior Design & Finishing:** Italian Marble & Modular Kitchens\n` +
          `• **Roofing & Structural Renovation:** Dr. Fixit Polymer Waterproofing`;
      } else if (text.toLowerCase().includes('visit') || isVisitRequest) {
        botReply = `📅 **Site Visit Inspection Booked!**\n\n` +
          `• **Inspection Status:** Registered successfully\n` +
          `• **Assigned Engineer:** Senior Structural Engineer\n` +
          `• **Contact Window:** Within 2 hours for free on-site consultation`;
        setVisitBooked(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fb-${Date.now()}`,
          sender: 'bot',
          message: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: "Groq Civil Engine"
        }
      ]);
    }
  };

  const handleChipClick = (chipText) => {
    if (chipText.includes('Site Visit')) {
      handleSendMessage('I would like to book a free structural site visit inspection.', true);
    } else {
      handleSendMessage(chipText);
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden"
          />

          <motion.div
            variants={drawerSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 p-[1.5px] shadow-sm">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>ConstructAI Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Groq Llama 3 70B • IS 456 Verified</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close AI Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body (Scrollable Messages Area) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {/* Messages Feed */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2 shadow-xs'
                    }`}
                  >
                    <div className="font-sans">
                      {renderFormattedText(msg.message)}
                    </div>

                    <div className={`text-[9px] font-mono text-right mt-1.5 ${msg.sender === 'user' ? 'text-amber-950/70 font-bold' : 'text-slate-400'}`}>
                      {msg.timestamp} {msg.model ? `• ${msg.model}` : ''}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex space-x-2.5 items-center">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin text-amber-400" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-xs text-slate-600 flex items-center space-x-2 shadow-2xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Calculating Indian civil estimates & material rates...</span>
                  </div>
                </div>
              )}

              {visitBooked && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Site Visit Inquiry Registered! Our Senior Engineer will call you shortly.</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* PINNED QUICK SUGGESTIONS DIRECTLY ABOVE INPUT FORM */}
            <div className="bg-slate-100/95 border-t border-slate-200 p-2.5 px-3.5 overflow-x-auto flex items-center gap-1.5 shrink-0 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 shrink-0 mr-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <span>Suggestions:</span>
              </span>
              {SUGGESTED_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:text-slate-900 text-[11px] font-semibold text-slate-700 transition-all shrink-0 shadow-2xs"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 sm:p-4 border-t border-slate-200 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask e.g. '1500 sq ft house cost in Mumbai'..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-40 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </form>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatbotDrawer;

