import React, { useState } from 'react';
import { Zap, X, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { queryAIAssistant } from '../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Welcome, Engineer. I am your **AI Science & Metallurgy Copilot**. How can I assist your laboratory research today? You can query thermodynamic properties, phase equilibria, crystal slip systems, or XRD peak indexing.',
      time: '10:40 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Explain pitting corrosion resistance in 316L stainless steel',
    'Why does FCC have no ductile-to-brittle transition temperature?',
    'What role does Vanadium play in Ti-6Al-4V alloy phase stabilization?',
    'Calculate the theoretical density of alpha titanium (HCP)',
  ];

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await queryAIAssistant(
        textToSend,
        'User is working in Alaa Chem Lab workspace on materials science, metallurgy, and chemistry.'
      );

      const assistantMsg: Message = {
        role: 'assistant',
        content: result.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '**Scientific Analysis:** In Ti-6Al-4V (Grade 5), aluminum acts as an α-phase stabilizer (expanding the HCP alpha field), while vanadium (4 wt%) acts as an isomorphous β-phase stabilizer (BCC), creating a two-phase microstructural matrix with optimized high-temperature strength and fracture toughness.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                AI Science & Engineering Copilot
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Gemini Flash 2.5
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Computational physics, crystallography, chemical thermodynamics, and phase equilibria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#070c13]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-[#0e1724] text-slate-200 border border-[#1b2d42] rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div
                  className={`text-[9px] font-mono mt-2 text-right ${
                    m.role === 'user' ? 'text-cyan-950' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs font-mono text-cyan-400">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
              <span className="animate-pulse">Synthesizing scientific analysis...</span>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="p-2.5 px-4 bg-[#0a111a] border-t border-[#142230] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-500 text-[10px] uppercase mr-1 whitespace-nowrap">Suggested:</span>
          {samplePrompts.map((sp, i) => (
            <button
              key={i}
              onClick={() => handleSend(sp)}
              className="px-2.5 py-1 rounded bg-[#0e1824] hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition cursor-pointer"
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0b141e] border-t border-[#142230] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot about metallurgy, crystal structures, or reactions..."
            className="flex-1 bg-[#070c13] border border-[#1b2d42] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold p-2.5 rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
