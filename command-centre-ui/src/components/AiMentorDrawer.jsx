import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Terminal,
  Code2,
  CheckCircle,
  Plus,
  Compass,
  BookOpen,
  Check,
  Copy,
  ChevronDown,
  RefreshCw,
  Zap,
  Trash2,
  Cpu,
  Layers,
  AlertTriangle,
} from "lucide-react";
import api from "../api/axios";

const STORAGE_KEY = "cc_ai_mentor_messages";
const SELECTED_MODEL_KEY = "cc_ai_mentor_preferred_model";

const MODELS = [
  { id: "AUTO", label: "Auto (Smart Fallback)", icon: Zap, color: "text-neon-cyan", desc: "Gemini → Groq → Ollama → Local" },
  { id: "GEMINI", label: "Google Gemini", icon: Sparkles, color: "text-blue-400", desc: "Gemini 1.5 / 2.0 Flash" },
  { id: "GROQ", label: "Groq (Llama 3.3 70B)", icon: Cpu, color: "text-amber-400", desc: "Ultra-Fast Inference" },
  { id: "OLLAMA", label: "Ollama (Local LLM)", icon: Layers, color: "text-purple-400", desc: "Offline localhost:11434" },
  { id: "LOCAL", label: "Local Telemetry Engine", icon: Bot, color: "text-emerald-400", desc: "Deterministic DB Guide" },
];

export default function AiMentorDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [preferredModel, setPreferredModel] = useState(() => {
    return localStorage.getItem(SELECTED_MODEL_KEY) || "AUTO";
  });

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activeRuntimeModel, setActiveRuntimeModel] = useState("Auto");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [actionStatus, setActionStatus] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Persist messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to persist messages to localStorage:", e);
    }
  }, [messages]);

  // Persist preferred model
  useEffect(() => {
    localStorage.setItem(SELECTED_MODEL_KEY, preferredModel);
  }, [preferredModel]);

  // Fetch telemetry context when opened
  useEffect(() => {
    if (isOpen) {
      loadContext();
      if (inputRef.current) {
        setTimeout(() => inputRef.current.focus(), 150);
      }
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const loadContext = async () => {
    try {
      setContextLoading(true);
      const res = await api.get("/ai/context");
      if (res.data?.success && res.data.data) {
        const ctx = res.data.data;
        setContext(ctx);

        // Populate initial greeting if chat is empty
        if (messages.length === 0) {
          const initial = [
            {
              id: "initial-welcome",
              role: "assistant",
              content: `### 👋 Welcome to your Personal AI Mentor, Karthik!\n\nI am synced live with your **Command Centre database**.\n\n- **Current Stage**: **${ctx.stageTitle}** (Stage ${ctx.stageNumber} of 6)\n- **Overall Progress**: **${ctx.completedTopicsCount} / ${ctx.totalTopicsCount} topics** (${ctx.progressPercentage}% completed)\n- **Next Recommended Focus**: **${ctx.nextRecommendedTopic || "Operators & Expressions"}**\n\nI support all programming languages (Python, Java, JS, C++, Go, SQL), document reading, interview prep, and casual conversation. How can I help you today?`,
              actions: [
                {
                  id: "act-1",
                  type: "TASK",
                  title: `Master ${ctx.nextRecommendedTopic || "Next Chapter"} Concepts`,
                  priority: "HIGH",
                  category: "Learning",
                },
                {
                  id: "act-2",
                  type: "DSA",
                  title: ctx.nextRecommendedTopic?.toLowerCase().includes("array")
                    ? "Find Min & Max Element in Array"
                    : "Two Sum / Fundamental Drill",
                  platform: "LeetCode",
                  topic: ctx.nextRecommendedTopic?.toLowerCase().includes("array") ? "Arrays" : "Java Basics",
                  difficulty: "EASY",
                },
              ],
              activeModel: ctx.hasGeminiApiKey ? "Google Gemini 1.5 Flash" : "Local Telemetry Engine",
              provider: ctx.hasGeminiApiKey ? "GEMINI" : "LOCAL",
            },
          ];
          setMessages(initial);
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI Mentor context:", err);
    } finally {
      setContextLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your saved AI Mentor chat history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      loadContext();
    }
  };

  const handleSendMessage = async (customPrompt = null) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend && !codeSnippet.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: promptToSend,
      codeSnippet: codeSnippet.trim() || null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const snippetToSend = codeSnippet.trim();
    setCodeSnippet("");
    setShowCodeInput(false);
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      const res = await api.post("/ai/chat", {
        prompt: promptToSend,
        preferredModel: preferredModel,
        codeSnippet: snippetToSend || null,
        conversationHistory: history,
      });

      if (res.data?.success && res.data.data) {
        const aiData = res.data.data;
        setActiveRuntimeModel(aiData.activeModel || preferredModel);

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiData.reply,
          actions: aiData.actions || [],
          activeModel: aiData.activeModel,
          provider: aiData.provider,
          fallbackTriggered: aiData.fallbackTriggered,
          fallbackReason: aiData.fallbackReason,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("AI Mentor chat error:", err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Unable to reach AI service.**\n\n${
          err.response?.data?.message || err.message || "Please make sure your Spring Boot backend is active."
        }`,
        activeModel: "Connection Error",
        actions: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    const actionId = action.id;
    setActionStatus((prev) => ({ ...prev, [actionId]: "loading" }));

    try {
      const res = await api.post("/ai/action", {
        actionType: action.type,
        title: action.title,
        priority: action.priority || "MEDIUM",
        category: action.category || "Learning",
        platform: action.platform || "LeetCode",
        topic: action.topic || "Arrays",
        difficulty: action.difficulty || "EASY",
      });

      if (res.data?.success) {
        setActionStatus((prev) => ({ ...prev, [actionId]: "added" }));
      } else {
        setActionStatus((prev) => ({ ...prev, [actionId]: "error" }));
      }
    } catch (err) {
      console.error("Failed to execute quick action:", err);
      setActionStatus((prev) => ({ ...prev, [actionId]: "error" }));
    }
  };

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderFormattedMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
        const code = language ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-dark-border bg-[#070b12] text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-dark-bg/90 border-b border-dark-border text-gray-400 font-mono text-[11px]">
              <span className="text-neon-cyan uppercase font-semibold">{language || "CODE"}</span>
              <button
                type="button"
                onClick={() => copyCode(code, index)}
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Copy Code"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-neon-emerald" />
                    <span className="text-neon-emerald font-sans text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 font-mono text-gray-200 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format markdown lines (headers, lists, bold)
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-1.5 text-sm leading-relaxed text-gray-300">
          {lines.map((line, lIdx) => {
            if (line.startsWith("### ")) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-white mt-3 mb-1 tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-neon-cyan inline" />
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("#### ")) {
              return (
                <h4 key={lIdx} className="text-sm font-semibold text-neon-cyan mt-2 mb-0.5">
                  {line.replace("#### ", "")}
                </h4>
              );
            }
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-neon-cyan font-bold">&bull;</span>
                  <span>{formatInlineMarkdown(line.substring(2))}</span>
                </div>
              );
            }
            if (line.match(/^\d+\.\s/)) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-neon-emerald font-mono font-semibold">{line.split(".")[0]}.</span>
                  <span>{formatInlineMarkdown(line.replace(/^\d+\.\s/, ""))}</span>
                </div>
              );
            }
            if (line.startsWith("> [!NOTE]")) {
              return (
                <div key={lIdx} className="p-2.5 rounded-lg bg-neon-cyan/5 border-l-2 border-neon-cyan text-xs text-gray-300 my-2">
                  {formatInlineMarkdown(line.replace("> [!NOTE]", ""))}
                </div>
              );
            }
            if (line.trim() === "") return <div key={lIdx} className="h-1" />;

            return <p key={lIdx}>{formatInlineMarkdown(line)}</p>;
          })}
        </div>
      );
    });
  };

  const formatInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-dark-bg border border-dark-border text-neon-cyan font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  if (!isOpen) return null;

  const currentModelConfig = MODELS.find((m) => m.id === preferredModel) || MODELS[0];
  const CurrentModelIcon = currentModelConfig.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Out Drawer Panel */}
      <div className="relative w-full sm:w-[520px] lg:w-[600px] h-full bg-[#0d121d] border-l border-dark-border shadow-2xl flex flex-col z-50 animate-slide-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-dark-card/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan/20 to-neon-emerald/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Personal AI Mentor</h2>
                
                {/* Model Selector Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-dark-bg border border-dark-border hover:border-neon-cyan/50 text-gray-200 transition-colors"
                    title="Select AI Model or Auto Mode"
                  >
                    <CurrentModelIcon className={`w-3 h-3 ${currentModelConfig.color}`} />
                    <span>{currentModelConfig.label}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {modelDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-64 rounded-xl bg-[#0b1017] border border-dark-border shadow-2xl p-1.5 z-50 animate-fade-in">
                      <div className="px-2 py-1 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                        Select AI Intelligence
                      </div>
                      {MODELS.map((m) => {
                        const Icon = m.icon;
                        const isSelected = preferredModel === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setPreferredModel(m.id);
                              setModelDropdownOpen(false);
                            }}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? "bg-neon-cyan/15 text-white border border-neon-cyan/30"
                                : "hover:bg-dark-card text-gray-300"
                            }`}
                          >
                            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${m.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold flex items-center justify-between">
                                <span>{m.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-neon-cyan" />}
                              </div>
                              <p className="text-[10px] text-gray-400 truncate">{m.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-0.5">
                {context ? (
                  <span>
                    Synced: <strong className="text-gray-200">{context.stageTitle}</strong> ({context.progressPercentage}%)
                  </span>
                ) : (
                  "Loading curriculum state..."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear Saved Chat History"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-dark-bg/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={loadContext}
              disabled={contextLoading}
              title="Refresh Curriculum State"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg/60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${contextLoading ? "animate-spin text-neon-cyan" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Drawer (Esc)"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Curriculum Telemetry Pill */}
        {context && (
          <div className="px-4 py-2 bg-dark-bg/90 border-b border-dark-border flex items-center justify-between text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2 truncate">
              <Compass className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
              <span className="truncate">
                Next: <span className="text-neon-cyan font-semibold">{context.nextRecommendedTopic}</span>
              </span>
            </div>
            <span className="text-[11px] text-gray-500 shrink-0">
              {context.completedTopicsCount}/{context.totalTopicsCount} Done
            </span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-4 text-sm leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/40 text-white rounded-br-none"
                    : "bg-[#141a27] border border-dark-border text-gray-200 rounded-bl-none"
                }`}
              >
                {/* Code snippet attached to user message */}
                {msg.codeSnippet && (
                  <div className="mb-2 p-2.5 rounded-lg bg-black/40 border border-dark-border text-xs font-mono text-neon-cyan overflow-x-auto">
                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> Attached Code / Document:
                    </div>
                    <pre>{msg.codeSnippet}</pre>
                  </div>
                )}

                {msg.role === "assistant" ? renderFormattedMarkdown(msg.content) : msg.content}

                {/* Model Footnote & Fallback Alert */}
                {msg.role === "assistant" && (
                  <div className="mt-3 pt-2 border-t border-dark-border/40 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-neon-cyan/80" />
                      <span>{msg.activeModel || "AI Mentor"}</span>
                    </div>

                    {msg.fallbackTriggered && (
                      <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Auto-Switched: Quota limit reached</span>
                      </span>
                    )}

                    {msg.timestamp && <span>{msg.timestamp}</span>}
                  </div>
                )}

                {/* 1-Click Action Cards Generated by Mentor */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-dark-border/80 space-y-2">
                    <div className="text-[11px] font-mono text-neon-cyan uppercase tracking-wider flex items-center gap-1 font-semibold">
                      <Zap className="w-3 h-3" /> 1-Click Actions:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.actions.map((act) => {
                        const status = actionStatus[act.id];
                        const isTask = act.type === "TASK";

                        return (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl bg-dark-bg/80 border border-dark-border/80 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                  isTask
                                    ? "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan"
                                    : "bg-neon-purple/10 border border-neon-purple/30 text-neon-purple"
                                }`}
                              >
                                {isTask ? "TASK" : "DSA"}
                              </span>
                              <span className="text-gray-200 font-medium truncate">{act.title}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuickAction(act)}
                              disabled={status === "loading" || status === "added"}
                              className={`shrink-0 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold flex items-center gap-1 transition-all ${
                                status === "added"
                                  ? "bg-neon-emerald/20 border border-neon-emerald/50 text-neon-emerald cursor-default"
                                  : status === "loading"
                                  ? "bg-dark-card border border-dark-border text-gray-400 cursor-wait"
                                  : "bg-neon-cyan/15 hover:bg-neon-cyan/25 border border-neon-cyan/40 text-neon-cyan"
                              }`}
                            >
                              {status === "added" ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" /> Added
                                </>
                              ) : status === "loading" ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" /> {isTask ? "Add Task" : "Add DSA"}
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141a27] border border-dark-border w-fit text-xs text-gray-400 font-mono">
              <Bot className="w-4 h-4 text-neon-cyan animate-spin" />
              <span>Querying {currentModelConfig.label}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Pills */}
        <div className="px-4 py-2 border-t border-dark-border/60 bg-dark-card/60 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => handleSendMessage("What should I learn next based on my roadmap?")}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <Compass className="w-3 h-3 text-neon-cyan" />
            What to learn next?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(`Generate 3 practice questions for my current topic: ${context?.nextRecommendedTopic || "Java Basics"}`)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <Terminal className="w-3 h-3 text-neon-emerald" />
            Practice drills
          </button>
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`shrink-0 px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 font-mono text-[11px] ${
              showCodeInput
                ? "bg-neon-cyan/20 border-neon-cyan text-white"
                : "bg-dark-bg border-dark-border text-gray-300 hover:text-neon-cyan"
            }`}
          >
            <Code2 className="w-3 h-3 text-neon-purple" />
            Code / Doc Review
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Generate today's task plan")}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <BookOpen className="w-3 h-3 text-amber-400" />
            Daily Tasks Plan
          </button>
        </div>

        {/* Code / Document Collapsible Input */}
        {showCodeInput && (
          <div className="p-3 bg-[#080d15] border-t border-dark-border animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-1.5">
              <span className="flex items-center gap-1 text-neon-cyan font-medium">
                <Code2 className="w-3.5 h-3.5" /> Paste Code, Document, or Text to Review / Summarize:
              </span>
              <button
                type="button"
                onClick={() => setShowCodeInput(false)}
                className="hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Paste code in any language (Python, Java, JS, C++, Go, Rust, SQL...) or paste articles, interview questions, error logs, or text..."
              rows={4}
              className="w-full bg-[#0d121d] border border-dark-border rounded-xl p-2.5 font-mono text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30"
            />
          </div>
        )}

        {/* Bottom Input Field */}
        <div className="p-3 sm:p-4 border-t border-dark-border bg-dark-card/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (concepts, code in any language, docs, general knowledge)..."
              disabled={loading}
              className="flex-1 bg-dark-bg/90 border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 transition-all"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !codeSnippet.trim())}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-bold font-mono text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Mentor</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
