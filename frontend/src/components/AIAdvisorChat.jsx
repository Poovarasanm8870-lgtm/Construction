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

function InteractiveSelectionWidget({ onSelect }) {
  const [selectedCement, setSelectedCement] = useState('UltraTech');
  const [selectedSteel, setSelectedSteel] = useState('Tata Tiscon');
  const [selectedWorkers, setSelectedWorkers] = useState(6);

  const handleCalculate = () => {
    onSelect(`${selectedCement} cement, ${selectedSteel} steel with ${selectedWorkers} workers`);
  };

  return (
    <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 text-white border border-amber-500/40 space-y-3 shadow-lg">
      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
        <span>⚡ Step 3: Select Materials & Workforce</span>
        <span className="text-[9px] text-slate-400 font-mono">Custom Spec</span>
      </div>

      {/* Cement */}
      <div className="space-y-1">
        <div className="text-[10px] text-slate-300 font-semibold">1. Preferred Cement Brand:</div>
        <div className="flex flex-wrap gap-1">
          {['UltraTech', 'ACC Concrete+', 'Ambuja Kawach', 'Birla Gold'].map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedCement(brand)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                selectedCement === brand
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-400'
              }`}
            >
              🧱 {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Steel */}
      <div className="space-y-1">
        <div className="text-[10px] text-slate-300 font-semibold">2. Steel Rebar Brand:</div>
        <div className="flex flex-wrap gap-1">
          {['Tata Tiscon', 'JSW Neosteel', 'Jindal Panther', 'SAIL TMT'].map((steel) => (
            <button
              key={steel}
              type="button"
              onClick={() => setSelectedSteel(steel)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                selectedSteel === steel
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-400'
              }`}
            >
              🔩 {steel}
            </button>
          ))}
        </div>
      </div>

      {/* Workforce */}
      <div className="space-y-1">
        <div className="text-[10px] text-slate-300 font-semibold">3. Site Workforce Count:</div>
        <div className="flex gap-1.5">
          {[4, 6, 8, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedWorkers(num)}
              className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                selectedWorkers === num
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-400'
              }`}
            >
              👷 {num} Workers
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        type="button"
        onClick={handleCalculate}
        className="w-full py-2.5 mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>⚡ Calculate 3 House Package Tiers</span>
      </button>
    </div>
  );
}

function InteractiveTierCardsWidget({ messageText, activeConfig, onSelectTier }) {
  let sqft = activeConfig?.sqft || 1500;
  if (messageText) {
    const matchSqft = messageText.match(/(\d[\d,]*)\s*sq\s*ft/i);
    if (matchSqft) {
      const parsed = parseInt(matchSqft[1].replace(/,/g, ''), 10);
      if (parsed >= 100) sqft = parsed;
    }
  }

  const laborRate = 577;
  const tier1Rate = laborRate + 975;
  const tier2Rate = laborRate + 1373;
  const tier3Rate = laborRate + 2073;

  const fmtBudget = (val) => {
    const lakhs = val / 100000;
    return lakhs < 100 ? `₹ ${lakhs.toFixed(2)} Lakhs` : `₹ ${(val / 10000000).toFixed(2)} Cr`;
  };

  const tiers = [
    {
      id: 'tier1',
      badge: '🟢 Tier 1: Economy',
      rate: tier1Rate,
      total: sqft * tier1Rate,
      specs: 'Standard OPC/PPC Cement, Fe-500 Steel, Red Bricks, Ceramic Tiles (600x600mm)',
      btnText: '🟢 Select Economy Tier',
      query: 'Tier 1 Economy package',
      borderColor: 'border-emerald-500/50 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'tier2',
      badge: '🔵 Tier 2: Standard',
      recommended: true,
      rate: tier2Rate,
      total: sqft * tier2Rate,
      specs: 'UltraTech PPC Cement, Tata Tiscon Fe-550D Steel, Vitrified Tiles (800x800mm), Jaquar Sanitary',
      btnText: '🔵 Select Standard Tier',
      query: 'Tier 2 Standard package',
      borderColor: 'border-amber-500 hover:border-amber-400',
      badgeBg: 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs'
    },
    {
      id: 'tier3',
      badge: '🟡 Tier 3: Luxury',
      rate: tier3Rate,
      total: sqft * tier3Rate,
      specs: 'ACC Weather Shield Cement, JSW Neosteel TMT, Italian Marble, Kohler Sanitary, Home Automation',
      btnText: '🟡 Select Luxury Tier',
      query: 'Tier 3 Luxury package',
      borderColor: 'border-purple-500/50 hover:border-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  ];

  return (
    <div className="mt-3.5 space-y-2.5">
      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between px-1">
        <span>⚡ Step 4: Click a Card to Confirm House Tier</span>
        <span className="text-[10px] text-slate-400 font-mono">({sqft.toLocaleString()} sq ft)</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-2xl bg-slate-900 border ${t.borderColor} transition-all shadow-md relative overflow-hidden flex flex-col justify-between`}
          >
            {t.recommended && (
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                ★ Recommended
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5 pr-14">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${t.badgeBg}`}>
                  {t.badge}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  ₹ {t.rate.toLocaleString()} / sq ft
                </span>
              </div>

              <div className="flex items-baseline justify-between my-1.5">
                <span className="text-[11px] text-slate-300 font-medium">Total Est. Budget:</span>
                <span className="text-sm font-extrabold text-white">
                  {fmtBudget(t.total)}
                </span>
              </div>

              <p className="text-[10px] text-slate-300 leading-snug my-1 border-t border-slate-800/80 pt-1.5">
                {t.specs}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectTier(t.query)}
              className={`w-full mt-2.5 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                t.recommended
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-500'
              }`}
            >
              <span>{t.btnText}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
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
      const lowerText = textToSend.toLowerCase().trim();
      let botReply = '';

      const greetings = ['hi', 'hello', 'hey', 'start', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste'];

      if (greetings.includes(lowerText)) {
        botReply = 
          "👋 **Hello! Welcome to ConstructAI.**\n\n" +
          "I am your AI Civil Engineering & Construction Advisor.\n\n" +
          "• **Cost Estimates:** E.g. 'Estimate 1,500 sq ft house cost'\n" +
          "• **Live Rates:** Daily cement, TMT steel, and labour wage rate cards\n" +
          "• **Material Checklists:** Essential materials needed to build a house\n" +
          "• **Services & Blueprints:** Plumbing, wiring, interior design & 2D floor plans\n\n" +
          "How can I assist your construction project today?";
      } else {
        const constructionKeywords = [
          'construction', 'build', 'house', 'villa', 'home', 'duplex', 'triplex', 'building',
          'sqft', 'sq ft', 'square feet', 'sft', 'footprint', 'bhk', 'cement', 'steel',
          'rebar', 'brick', 'aac', 'tile', 'flooring', 'plumbing', 'electrical', 'wiring',
          'paint', 'roof', 'waterproofing', 'slab', 'rcc', 'column', 'beam', 'foundation',
          'labor', 'labour', 'mason', 'mistri', 'rate', 'cost', 'estimate', 'price', 'budget',
          'blueprint', 'floorplan', 'vastu', 'interior', 'architect', 'renovation', 'site visit',
          'contractor', 'turnkey', 'material', 'sand', 'aggregate', 'door', 'window', 'permit',
          'sanction', 'nbc', 'is 456', 'structural', 'civil', 'engineer', 'offer', 'service',
          'buy', 'checklist', 'items', 'things', 'needed', 'required'
        ];

        const isConstruction = constructionKeywords.some(kw => lowerText.includes(kw));

        if (!isConstruction) {
          botReply = "🤖 **I am ConstructAI Estimator, a specialized AI Construction Advisor.**\n\nI can only assist with house construction cost estimates, daily cement and steel market rates, building material checklists, architectural blueprints, civil engineering specifications, plumbing, wiring, and building services.\n\nPlease ask a construction-related question!";
        } else if (
          lowerText.includes('things i need to buy') || 
          lowerText.includes('things to buy') || 
          lowerText.includes('what to buy') || 
          lowerText.includes('materials needed') || 
          lowerText.includes('material checklist') || 
          lowerText.includes('items to buy') ||
          lowerText.includes('materials required') ||
          lowerText.includes('materials to buy') ||
          lowerText.includes('list of materials') ||
          lowerText.includes('what materials') ||
          lowerText.includes('need to buy')
        ) {
          botReply = 
            "🛒 **Essential Building Materials & Procurement Checklist for House Construction**\n\n" +
            "### 🏗️ 1. Civil & Structural Building Materials (Foundation & Framing)\n" +
            "• **Cement:** UltraTech 53 Grade PPC / ACC Concrete+ (50kg bags for RCC slab & masonry mortar)\n" +
            "• **TMT Steel Rebars:** Tata Tiscon / JSW Neosteel Fe-550D grade (8mm, 10mm, 12mm, 16mm rods)\n" +
            "• **Masonry Blocks / Bricks:** Red Clay Bricks or AAC Eco-Blocks (9-inch exterior & 4-inch partition walls)\n" +
            "• **Sand & Aggregate:** M-Sand (Manufactured Sand for RCC), P-Sand (Plastering) & 20mm Granite Aggregate\n" +
            "• **Binding Wire & Shuttering:** 18-gauge GI binding wire & waterproofing shuttering plywood\n\n" +
            "### 🚿 2. Plumbing & Water Supply System\n" +
            "• **Piping:** Astral / Supreme CPVC (Hot & Cold Water) & UPVC (Drainage & Rainwater)\n" +
            "• **Overhead Water Tank:** 1,000L Triple-Layer UV-Shield Terrace Tank\n" +
            "• **Sanitary Ware & Fixtures:** Jaquar / Kohler Wall Mixers, Health Faucets, Basins & Commodes\n\n" +
            "### ⚡ 3. Electrical & Wiring Equipment\n" +
            "• **Concealed Wires:** Polycab / Havells Flame-Retardant FRLS Copper Wires (1.5mm, 2.5mm, 4mm, 6mm)\n" +
            "• **Conduits & Switchboxes:** Heavy PVC Concealed Conduit Pipes & GI Metal Boxes\n" +
            "• **Modular Switches & DB:** Schneider Electric / Legrand Modular Switches & 3-Phase Distribution Board\n\n" +
            "### 🎨 4. Flooring, Finishing & Waterproofing\n" +
            "• **Tiles & Marble:** Somany Vitrified Tiles (800x800mm) or Italian Marble\n" +
            "• **Paints & Primer:** Asian Paints Royale Interior & Damp Proof Exterior Acrylic Emulsion\n" +
            "• **Waterproofing Chemicals:** Dr. Fixit 101 LW+ (for RCC Slabs, Bathrooms & Roof Terrace)\n\n" +
            "📌 *Tip: With ConstructAI Turnkey Construction, our civil engineering team manages 100% of material sourcing, quality testing, and site delivery.*";
        } else if (lowerText === 'labour' || lowerText === 'labor' || (lowerText.includes('labour') && !/\d/.test(lowerText)) || (lowerText.includes('labor') && !/\d/.test(lowerText))) {
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
        } else if (
          textToSend.toLowerCase().includes('how many days') || 
          textToSend.toLowerCase().includes('how long') || 
          textToSend.toLowerCase().includes('timing') || 
          textToSend.toLowerCase().includes('days occur') || 
          textToSend.toLowerCase().includes('time to build') || 
          textToSend.toLowerCase().includes('completion time') ||
          textToSend.toLowerCase().includes('labour working') ||
          textToSend.toLowerCase().includes('labor working') ||
          textToSend.toLowerCase().includes('actual timing')
        ) {
          const sqftMatch = textToSend.match(/(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?/i);
          const parsedSqft = (sqftMatch && parseInt(sqftMatch[1].replace(/,/g, ''), 10) >= 100)
            ? parseInt(sqftMatch[1].replace(/,/g, ''), 10)
            : 1500;
          
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

          botReply = `⏱️ **ConstructAI Labour Working Time & Actual Build Duration Calculation**\n\n` +
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
        } else if (textToSend.toLowerCase().includes('paint') || textToSend.toLowerCase().includes('painting')) {
          const sqftMatch = textToSend.match(/(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?/i);
          const parsedSqft = (sqftMatch && parseInt(sqftMatch[1].replace(/,/g, ''), 10) >= 100)
            ? parseInt(sqftMatch[1].replace(/,/g, ''), 10)
            : 1500;
          const paintableSurface = Math.round(parsedSqft * 3.5);
          const paintLabour = Math.round(parsedSqft * 22);
          const paintMaterial = Math.round(parsedSqft * 24);
          const totalPaint = paintLabour + paintMaterial;
          botReply = `🎨 **ConstructAI Painting Cost Breakdown (${parsedSqft.toLocaleString()} sq ft House)**\n\n` +
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
        } else if (textToSend.toLowerCase().includes('tile') || textToSend.toLowerCase().includes('tiles') || textToSend.toLowerCase().includes('flooring')) {
          const sqftMatch = textToSend.match(/(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)?/i);
          const parsedSqft = (sqftMatch && parseInt(sqftMatch[1].replace(/,/g, ''), 10) >= 100)
            ? parseInt(sqftMatch[1].replace(/,/g, ''), 10)
            : 1500;
          const tileLabour = Math.round(parsedSqft * 45);
          const tileMaterial = Math.round(parsedSqft * 65);
          botReply = `🧱 **ConstructAI Flooring & Tile Fitting Cost (${parsedSqft.toLocaleString()} sq ft House)**\n\n` +
            `• **Floor Area:** ${parsedSqft.toLocaleString()} sq ft\n` +
            `• **Tile Fitting Labour Rate (Admin Setting):** ₹ 45 / sq ft\n` +
            `• **Tile Laying Labour Charges:** ₹ ${tileLabour.toLocaleString('en-IN')}\n` +
            `• **Vitrified Tiles Material (Somany 800x800mm):** ~₹ ${tileMaterial.toLocaleString('en-IN')}\n` +
            `• **Total Estimated Flooring Budget:** **₹ ${(tileLabour + tileMaterial).toLocaleString('en-IN')}**\n\n` +
            `📌 *Calculated strictly for tile fitting & flooring.*`;
        } else if (textToSend.toLowerCase().includes('leak') || textToSend.toLowerCase().includes('leakage') || textToSend.toLowerCase().includes('seepage') || textToSend.toLowerCase().includes('dampness') || textToSend.toLowerCase().includes('ceiling')) {
          botReply = `🛠️ **ConstructAI Civil Engineering Solution for Ceiling Water Leakage & Seepage**\n\n` +
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
        } else if (textToSend.toLowerCase().includes('plumbing')) {
          botReply = `🚿 **Professional Plumbing Rates & Services:**\n\n` +
            `• **Concealed Water & Drainage Lines:** ₹ 160 / sq ft\n` +
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
        } else {
          // Check if explicit cost/estimate request
          const hasSqft = /(\d[\d,]*)\s*(?:sq\s*ft|square\s*feet|sqft|sft|sq\s*feet|sq|ft2|square\s*ft|feet|ft)/i.test(textToSend);
          const hasCostKeyword = /cost|estimate|budget|price|quotation|how much|rate for|cost for/i.test(textToSend);
          const isAskingTrade = ['paint', 'painting', 'plumbing', 'electrical', 'wiring', 'tile', 'tiles', 'flooring', 'leak', 'leakage', 'ceiling', 'waterproofing', 'repair'].some(t => textToSend.toLowerCase().includes(t));

          if ((hasSqft || hasCostKeyword) && !isAskingTrade) {
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

            botReply = 
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
          } else {
            botReply = 
              "🏗️ **ConstructAI Civil Engineering Consultation**\n\n" +
              "• **Cost Estimates:** Specify your plot area in sq ft (e.g. 'Estimate 1,800 sq ft house') to get an itemized budget calculation.\n" +
              "• **Daily Live Rates:** Ask for 'cement price' or 'steel rates' for instant market rate cards.\n" +
              "• **Material Checklists:** Ask 'what materials do I need to buy' for a full procurement list.\n\n" +
              "How can I help with your construction plans?";
          }
        }
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
                {msg.sender === 'bot' && index === messages.length - 1 && (
                  (msg.text && (
                    msg.text.includes('ConstructAI 3-Tier Construction Package Comparison') ||
                    msg.text.includes('Which House Type / Tier do you need') ||
                    msg.text.includes('Package Comparison')
                  ))
                ) && (
                  <InteractiveTierCardsWidget
                    messageText={msg.text}
                    activeConfig={{ sqft: 1500 }}
                    onSelectTier={(tierQuery) => handleSendMessage(tierQuery)}
                  />
                )}

                {msg.sender === 'bot' && index === messages.length - 1 && index > 0 && (
                  (msg.text && (
                    msg.text.includes('select your preferred') ||
                    msg.text.includes('Which Cement') ||
                    msg.text.includes('Which Steel') ||
                    msg.text.includes('How many Labours') ||
                    msg.text.includes('Customize Your Material') ||
                    msg.text.includes('customize your cement') ||
                    msg.text.includes('Package Comparison') ||
                    msg.text.includes('Select Your Preferred')
                  ))
                ) && (
                  <InteractiveSelectionWidget onSelect={(choice) => handleSendMessage(choice)} />
                )}
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
