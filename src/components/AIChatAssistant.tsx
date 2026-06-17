import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw, Trash2, Shield, ArrowRight, MessageSquare, AlertCircle, Bot, User } from "lucide-react";
import { ChatMessage, QSProject, UserRole } from "../types";

interface AIChatAssistantProps {
  project: QSProject;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onResetChats: () => Promise<void>;
  activeRole: UserRole;
}

export default function AIChatAssistant({
  project,
  messages,
  onSendMessage,
  onResetChats,
  activeRole
}: AIChatAssistantProps) {
  
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const activeProjectChats = messages.filter(m => m.projectId === project?.id);

  // Preset quick reference prompts
  const suggestions = [
    { text: "Show BOQ balance & item overruns", label: "Check Overruns" },
    { text: "Find missing items from IFC drawings scan", label: "Scan Missing Items" },
    { text: "Prepare materials procurement report", label: "Procurement Deficits" },
    { text: "Generate audit details for VP-12 valuation", label: "Draft VP-12 Claim" },
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setLoading(true);
    setInputText("");
    try {
      await onSendMessage(textToSend);
    } catch {
      alert("AI Assistant did not reply successfully. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]" id="chat-assistant-container">
      
      {/* Upper description / controller */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 h-14">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-bold">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono">Gemma 4 Commercial Reasoning Copilot</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Connected workspace RAG: Scanning active Tender BOQs, claims database, and material stock deficits.</p>
        </div>

        <button
          onClick={onResetChats}
          className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 hover:text-red-700 p-1.5 rounded-lg text-slate-500 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
          title="Reset conversation state"
        >
          <Trash2 className="w-4 h-4" /> Reset Conversation
        </button>
      </div>

      {/* Messages layout viewport */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
        {activeProjectChats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 max-w-md mx-auto text-center space-y-4">
            <Bot className="w-12 h-12 text-blue-500 animate-bounce" />
            <p className="text-xs font-semibold">Initiating Copilot Session...</p>
          </div>
        ) : (
          activeProjectChats.map((msg) => {
            const isAI = msg.role === "assistant";
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isAI ? "mr-12" : "ml-12 flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full border shrink-0 flex items-center justify-center font-bold text-xs ${
                  isAI 
                    ? "bg-blue-50 text-blue-600 border-blue-200" 
                    : "bg-slate-100 text-slate-655 text-slate-600 border-slate-200"
                }`}>
                  {isAI ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  isAI 
                    ? "bg-white border-slate-203 border-slate-200 text-slate-800 shadow-sm" 
                    : "bg-blue-600 text-white border-transparent shadow shadow-blue-500/10"
                }`}>
                  <div className={`flex justify-between items-center text-[10px] font-mono mb-1.5 ${
                    isAI ? "text-slate-500" : "text-blue-105 text-blue-200"
                  }`}>
                    <span className="font-bold">{isAI ? "QS COPILOT AI (Senior Surveyor)" : `${activeRole} Operator`}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  {/* Rich text formatting fallback helper */}
                  <div className="space-y-2 whitespace-pre-line font-medium leading-6">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-xl mr-12">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 shrink-0 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs text-slate-505 text-slate-500 font-mono italic flex items-center gap-2">
              <span>Scanning Contract Excel files, auditing claims, and assembling Surveyor report...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestions grid */}
      {activeProjectChats.length <= 2 && (
        <div className="pb-4">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Suggested Surveyor tasks</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.text)}
                className="cursor-pointer text-left bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/10 p-3 rounded-xl transition-all font-medium text-[11px] text-slate-700 group flex justify-between items-center shadow-sm"
              >
                <div>
                  <span className="text-[9px] font-bold text-blue-600 block mb-1">{s.label}</span>
                  <span className="text-slate-700 group-hover:text-slate-900">{s.text}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 leading-none" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input textbox forms */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-3 flex gap-2 h-16">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask anything about '${project?.name || "Tender"}' claims...`}
          className="flex-1 bg-white text-slate-800 border border-slate-200 hover:border-slate-300 transition-colors px-4 text-xs rounded-xl outline-none focus:border-blue-500 font-medium font-mono"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="cursor-pointer bg-blue-600 hover:bg-blue-550 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-40 flex items-center justify-center shadow-lg shadow-blue-500/15 font-bold shrink-0 w-12"
        >
          <Send className="w-4.5 h-4.5 text-white" />
        </button>
      </form>

    </div>
  );
}
