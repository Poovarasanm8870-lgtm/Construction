import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Zap } from 'lucide-react';
import { drawerSlide } from '../utils/animations';

const QUICK_PROMPTS = [
  "How much for brick masonry for a 2000 sq ft house in Mumbai?",
  "Estimate 3500 sq ft 4 BHK Villa in Delhi NCR with Luxury finish",
  "How many cement bags and steel tons needed for 2500 sq ft?",
  "Calculate skilled mason and electrical labor rate in Bangalore",
];

export function EstimatorChat({ isOpen, onClose, messages, onSendMessage, isConnected, isTyping }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickClick = (promptText) => {
    onSendMessage(promptText);
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
          />

          <motion.div
            variants={drawerSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 p-[1px]">
                  <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span>ConstructAI Smart Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-500">Live Indian Construction Cost Engine</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
              <div className="space-y-2 pb-2">
                <span className="text-[10px] font-semibold uppercase text-amber-700 tracking-wider flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Popular Estimation Queries</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickClick(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-[11px] text-slate-700 transition-all text-left shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-amber-700" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-white font-semibold rounded-tr-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2 shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.message}</div>
                    <div className={`text-[9px] font-mono text-right ${msg.sender === 'user' ? 'text-amber-100' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex space-x-3 items-center">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-amber-700 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl text-xs text-slate-500 flex items-center space-x-1 shadow-2xs">
                    <span>Calculating Indian market rates & materials...</span>
                    <span className="w-1 h-1 bg-amber-600 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-200 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask e.g. 'Cost for 2500 sq ft home in Mumbai in Rupees'..."
                  className="w-full glass-input rounded-2xl pl-4 pr-12 py-3 text-xs text-slate-900 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
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
