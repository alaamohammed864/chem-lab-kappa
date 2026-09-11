import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Plus,
  MessageSquare,
  Paperclip,
  Trash2,
  Settings,
  ChevronDown,
  FileText,
  Atom,
  Boxes,
  Calculator,
  FolderGit2,
  ExternalLink,
} from 'lucide-react';
import {
  AIServiceManager,
  AIConversation,
  AIMessage,
  AIContextSnapshot,
  AIContextAttachment,
} from '../services/aiService';
import { ResearchWorkspaceService } from '../services/researchService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: Partial<AIContextSnapshot>;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialContext,
}) => {
  const [conversations, setConversations] = useState<AIConversation[]>(() =>
    AIServiceManager.getConversations()
  );
  const [activeConvId, setActiveConvId] = useState<string>(
    () => conversations[0]?.id || 'conv-default'
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConversationsDrawer, setShowConversationsDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentContent, setNewAttachmentContent] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState<AIContextAttachment['type']>('spectrum');
  const [activeProviderId, setActiveProviderId] = useState<string>(() =>
    AIServiceManager.getActiveProviderId()
  );

  // Active contextual attachments
  const [contextSnapshot, setContextSnapshot] = useState<AIContextSnapshot>(() => ({
    selectedElement: initialContext?.selectedElement || {
      symbol: 'Ti',
      name: 'Titanium',
      atomicNumber: 22,
      category: 'transition-metal',
      electronConfig: '[Ar] 3d² 4s²',
    },
    selectedMaterial: initialContext?.selectedMaterial || {
      designation: 'Ti-6Al-4V',
      name: 'Grade 5 Titanium Alloy',
      category: 'Titanium Alloys',
      yieldStrength: 880,
      hardness: '36 HRC',
      crystalStructure: 'Dual Phase (HCP α + BCC β)',
    },
    currentCalculation: initialContext?.currentCalculation || {
      tool: 'XRD Analysis',
      formula: 'nλ = 2d·sin(θ)',
      inputs: { twoTheta: 40.24, lambda: 1.5406 },
      outputs: { dSpacing: 2.24, hkl: '101' },
    },
    researchProject: initialContext?.researchProject || {
      id: 'proj-1',
      title: 'Phase Transformation & Pitting Immunity in 2507 Duplex',
      category: 'Corrosion & Coatings',
    },
    attachments: initialContext?.attachments || [],
  }));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, loading]);

  if (!isOpen) return null;

  const providers = AIServiceManager.getProviders();

  const handleSwitchProvider = (id: string) => {
    AIServiceManager.setActiveProviderId(id);
    setActiveProviderId(id);
  };

  const handleNewConversation = () => {
    const newChat = AIServiceManager.createConversation(
      `Session #${conversations.length + 1}`,
      contextSnapshot
    );
    setConversations(AIServiceManager.getConversations());
    setActiveConvId(newChat.id);
    setShowConversationsDrawer(false);
  };

  const handleSendMessage = async (textToSend = input) => {
    if (!textToSend.trim() || loading || !activeConv) return;

    setInput('');
    setLoading(true);

    try {
      await AIServiceManager.sendMessage(activeConv.id, textToSend, contextSnapshot);
      setConversations(AIServiceManager.getConversations());
    } catch (err: any) {
      console.error('Failed to send AI message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddAttachment = () => {
    setNewAttachmentName('');
    setNewAttachmentContent('');
    setShowAddAttachmentModal(true);
  };

  const handleSaveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName.trim()) return;

    const newAtt: AIContextAttachment = {
      id: `att-${Date.now()}`,
      name: newAttachmentName.trim(),
      type: newAttachmentType,
      content: newAttachmentContent.trim() || 'No additional content provided.',
    };

    setContextSnapshot((prev) => ({
      ...prev,
      attachments: [...prev.attachments, newAtt],
    }));
    setShowAddAttachmentModal(false);
  };

  const samplePrompts = [
    `Analyze α/β phase stabilization in ${contextSnapshot.selectedMaterial?.designation || 'Ti-6Al-4V'}`,
    `Calculate crystallite size via Scherrer equation for peak at 2θ = ${
      contextSnapshot.currentCalculation?.inputs?.twoTheta || '40.24'
    }°`,
    `Evaluate pitting resistance PREN formula in chloride environment for ${
      contextSnapshot.selectedMaterial?.designation || 'super duplex'
    }`,
    `Explain ultrasonic longitudinal vs shear velocity ratio in ${
      contextSnapshot.selectedElement?.name || 'Titanium'
    }`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070d14] border border-[#1b2b3d] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#162738] bg-gradient-to-r from-[#0b1420] via-[#0e1a2b] to-[#0b1420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  AI Science & Metallurgy Copilot
                </h2>
                {/* Pluggable Provider Badge */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold hover:border-cyan-500 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{providers.find((p) => p.id === activeProviderId)?.name.split(' ')[0] || 'AI'}</span>
                    <ChevronDown className="w-3 h-3 text-cyan-400" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Pluggable architecture: Contextual analysis of crystals, diffraction, electrochemistry & NDT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConversationsDrawer(!showConversationsDrawer)}
              className="p-2 rounded-lg bg-[#0e1724] border border-[#18283a] text-xs text-slate-300 hover:text-white hover:border-cyan-500/50 transition cursor-pointer flex items-center gap-1.5"
              title="Conversations History"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Chats ({conversations.length})</span>
            </button>

            <button
              onClick={handleNewConversation}
              className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800 text-xs text-cyan-300 hover:border-cyan-400 transition cursor-pointer flex items-center gap-1.5"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Context Chips Bar */}
        <div className="px-5 py-2 bg-[#08101a] border-b border-[#142232] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold shrink-0">
            Active Context:
          </span>

          {contextSnapshot.selectedElement && (
            <div className="px-2.5 py-1 rounded-md bg-[#0e1927] border border-[#1b2f46] text-cyan-300 flex items-center gap-1.5 shrink-0">
              <Atom className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {contextSnapshot.selectedElement.name} ({contextSnapshot.selectedElement.symbol})
              </span>
            </div>
          )}

          {contextSnapshot.selectedMaterial && (
            <div className="px-2.5 py-1 rounded-md bg-[#0e1927] border border-[#1b2f46] text-teal-300 flex items-center gap-1.5 shrink-0">
              <Boxes className="w-3.5 h-3.5 text-teal-400" />
              <span>{contextSnapshot.selectedMaterial.designation}</span>
            </div>
          )}

          {contextSnapshot.currentCalculation && (
            <div className="px-2.5 py-1 rounded-md bg-[#0e1927] border border-[#1b2f46] text-indigo-300 flex items-center gap-1.5 shrink-0">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {contextSnapshot.currentCalculation.tool} [
                {Object.keys(contextSnapshot.currentCalculation.outputs)[0]}:{' '}
                {Object.values(contextSnapshot.currentCalculation.outputs)[0]}]
              </span>
            </div>
          )}

          {contextSnapshot.researchProject && (
            <div className="px-2.5 py-1 rounded-md bg-[#0e1927] border border-[#1b2f46] text-purple-300 flex items-center gap-1.5 shrink-0">
              <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate max-w-[150px]">
                {contextSnapshot.researchProject.title}
              </span>
            </div>
          )}

          {contextSnapshot.attachments.map((att) => (
            <div
              key={att.id}
              className="px-2 py-1 rounded-md bg-[#132233] border border-cyan-800/80 text-cyan-200 flex items-center gap-1.5 shrink-0"
            >
              <Paperclip className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[120px]">{att.name}</span>
            </div>
          ))}

          <button
            onClick={handleOpenAddAttachment}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 shrink-0 transition cursor-pointer"
          >
            <Paperclip className="w-3 h-3" />
            <span>+ Attach Context</span>
          </button>
        </div>

        {/* Add Context Attachment Modal */}
        {showAddAttachmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#0c1624] border border-[#1d324d] rounded-xl p-5 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  Attach Scientific Context / Dataset
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAttachmentModal(false)}
                  className="text-slate-400 hover:text-white p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAttachment} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Attachment Name / Label:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diffractogram_Run02.xy or Chemical_Assay.txt"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Attachment Category:
                  </label>
                  <select
                    value={newAttachmentType}
                    onChange={(e) => setNewAttachmentType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="spectrum">Diffraction Spectrum / XRD XY</option>
                    <option value="calculation">Thermodynamic Calculation</option>
                    <option value="data">Materials Physical Properties</option>
                    <option value="text">Observation / Lab Log Entry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Data Points / Scientific Assay / Notes:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste 2θ vs intensity points, elemental weight percentages, or reaction parameters..."
                    value={newAttachmentContent}
                    onChange={(e) => setNewAttachmentContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddAttachmentModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
                  >
                    Add Attachment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Provider Settings Drawer (Modal Overlay) */}
        {showSettingsDrawer && (
          <div className="p-4 bg-[#0a121c] border-b border-[#1b2e44] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-cyan-400" />
                Select AI Engine Provider (Non-Hardcoded Architecture)
              </span>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {providers.map((p) => {
                const isSelected = p.id === activeProviderId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchProvider(p.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-[#102336] border-cyan-500 shadow-md shadow-cyan-950/40'
                        : 'bg-[#0e1724] border-[#18283a] hover:border-slate-600 hover:bg-[#121f2f]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Chat Layout (with Conversations Drawer if open) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Slide-out Conversations List Drawer */}
          {showConversationsDrawer && (
            <div className="w-64 bg-[#09111b] border-r border-[#142232] p-3 flex flex-col space-y-2 shrink-0 animate-fadeIn">
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Past Conversations
                </span>
                <button
                  onClick={handleNewConversation}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConvId(c.id);
                      setShowConversationsDrawer(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition cursor-pointer truncate flex items-center justify-between ${
                      c.id === activeConvId
                        ? 'bg-[#112334] border-cyan-500/80 text-white font-semibold'
                        : 'bg-[#0c1521] border-transparent text-slate-400 hover:bg-[#101b2a] hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{c.title}</span>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0 ml-1">
                      {c.messages.length} msgs
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Message Thread */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#070c13]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeConv?.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${
                    m.role === 'user' ? 'ml-auto justify-end' : 'mr-auto'
                  }`}
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
                      {m.timestamp}
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
                  <span className="animate-pulse">
                    Evaluating context through {providers.find((p) => p.id === activeProviderId)?.name}...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="px-4 py-2 bg-[#09111b] border-t border-[#142232] flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase font-semibold">
                Suggested Inquiries:
              </span>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#0f1b28] hover:bg-[#15273a] border border-[#1b2f46] text-xs text-slate-300 hover:text-cyan-300 transition shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-[#0a121c] border-t border-[#162738]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about phase equilibria, PREN formulas, XRD indexing, or attached context..."
                  className="flex-1 bg-[#0f1a26] border border-[#1c2e42] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
