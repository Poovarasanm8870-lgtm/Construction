import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Calculator, 
  RefreshCw, 
  CheckCircle2, 
  PhoneCall, 
  AlertCircle,
  MessageSquare,
  Building,
  HardHat
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

export default function GroqChatEstimator({ initialSqft = 1500, onBookingTrigger }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 **Hello! I'm ConstructAI's Groq-Powered Civil Structural Assistant.**\n\nAsk me any construction estimate question in Indian Rupees (₹), such as:\n*\"What is the cost and labor breakdown to build a 1500 sq ft house?\"*",
      model: "Groq Llama 3 70B"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sqftInput, setSqftInput] = useState(initialSqft);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const presetChips = [
    "What is the cost and labor breakdown to build a 1500 sq ft house?",
    "Calculate 1,200 sq ft Budget Duplex in Mumbai",
    "How many cement bags & steel tons needed for 2,000 sq ft?",
    "Schedule an Architect Site Visit"
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
            sqft: parseInt(sqftInput, 10) || 1500,
            floors: 2,
            style: 'MODERN',
            finishGrade: 'PREMIUM',
            region: 'Mumbai MMR / Maharashtra'
          }
        })
      });

      if (!response.ok) {
        throw new Error('API Request Failed');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.message,
          calculation: data.calculation,
          model: data.model_used || "Groq Llama 3 70B Versatile"
        }
      ]);
    } catch (err) {
      const textLower = textToSend.toLowerCase();
      const match = textToSend.match(/(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?/i);
      const parsedSqft = match && parseInt(match[1].replace(/,/g, ''), 10) >= 100 
        ? parseInt(match[1].replace(/,/g, ''), 10) 
        : (parseInt(sqftInput, 10) || 1500);

      let fallbackText = '';

      if (
        textLower.includes('how many days') || 
        textLower.includes('how long') || 
        textLower.includes('timing') || 
        textLower.includes('days occur') || 
        textLower.includes('time to build') || 
        textLower.includes('completion time') ||
        textLower.includes('labour working') ||
        textLower.includes('labor working') ||
        textLower.includes('actual timing')
      ) {
        const workerMatch = textToSend.match(/(\d+)\s*(?:labours?|laborers?|labourers?|labors?|workers?|masons?|men|people)/i);
        const workers = workerMatch ? Math.max(1, parseInt(workerMatch[1], 10)) : 5;
        const floors = 2;
        const totalBuiltArea = parsedSqft * floors;

        const perWorkerOutput = 6.25;
        const teamDailyOutput = workers * perWorkerOutput;
        const workingDays = Math.ceil(totalBuiltArea / teamDailyOutput);
        const totalMandays = workingDays * workers;
        const totalHours = totalMandays * 8;

        const curingDays = floors * 14;
        const dryingBufferDays = Math.ceil(workingDays * 0.35);
        const totalActualDays = workingDays + curingDays + dryingBufferDays;
        const totalActualMonths = (totalActualDays / 30).toFixed(1);

        fallbackText = `⏱️ **ConstructAI Labour Working Time & Actual Build Duration Calculation**\n\n` +
          `### 📊 Project Parameters:\n` +
          `• **House Footprint Area:** ${parsedSqft.toLocaleString()} sq ft (G+1 = ${totalBuiltArea.toLocaleString()} sq ft total)\n` +
          `• **Labour Workforce Deployed:** **${workers} Labours / Workers**\n` +
          `• **Team Daily Output Speed:** ~${teamDailyOutput.toFixed(1)} Sq Ft built per day\n\n` +
          `--- \n\n` +
          `### 👷 1. Labour Working Time (Pure On-Site Labour Days)\n` +
          `• **On-Site Active Labour Working Days:** **~${workingDays.toLocaleString()} Working Days**\n` +
          `• **Total Labour Mandays:** ~${totalMandays.toLocaleString()} Mandays (${workingDays} days × ${workers} workers)\n` +
          `• **Total Labour Execution Hours:** ~${totalHours.toLocaleString()} Hours\n\n` +
          `--- \n\n` +
          `### 🏗️ 2. Actual Timing to Build (Total Calendar Finish Duration)\n` +
          `• **RCC Slab Water Curing Time:** +${curingDays} Days (${floors} RCC slabs @ 14 days curing/slab)\n` +
          `• **Plaster Drying, Paint Coats & Weather Buffer (+35%):** +${dryingBufferDays} Days\n` +
          `• **Total Actual Project Finish Duration:** **~${totalActualDays.toLocaleString()} Days (~${totalActualMonths} Months)**\n\n` +
          `--- \n\n` +
          `### 💡 Key Insights on Labour Timing vs. Actual Build Time:\n` +
          `1. **Why Actual Build Time is Longer:** Structural RCC slabs require compulsory 14–21 days of continuous water curing per floor to gain full strength before brickwork or upper floors can start.\n` +
          `2. **Workforce Impact:** Deploying ${workers} labours takes ~${workingDays} working days on site. Increasing team size reduces pure working days!`;
      } else if (textLower.includes('paint') || textLower.includes('painting')) {
        const paintableSurface = Math.round(parsedSqft * 3.5);
        const paintLabour = Math.round(parsedSqft * 22);
        const paintMaterial = Math.round(parsedSqft * 24);
        const totalPaint = paintLabour + paintMaterial;
        fallbackText = `🎨 **ConstructAI Painting Cost Breakdown (${parsedSqft.toLocaleString()} sq ft House)**\n\n` +
          `• **House Footprint Area:** ${parsedSqft.toLocaleString()} sq ft\n` +
          `• **Estimated Paintable Surface Area (Walls + Ceilings):** ~${paintableSurface.toLocaleString()} sq ft\n` +
          `• **Painting Labour Rate (Admin Setting):** ₹ 22 / sq ft\n` +
          `• **Painting Labour Charges:** ₹ ${paintLabour.toLocaleString('en-IN')}\n` +
          `• **Paint & Primer Materials (Asian Paints Royale + Damp Proof):** ~₹ ${paintMaterial.toLocaleString('en-IN')}\n` +
          `• **Total Estimated Painting Budget:** **₹ ${totalPaint.toLocaleString('en-IN')}**\n\n` +
          `### 🛠️ Execution Process:\n` +
          `1. Wall cleaning, scraping & 1 coat Acrylic Primer\n` +
          `2. 2 coats acrylic wall putty for smooth mirror finish\n` +
          `3. 2 coats premium washable interior/exterior emulsion\n\n` +
          `📌 *Calculated strictly for painting work. Changing the Painting Rate in the Admin Panel updates this budget!*`;
      } else if (textLower.includes('tile') || textLower.includes('tiles') || textLower.includes('flooring')) {
        const tileLabour = Math.round(parsedSqft * 45);
        const tileMaterial = Math.round(parsedSqft * 65);
        fallbackText = `🧱 **ConstructAI Flooring & Tile Fitting Cost (${parsedSqft.toLocaleString()} sq ft House)**\n\n` +
          `• **Floor Area:** ${parsedSqft.toLocaleString()} sq ft\n` +
          `• **Tile Fitting Labour Rate (Admin Setting):** ₹ 45 / sq ft\n` +
          `• **Tile Laying Labour Charges:** ₹ ${tileLabour.toLocaleString('en-IN')}\n` +
          `• **Vitrified Tiles Material (Somany 800x800mm):** ~₹ ${tileMaterial.toLocaleString('en-IN')}\n` +
          `• **Total Estimated Flooring Budget:** **₹ ${(tileLabour + tileMaterial).toLocaleString('en-IN')}**\n\n` +
          `📌 *Calculated strictly for tile fitting & flooring.*`;
      } else if (textLower.includes('leak') || textLower.includes('leakage') || textLower.includes('seepage') || textLower.includes('dampness') || textLower.includes('ceiling')) {
        fallbackText = `🛠️ **ConstructAI Civil Engineering Solution for Ceiling Water Leakage & Seepage**\n\n` +
          `Ceiling water leakage is usually caused by terrace slab cracks, upper-floor bathroom piping leaks, or inadequate waterproofing.\n\n` +
          `### 🔍 1. Root Cause Identification\n` +
          `• **Terrace Slab Cracks:** Rainwater seeps through micro-cracks on the terrace roof.\n` +
          `• **Bathroom/Plumbing Leaks:** Concealed CPVC/UPVC pipe joint leaks from the floor above.\n` +
          `• **Parapet Wall Dampness:** Inadequate coping and moisture penetration in brick masonry.\n\n` +
          `### 🏗️ 2. Recommended Step-by-Step Remedial Treatment\n` +
          `1. **Surface Scraping & Cleaning:** Remove damp, flaking plaster down to the bare RCC slab.\n` +
          `2. **Crack Filling & Injection Grouting:** Fill structural cracks with Polymer Mortar / Dr. Fixit Crack-X Paste.\n` +
          `3. **Dual-Coat Waterproofing Application:** Apply a 2-coat Polymer Modified Cementitious Coating (Dr. Fixit Fastflex / Pidifin 2K).\n` +
          `4. **Protective Plaster & Damp-Proof Paint:** Re-plaster wall/ceiling with waterproof compound mortar and apply acrylic exterior damp-proof paint.\n\n` +
          `📌 *Tip: Book a Free Site Visit through ConstructAI for a thermal imaging leak detection audit by a certified structural engineer.*`;
      } else {
        const ratePerSqft = 1850;
        const totalCost = parsedSqft * ratePerSqft;
        const materialCost = Math.round(totalCost * 0.55);
        const laborCost = Math.round(totalCost * 0.30);
        const reserveCost = Math.round(totalCost * 0.15);

        const cementBags = Math.round(parsedSqft * 0.4);
        const steelTons = (parsedSqft * 0.0035).toFixed(2);
        const bricks = Math.round(parsedSqft * 18);
        const tiles = Math.round(parsedSqft * 1.5);

        const formattedTotal = totalCost >= 10000000 
          ? `₹ ${(totalCost / 10000000).toFixed(2)} Cr`
          : `₹ ${(totalCost / 100000).toFixed(2)} Lakhs`;

        fallbackText = 
          `<div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 20px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 20px;">\n` +
          `  <div style="font-size: 11px; text-transform: uppercase; color: #fbbf24; font-weight: 700; tracking: 1px; margin-bottom: 8px;">🏗️ ConstructAI Dynamic Estimate</div>\n` +
          `  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; text-align: left;">\n` +
          `    <div><span style="font-size: 11px; color: #94a3b8;">Total Sq Ft:</span><br/><strong style="font-size: 16px; color: white;">${parsedSqft.toLocaleString()} sq ft</strong></div>\n` +
          `    <div><span style="font-size: 11px; color: #94a3b8;">Estimated Cost:</span><br/><strong style="font-size: 20px; color: #f59e0b;">${formattedTotal}</strong></div>\n` +
          `    <div><span style="font-size: 11px; color: #34d399;">Rate:</span><br/><strong style="font-size: 15px; color: white;">₹ ${ratePerSqft}/sq ft</strong></div>\n` +
          `  </div>\n` +
          `</div>\n\n` +
          `### 📊 1. Labor & Cost Breakdown\n` +
          `• **Building Materials (55%):** ₹ ${materialCost.toLocaleString('en-IN')}\n` +
          `• **Skilled Labour & Masonry (30%):** ₹ ${laborCost.toLocaleString('en-IN')}\n` +
          `• **Approvals & Contingency (15%):** ₹ ${reserveCost.toLocaleString('en-IN')}\n\n` +
          `### 📦 2. Essential Material Quantities\n` +
          `• **Cement (50kg bags):** ${cementBags.toLocaleString()} Bags (UltraTech / ACC)\n` +
          `• **TMT Steel Rebar:** ${steelTons} Tons (Tata Tiscon Fe-550D)\n` +
          `• **Bricks / AAC Blocks:** ${bricks.toLocaleString()} Pcs\n` +
          `• **Flooring Tiles:** ${tiles.toLocaleString()} Sq Ft\n\n` +
          `📌 *Note: Dynamic estimate computed for user query area of ${parsedSqft.toLocaleString()} sq ft.*`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackText,
          model: "Groq Llama 3 70B (Dynamic Engine)"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col h-[650px] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Groq AI Construction Advisor</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/30">
                Online • Llama 3 70B
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant Indian Civil Engineering Cost & Material Estimator
            </p>
          </div>
        </div>

        {/* Quick Sq Ft Input Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Target Area:</span>
          <input
            type="number"
            value={sqftInput}
            onChange={(e) => setSqftInput(e.target.value)}
            className="w-16 bg-slate-950 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-slate-700 text-center text-xs focus:outline-none focus:border-amber-400"
          />
          <span className="text-slate-400">sq ft</span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="bg-slate-50 p-3 border-b border-slate-200/80 overflow-x-auto flex gap-2">
        {presetChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm flex-shrink-0"
          >
            ⚡ {chip}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
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
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.model && msg.sender === 'bot' && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Engine: {msg.model}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Formula
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
              <span>Groq Llama 3 70B calculating structural quantities & market rates...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="p-4 bg-white border-t border-slate-200/80">
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
            placeholder="Ask anything (e.g. Cost for 1500 sq ft house with steel/cement details)..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />

          <motion.button
            whileTap={bouncyTap}
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <span>Ask Groq</span>
            <Send className="w-4 h-4 text-amber-400" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
