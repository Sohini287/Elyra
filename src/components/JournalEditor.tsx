import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Journal, JournalMessage, SmartActionItem } from "../types";
import { sendJournalMessage, analyzeJournalSession } from "../services/geminiService";
import { saveJournal, saveActionItem, saveIdea } from "../services/firestoreService";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  ListTodo,
  Tag,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Feather,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface JournalEditorProps {
  onJournalSaved: () => void;
  initialThought?: string;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ onJournalSaved, initialThought = "" }) => {
  const { user } = useAuth();
  const [userThought, setUserThought] = useState(initialThought);
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Analysis State
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<SmartActionItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showSynthesis, setShowSynthesis] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Handle sending thought to Gemini
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userThought.trim() || isThinking) return;

    setError(null);
    const userMsg: JournalMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      text: userThought.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserThought("");
    setIsThinking(true);

    try {
      const response = await sendJournalMessage(updatedMessages);
      const geminiMsg: JournalMessage = {
        id: `msg_gem_${Date.now()}`,
        role: "gemini",
        text: response.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages([...updatedMessages, geminiMsg]);
    } catch (err: any) {
      console.error("[Gemini Chat Error]", err);
      setError(err?.message || "Gemini reflection could not be generated. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  // Trigger AI Synthesis & Smart Extraction
  const handleGenerateSynthesis = async () => {
    if (messages.length === 0) {
      setError("Please write and explore at least one thought before generating synthesis.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeJournalSession(messages);
      setGeneratedTitle(analysis.title || "Reflective Journal Session");
      setGeneratedSummary(analysis.summary || "");
      setKeyPoints(analysis.keyPoints || []);
      setActionItems(
        (analysis.actionItems || []).map((item, idx) => ({
          id: `act_${Date.now()}_${idx}`,
          text: item.text,
          status: "suggested",
        }))
      );
      setTags(analysis.tags || ["Reflection"]);
      setShowSynthesis(true);
    } catch (err: any) {
      console.error("[Analysis Error]", err);
      setError("Failed to synthesize journal session. You can still save manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle Action Item Status
  const toggleActionStatus = (idx: number) => {
    setActionItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const nextStatus = item.status === "accepted" ? "suggested" : "accepted";
        return { ...item, status: nextStatus };
      })
    );
  };

  // Remove Action Item
  const removeActionItem = (idx: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add Custom Tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()]);
      }
      setNewTagInput("");
    }
  };

  // Save Journal to User-Isolated Firestore
  const handleSaveJournal = async () => {
    if (!user) {
      setError("You must be authenticated to save private journals.");
      return;
    }

    if (messages.length === 0) {
      setError("Nothing to save yet. Write a reflection first.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const journalId = `jrn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalTitle = generatedTitle.trim() || "Private Reflection Session";
    const finalSummary =
      generatedSummary.trim() ||
      messages[0].text.slice(0, 140) + (messages[0].text.length > 140 ? "..." : "");

    const newJournal: Journal = {
      id: journalId,
      userId: user.uid,
      title: finalTitle,
      summary: finalSummary,
      messages,
      keyPoints,
      actionItems,
      tags: tags.length > 0 ? tags : ["General"],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveJournal(user.uid, newJournal);

      // Save individual accepted action items to user's actionItems collection
      for (const item of actionItems) {
        if (item.status === "accepted") {
          await saveActionItem(user.uid, {
            id: item.id,
            userId: user.uid,
            journalId,
            journalTitle: finalTitle,
            text: item.text,
            status: "accepted",
            dueDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      setSaveSuccess(true);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 },
          colors: ["#8C6D32", "#C9A96E", "#3D5A45"],
        });
      } catch (e) {
        // Confetti non-critical
      }

      setTimeout(() => {
        onJournalSaved();
      }, 1200);
    } catch (err: any) {
      console.error("[Save Journal Error]", err);
      setError(
        err?.message ||
          "Failed to save journal to Firestore. Verify your network or authentication status."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Save thought into Idea Vault
  const handleSaveToIdeaVault = async (text: string, titleOverride?: string) => {
    if (!user) return;
    try {
      await saveIdea(user.uid, {
        id: `idea_${Date.now()}`,
        userId: user.uid,
        title: titleOverride || text.slice(0, 40) + "...",
        description: text,
        category: tags[0] || "General Discovery",
        createdAt: new Date().toISOString(),
      });
      alert("Saved to Idea Vault!");
    } catch (e: any) {
      setError("Failed to save to Idea Vault.");
    }
  };

  const samplePrompts = [
    "I'm wrestling with how to simplify our software architecture...",
    "Today I discovered an interesting insight about deep focus...",
    "I want to reflect on my weekly priorities and eliminate distraction...",
    "Exploring a new product concept: AI-powered spatial audio...",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Editorial Header */}
      <div className="mb-8 border-b border-[#E5E2DA] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#C5A059] font-bold mb-1.5 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5" />
            <span>Private Sanctuary</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            What's on your mind?
          </h1>
          <p className="text-sm text-[#666158] mt-1">
            Write freely. Explore an idea, reflect on decisions, or unpack complex challenges.
          </p>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSynthesis}
              disabled={isAnalyzing || isThinking}
              className="px-4 py-2 bg-[#FDFCF9] hover:bg-[#F5F2ED] text-[#1A1A1A] border border-[#E2DDD3] rounded-sm text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isAnalyzing ? "Synthesizing..." : "Synthesize AI Insights"}</span>
            </button>

            <button
              onClick={handleSaveJournal}
              disabled={isSaving || isThinking}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2C2A26] text-[#FDFCF9] rounded-sm text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isSaving ? "Persisting..." : "Save Journal"}</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C2C2] text-[#9B2C2C] text-sm rounded-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-xs uppercase font-mono">Error Notice</div>
            <div className="mt-0.5">{error}</div>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-mono underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-[#F0F7F2] border border-[#C6E2D0] text-[#22543D] text-sm rounded-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#3D5A45]" />
          <span>Journal successfully secured in your private Firestore collection!</span>
        </div>
      )}

      {/* Conversation / Dialogue Stream */}
      <div className="space-y-6 mb-8">
        {messages.length === 0 ? (
          /* Empty State / Prompt Starters */
          <div className="p-8 paper-sheet rounded-sm border border-[#E5E2DA] text-center my-6 bg-[#FFFFFF]">
            <div className="w-12 h-12 rounded-full bg-[#F5F2ED] text-[#C5A059] flex items-center justify-center mx-auto mb-4 border border-[#E5E0D5]">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Begin Your Reflection</h3>
            <p className="text-sm text-[#666158] max-w-md mx-auto mb-6">
              Write a thought below. Gemini will act as your quiet Socratic partner, offering clarity without diagnosing or judging.
            </p>

            <div className="text-left max-w-lg mx-auto space-y-2">
              <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-1">
                Suggested Starters
              </div>
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setUserThought(prompt)}
                  className="w-full text-left px-3.5 py-2.5 bg-[#FDFCF9] hover:bg-[#F5F2ED] border border-[#E5E0D5] rounded-sm text-xs text-[#2C2A26] transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="italic truncate">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id || index}
                className={`p-6 paper-sheet rounded-sm border transition-all ${
                  isUser
                    ? "bg-[#FDFCF9] border-[#E5E0D5]"
                    : "bg-[#FFFFFF] border-[#E2DDD3] border-l-2 border-l-[#C5A059]"
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-[#EAE5DC] pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-sans uppercase tracking-[0.2em] font-bold ${
                        isUser ? "text-[#666158]" : "text-[#C5A059]"
                      }`}
                    >
                      {isUser ? "Author · Reflection" : "Gemini · Socratic Partner"}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#999287]">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div
                  className={`text-base leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "text-[#1A1A1A] font-normal"
                      : "text-[#2A2925] font-serif text-[17px] leading-[1.65]"
                  }`}
                >
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-[#F5F2ED] flex items-center justify-end gap-3 text-xs">
                    <button
                      onClick={() => handleSaveToIdeaVault(msg.text, "Reflective Discovery")}
                      className="text-[#C5A059] hover:text-[#9E7B36] flex items-center gap-1 font-mono text-[11px] cursor-pointer font-medium"
                      title="Save this reflection to Idea Vault"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Save to Idea Vault</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {isThinking && (
          <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF] border-l-2 border-l-[#C5A059] animate-pulse">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Gemini is contemplating...</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-[#F5F2ED] rounded-sm w-5/6"></div>
              <div className="h-3 bg-[#F5F2ED] rounded-sm w-4/6"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <form onSubmit={handleSendMessage} className="mb-10 paper-sheet rounded-sm border border-[#E2DDD3] p-4 bg-[#FFFFFF] shadow-xs">
        <textarea
          value={userThought}
          onChange={(e) => setUserThought(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSendMessage();
            }
          }}
          placeholder="Type your reflection, question, or thought here... (Ctrl+Enter or click below)"
          rows={4}
          className="w-full bg-transparent border-0 resize-none text-[#1A1A1A] placeholder-[#9E988D] focus:ring-0 focus:outline-hidden text-base leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#EAE5DC]">
          <span className="text-[11px] font-mono text-[#8C857B]">
            Press <kbd className="px-1.5 py-0.5 bg-[#F5F2ED] border border-[#E2DDD3] rounded text-[10px]">Ctrl</kbd> +{" "}
            <kbd className="px-1.5 py-0.5 bg-[#F5F2ED] border border-[#E2DDD3] rounded text-[10px]">Enter</kbd> to reflect
          </span>

          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={!userThought.trim() || isThinking}
              className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#2C2A26] text-[#FDFCF9] rounded-sm text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{messages.length === 0 ? "Begin Reflection" : "Send Thought"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* AI Synthesis & Extraction Drawer / Card */}
      {showSynthesis && (
        <div className="paper-sheet rounded-sm border border-[#E2DDD3] p-6 sm:p-8 bg-[#FDFCF9] mb-12 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                AI Synthesis & Structured Insights
              </h3>
            </div>
            <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-bold bg-[#F5F2ED] text-[#C5A059] px-2.5 py-1 rounded border border-[#E5E0D5]">
              Ready to Archive
            </span>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#666158] mb-1.5">
                Evocative Title
              </label>
              <input
                type="text"
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm px-3.5 py-2 text-lg font-serif text-[#1A1A1A] focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#666158] mb-1.5">
                Executive Synthesis
              </label>
              <textarea
                value={generatedSummary}
                onChange={(e) => setGeneratedSummary(e.target.value)}
                rows={2}
                className="w-full bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm px-3.5 py-2 text-sm text-[#2C2A26] leading-relaxed focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            {/* Key Points */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#666158] mb-2 flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Key Discoveries & Takeaways</span>
              </label>
              <div className="space-y-2">
                {keyPoints.map((kp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#FFFFFF] border border-[#E5E0D5] rounded-sm text-xs text-[#2C2A26] flex items-start gap-2"
                  >
                    <span className="text-[#C5A059] font-serif font-bold text-xs mt-0.5">•</span>
                    <span className="flex-1 leading-normal">{kp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Action Items */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#666158] mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5A45]" />
                  <span>Smart Action Items (Suggested by Gemini)</span>
                </div>
                <span className="text-[10px] text-[#8C857B]">Click to Accept or Dismiss</span>
              </label>

              {actionItems.length === 0 ? (
                <div className="text-xs text-[#8C857B] italic">No immediate action items identified.</div>
              ) : (
                <div className="space-y-2">
                  {actionItems.map((item, idx) => {
                    const isAccepted = item.status === "accepted";
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-3 rounded-sm border transition-all flex items-center justify-between gap-3 ${
                          isAccepted
                            ? "bg-[#F3F7F4] border-[#B7D8C1] text-[#1E432E]"
                            : "bg-[#FFFFFF] border-[#E2DDD3] text-[#2C2A26]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleActionStatus(idx)}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${
                              isAccepted
                                ? "bg-[#3D5A45] border-[#3D5A45] text-white"
                                : "border-[#BDB5A7] hover:border-[#C5A059]"
                            }`}
                          >
                            {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-xs font-medium leading-snug">{item.text}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                              isAccepted
                                ? "bg-[#3D5A45]/15 text-[#244E35]"
                                : "bg-[#F5F2ED] text-[#C5A059]"
                            }`}
                          >
                            {item.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeActionItem(idx)}
                            className="text-[#999287] hover:text-[#B91C1C] p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#666158] mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Thematic Tags</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFFFFF] border border-[#E2DDD3] text-[#2C2A26] text-xs rounded-sm"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                      className="text-[#999287] hover:text-[#B91C1C] cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag (Press Enter)"
                  className="bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm px-2.5 py-1 text-xs text-[#2C2A26] placeholder-[#9E988D] focus:border-[#C5A059] focus:outline-hidden w-36"
                />
              </div>
            </div>

            {/* Final Action Bar */}
            <div className="pt-6 border-t border-[#E5E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-xs text-[#666158]">
                <span>Saving to isolated subcollection: </span>
                <code className="font-mono text-[11px] text-[#C5A059] bg-[#F5F2ED] px-1.5 py-0.5 rounded border border-[#E5E0D5]">
                  /users/{user?.uid.slice(0, 8)}.../journals
                </code>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveJournal}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#2C2A26] text-[#FDFCF9] rounded-sm text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#C5A059]" />
                  <span>{isSaving ? "Persisting to Cloud..." : "Confirm & Save Entry"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
