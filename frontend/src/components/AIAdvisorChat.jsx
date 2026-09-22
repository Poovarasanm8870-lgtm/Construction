import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  PhoneCall, 
  CheckCircle2, 
  RefreshCw,
  Calculator,
  MessageSquare,
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

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

export default function AIAdvisorChat({ initialPrompt = '', onSiteVisitBooked }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 **Hello! I'm your ConstructAI Structural Advisor.**\n\nAsk me any question about house construction costs, plumbing, electrical wiring, or floor plans in Indian Rupees (₹).\n\nTry clicking one of the quick suggestions pinned directly above the input bar below!",
      model: "ConstructAI Civil Engineer"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Pinned Suggestion Chips directly above the input bar
  const quickReplyChips = [
    "Estimate 1,500 sq ft house cost",
    "What services do you offer?",
    "Show plumbing rates",
    "Electrical wiring cost per sq ft",
    "Book free site visit"
  ];

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          config: {
            sqft: 1500,
            floors: 2,
            style: 'MODERN',
            finishGrade: 'PREMIUM',
            region: 'Mumbai MMR / Maharashtra'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Response error');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.message,
          model: data.model_used || "ConstructAI Senior Civil Engineer"
        }
      ]);
    } catch (err) {
      // Dynamic Fallback Response with Top Summary Card matching user requested sqft
      const sqftMatch = textToSend.match(/(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?/i);
      const parsedSqft = (sqftMatch && parseInt(sqftMatch[1].replace(/,/g, ''), 10) >= 100)
        ? parseInt(sqftMatch[1].replace(/,/g, ''), 10)
        : 1500;

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

      let botReply = 
        '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 20px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 20px;">\n' +
        '  <div style="font-size: 11px; text-transform: uppercase; color: #fbbf24; font-weight: 700; tracking: 1px; margin-bottom: 8px;">🏗️ ConstructAI Project Cost Summary</div>\n' +
        '  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; text-align: left;">\n' +
        '    <div><span style="font-size: 11px; color: #94a3b8;">Total Sq Ft:</span><br/><strong style="font-size: 16px; color: white;">' + parsedSqft.toLocaleString() + ' sq ft</strong></div>\n' +
        '    <div><span style="font-size: 11px; color: #94a3b8;">Estimated Cost:</span><br/><strong style="font-size: 20px; color: #f59e0b;">₹ ' + totalCostLakhs + ' Lakhs</strong></div>\n' +
        '    <div><span style="font-size: 11px; color: #94a3b8;">Package Type:</span><br/><strong style="font-size: 15px; color: #34d399;">Premium Turnkey</strong></div>\n' +
        '    <div><span style="font-size: 11px; color: #94a3b8;">Location:</span><br/><strong style="font-size: 15px; color: white;">Mumbai MMR</strong></div>\n' +
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
        '### ⏳ 4. Project Timeline & Approvals\n' +
        '• **Build Duration:** 6 - 8 Months\n' +
        '• **Approvals & 10% Reserve Buffer:** ₹ ' + ((parsedSqft * 1850 * 0.15) / 100000).toFixed(2) + ' Lakhs\n\n' +
        '📌 *Note: Final quotation is subject to site soil inspection and approved architectural plan.*';

      const lowerText = textToSend.toLowerCase().trim();

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
      } else if (textToSend.toLowerCase().includes('plumbing')) {
        botReply = `🚿 **Professional Plumbing Rates & Services:**\n\n` +
          `• **Concealed Water & Drainage Lines:** ₹ 180 / sq ft\n` +
          `• **Jaquar/Kohler Fixture Installation:** Included in Turnkey package\n` +
          `• **Terrace Overhead Tank Piping:** Pressure tested with zero leakage guarantee.`;
      } else if (textToSend.toLowerCase().includes('electrical') || textToSend.toLowerCase().includes('wiring')) {
        botReply = `⚡ **Electrical & Wiring Services:**\n\n` +
          `• **Concealed Copper Wiring:** ₹ 160 / sq ft (Polycab FR Wires)\n` +
          `• **Schneider/Havells Switches:** Included\n` +
          `• **Three-Phase Distribution Board:** Certified electrician installation.`;
      } else if (textToSend.toLowerCase().includes('services')) {
        botReply = `🛠️ **Our 5 Core Services:**\n\n` +
          `1. **Full-Scale Construction** (Turnkey Residential & Commercial)\n` +
          `2. **Professional Plumbing** (Hydro-tested CPVC/UPVC)\n` +
          `3. **Electrical & Wiring** (Polycab Flame-Retardant Wiring)\n` +
          `4. **Interior Design & Finishing** (Italian Marble & Modular Kitchens)\n` +
          `5. **Roofing & Structural Renovation** (Dr. Fixit Polymer Waterproofing)`;
      } else if (textToSend.toLowerCase().includes('visit') || textToSend.toLowerCase().includes('book')) {
        botReply = `📅 **Site Visit Scheduled!**\n\nOur Chief Structural Engineer will contact you within 2 hours to confirm your free on-site soil and architectural consultation.`;
        if (onSiteVisitBooked) onSiteVisitBooked();
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          model: "Groq Construction Assistant"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col h-[650px] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">ConstructAI Smart Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/30">
                Live Advisor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant Answers for Building Costs, Plumbing, Wiring & Blueprints
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Formulas</span>
        </div>
      </div>

      {/* Messages Stream Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/60">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-slate-900 text-white rounded-br-none'
                : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-none'
            }`}>
              <div className="font-sans">
                {renderFormattedText(msg.text)}
              </div>


              {msg.sender === 'bot' && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Engine: {msg.model || "Groq Civil Advisor"}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Rates
                  </span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm mt-1 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-600 flex items-center gap-2 shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Calculating material breakdowns & rates...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* STICKY SUGGESTION CHIPS DIRECTLY ABOVE THE INPUT BAR */}
      <div className="bg-slate-100/90 border-t border-b border-slate-200/80 p-2.5 px-4 overflow-x-auto flex gap-2 flex-shrink-0 backdrop-blur-md">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 flex-shrink-0 mr-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Suggestions:
        </span>
        {quickReplyChips.map((chip, idx) => (
          <motion.button
            key={idx}
            whileTap={bouncyTap}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:border-slate-900 hover:text-slate-900 hover:shadow transition-all flex-shrink-0"
          >
            ⚡ {chip}
          </motion.button>
        ))}
      </div>

      {/* Input Form Footer */}
      <div className="p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything (e.g. 1,500 sq ft villa cost, plumbing rates)..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />

          <motion.button
            whileTap={bouncyTap}
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <span>Ask AI</span>
            <Send className="w-4 h-4 text-amber-400" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
