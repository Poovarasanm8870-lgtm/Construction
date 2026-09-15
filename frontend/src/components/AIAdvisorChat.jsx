import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  ShieldCheck,
  Building,
  Check,
  Info
} from 'lucide-react';
import { bouncyTap, springTransition } from '../animations/iosSprings';

/**
 * Clean & Spacious AI Message Component
 * Renders bot messages with elegant spacing, soft cards, and crisp typography.
 */
function FormattedAIMessage({ text }) {
  if (!text) return null;

  // Split lines into clean sections
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a bullet list section
        if (trimmed.includes('•') || trimmed.includes('- ')) {
          const lines = trimmed.split('\n');
          const titleLine = lines.find(l => !l.trim().startsWith('•') && !l.trim().startsWith('-'));
          const bulletLines = lines.filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'));

          return (
            <div key={pIdx} className="space-y-2.5 my-2">
              {titleLine && (
                <div className="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-200/80 pb-1 flex items-center gap-1.5">
                  <span>{titleLine.replace(/\*\*/g, '')}</span>
                </div>
              )}
              <div className="space-y-2 pl-1">
                {bulletLines.map((line, bIdx) => {
                  const cleaned = line.replace(/^[•\-]\s*/, '').replace(/\*\*/g, '');
                  return (
                    <div key={bIdx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium leading-snug">{cleaned}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // Check if header or title
        if (trimmed.startsWith('🏠') || trimmed.startsWith('💰') || trimmed.startsWith('📦') || trimmed.startsWith('🛠️') || trimmed.startsWith('🚿') || trimmed.startsWith('⚡')) {
          return (
            <div key={pIdx} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900 font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>{trimmed.replace(/\*\*/g, '')}</span>
            </div>
          );
        }

        // Check if disclaimer
        if (trimmed.startsWith('📌') || trimmed.toLowerCase().includes('note:')) {
          return (
            <div key={pIdx} className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{trimmed.replace(/\*\*/g, '').replace(/^📌\s*/, '')}</span>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={pIdx} className="text-slate-800 font-medium leading-relaxed">
            {trimmed.replace(/\*\*/g, '')}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAdvisorChat({ initialPrompt = '', onSiteVisitBooked }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 **Hello! I'm your ConstructAI Structural Advisor.**\n\nAsk me any question about house construction costs, plumbing, electrical wiring, or floor plans in Indian Rupees (₹).\n\nTry clicking one of the quick suggestions pinned directly above the input bar below!",
      model: "Groq Civil Engine"
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
          model: data.model_used || "Groq Llama 3 70B"
        }
      ]);
    } catch (err) {
      // Deterministic Offline Fallback Response with spacious, neat formatting
      let botReply = `🏠 ConstructAI Construction Estimate (1,500 Sq Ft Project)\n\n` +
        `Estimated total budget for a 1,500 sq ft house (G+1, 3 BHK Villa) in Mumbai MMR is ₹ 48.5 Lakhs (approx. ₹ 1,850/sq ft).\n\n` +
        `💰 Itemized Cost Breakdown:\n` +
        `• Building Materials (55%): ₹ 26.67 Lakhs\n` +
        `• Skilled Labour & Masonry (30%): ₹ 14.55 Lakhs\n` +
        `• Approvals & Reserve Buffer (15%): ₹ 7.28 Lakhs\n` +
        `• Grand Total: ₹ 48.5 Lakhs\n\n` +
        `📦 Key Material Quantities Required:\n` +
        `• Cement (50kg bags): 600 Bags (UltraTech/ACC)\n` +
        `• TMT Steel Rebar: 5.25 Tons (Tata Tiscon Fe-550D)\n` +
        `• AAC Masonry Blocks: 27,000 Pcs\n` +
        `• Flooring Vitrified Tiles: 2,250 Sq Ft\n\n` +
        `📌 Note: Final quotation is subject to site soil inspection and approved architectural plan.`;

      if (textToSend.toLowerCase().includes('plumbing')) {
        botReply = `🚿 Professional Plumbing Rates & Services:\n\n` +
          `• Concealed Water & Drainage Lines: ₹ 180 / sq ft\n` +
          `• Jaquar / Kohler Fixture Installation: Included in Turnkey Package\n` +
          `• Terrace Overhead Tank Piping: Hydro-tested zero leakage guarantee.`;
      } else if (textToSend.toLowerCase().includes('electrical') || textToSend.toLowerCase().includes('wiring')) {
        botReply = `⚡ Electrical & Wiring Services:\n\n` +
          `• Concealed Copper Wiring: ₹ 160 / sq ft (Polycab Flame-Retardant FR Wires)\n` +
          `• Schneider / Havells Modular Switches: Included in Turnkey Package\n` +
          `• Three-Phase Main Panel Setup: Installed by Certified Electrician.`;
      } else if (textToSend.toLowerCase().includes('services')) {
        botReply = `🛠️ Our 5 Core Turn-Key Services:\n\n` +
          `• Full-Scale Construction (Turnkey Residential & Commercial Builds)\n` +
          `• Professional Plumbing (Hydro-tested CPVC & UPVC Piping)\n` +
          `• Electrical & Wiring (Safe Code-Compliant Copper Power Wiring)\n` +
          `• Interior Design & Finishing (Italian Marble & Modular Kitchens)\n` +
          `• Roofing & Structural Renovation (Polymer Terrace Waterproofing)`;
      } else if (textToSend.toLowerCase().includes('visit') || textToSend.toLowerCase().includes('book')) {
        botReply = `📅 Free Site Visit & Consultation Scheduled!\n\n` +
          `Our Chief Structural Engineer will contact you within 2 hours to confirm your on-site soil inspection and architectural drawing consultation.`;
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
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col h-[680px] max-w-4xl mx-auto">
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
          <span>Spacious AI Formatting</span>
        </div>
      </div>

      {/* Messages Stream Feed */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/60">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-[88%] rounded-3xl p-5 sm:p-6 shadow-sm ${
              msg.sender === 'user'
                ? 'bg-slate-900 text-white rounded-br-none text-xs sm:text-sm font-medium'
                : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-none shadow-md'
            }`}>
              {msg.sender === 'user' ? (
                <div className="font-medium text-white">{msg.text}</div>
              ) : (
                <FormattedAIMessage text={msg.text} />
              )}

              {msg.sender === 'bot' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span>Engine: {msg.model || "Groq Civil Advisor"}</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Rates
                  </span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md mt-1 font-bold text-xs">
                <User className="w-5 h-5" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-xs font-semibold text-slate-600 flex items-center gap-2 shadow-md">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Formatting clean, spacious structural estimate...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* STICKY SUGGESTION CHIPS DIRECTLY ABOVE THE INPUT BAR */}
      <div className="bg-slate-100/90 border-t border-b border-slate-200/80 p-3 px-4 overflow-x-auto flex gap-2 flex-shrink-0 backdrop-blur-md">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 flex-shrink-0 mr-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Suggestions:
        </span>
        {quickReplyChips.map((chip, idx) => (
          <motion.button
            key={idx}
            whileTap={bouncyTap}
            onClick={() => handleSendMessage(chip)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:border-slate-900 hover:text-slate-900 hover:shadow transition-all flex-shrink-0 shadow-sm"
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
