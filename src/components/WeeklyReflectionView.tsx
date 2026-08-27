import React, { useState, useEffect } from "react";
import { Journal, WeeklyReflection } from "../types";
import { useAuth } from "../context/AuthContext";
import { generateWeeklyReflection } from "../services/geminiService";
import {
  saveWeeklyReflection,
  subscribeWeeklyReflections,
} from "../services/firestoreService";
import {
  CalendarDays,
  Sparkles,
  RefreshCw,
  ListOrdered,
  BookOpen,
  ArrowRight,
  Save,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface WeeklyReflectionViewProps {
  journals: Journal[];
}

export const WeeklyReflectionView: React.FC<WeeklyReflectionViewProps> = ({ journals }) => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeReflection, setActiveReflection] = useState<WeeklyReflection | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to user's saved weekly reflections
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeWeeklyReflections(user.uid, (data) => {
      setReflections(data);
      if (data.length > 0 && !activeReflection) {
        setActiveReflection(data[0]);
      }
    });
    return () => unsub();
  }, [user]);

  const handleGenerateWeekly = async () => {
    if (!user) return;
    if (journals.length === 0) {
      setError("Please save some journals first before generating a weekly retrospective.");
      return;
    }

    setLoading(true);
    setError(null);

    const weekLabel = `Week of ${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;

    try {
      const generated = await generateWeeklyReflection(journals, weekLabel);
      const newRef: WeeklyReflection = {
        ...generated,
        id: `ref_week_${Date.now()}`,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      await saveWeeklyReflection(user.uid, newRef);
      setActiveReflection(newRef);
    } catch (err: any) {
      console.error("[Weekly Reflection Error]", err);
      setError("Failed to synthesize weekly reflection. Please verify your journals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="border-b border-[#EAE3D6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono tracking-widest text-[#8C6D32] uppercase mb-1 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Executive Retrospective</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F1E1B]">
            Weekly Reflection
          </h1>
          <p className="text-sm text-[#5C574F] mt-1">
            Gemini synthesizes overarching themes, core learnings, and strategic forward steps from your private entries.
          </p>
        </div>

        <button
          onClick={handleGenerateWeekly}
          disabled={loading || journals.length === 0}
          className="px-4 py-2 bg-[#1F1E1B] hover:bg-[#34322D] text-[#FAF8F5] rounded-sm text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#C9A96E] ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Synthesizing Week..." : "Synthesize This Week"}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C2C2] text-[#9B2C2C] text-sm rounded-sm">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="paper-sheet rounded-sm border border-[#EAE3D6] p-12 text-center">
          <Sparkles className="w-8 h-8 text-[#8C6D32] animate-spin mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1F1E1B] mb-1">Synthesizing Weekly Narrative</h3>
          <p className="text-xs text-[#8C857B]">
            Extracting focus areas, breakthroughs, and actionable next steps...
          </p>
        </div>
      ) : activeReflection ? (
        <div className="space-y-8">
          {/* Historical Week Selector if multiple exist */}
          {reflections.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#F0EBE2]">
              <span className="text-[10px] font-mono uppercase text-[#8C857B]">Archived Weeks:</span>
              {reflections.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveReflection(r)}
                  className={`px-3 py-1 text-xs rounded-sm whitespace-nowrap cursor-pointer ${
                    activeReflection.id === r.id
                      ? "bg-[#8C6D32] text-white font-medium"
                      : "bg-[#F3EFEA] text-[#5C574F] hover:bg-[#EAE4DC]"
                  }`}
                >
                  {r.weekLabel}
                </button>
              ))}
            </div>
          )}

          {/* Luxury Editorial Retrospective Sheet */}
          <div className="paper-sheet-elevated rounded-sm border border-[#DDD5C7] p-6 sm:p-10 bg-[#FFFFFF] shadow-sm">
            <div className="border-b border-[#EAE3D6] pb-6 mb-8 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-widest text-[#8C6D32] uppercase">
                THIS WEEK · EXECUTIVE RETROSPECTIVE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1E1B] mt-1">
                {activeReflection.weekLabel}
              </h2>
            </div>

            {/* Narrative Overview */}
            {activeReflection.summaryNarrative && (
              <div className="mb-8 p-5 bg-[#FAF8F5] border border-[#EAE3D6] rounded-sm">
                <p className="font-serif text-lg italic text-[#2C2A26] leading-relaxed">
                  "{activeReflection.summaryNarrative}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. Key Themes */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-[#8C6D32] border-b border-[#ECE4D8] pb-1.5 font-semibold">
                  1. Key Themes
                </div>
                <div className="space-y-2">
                  {activeReflection.keyThemes.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#E8E0D2] rounded-sm text-xs text-[#2C2A26] flex items-start gap-2"
                    >
                      <span className="text-[#8C6D32] font-serif font-bold">•</span>
                      <span className="font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. What I Focused On */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-[#8C6D32] border-b border-[#ECE4D8] pb-1.5 font-semibold">
                  2. What I Focused On
                </div>
                <div className="space-y-2">
                  {activeReflection.focusedOn.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#E8E0D2] rounded-sm text-xs text-[#2C2A26] flex items-start gap-2"
                    >
                      <span className="text-[#3D5A45] font-serif font-bold">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. What I Learned */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-[#8C6D32] border-b border-[#ECE4D8] pb-1.5 font-semibold">
                  3. What I Learned
                </div>
                <div className="space-y-2">
                  {activeReflection.lessonsLearned.map((l, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#E8E0D2] rounded-sm text-xs text-[#2C2A26] flex items-start gap-2"
                    >
                      <span className="text-[#8C6D32] font-serif font-bold">💡</span>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Possible Next Steps */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-[#8C6D32] border-b border-[#ECE4D8] pb-1.5 font-semibold">
                  4. Strategic Next Steps
                </div>
                <div className="space-y-2">
                  {activeReflection.nextSteps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#E8E0D2] rounded-sm text-xs text-[#2C2A26] flex items-start gap-2"
                    >
                      <span className="text-[#3D5A45] font-serif font-bold">→</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#ECE4D8] flex items-center justify-between text-[11px] font-mono text-[#8C857B]">
              <span>Stored securely in /users/{user?.uid.slice(0, 8)}.../weeklyReflections</span>
              <span>Generated via server-side Gemini</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center paper-sheet rounded-sm border border-[#EAE3D6]">
          <CalendarDays className="w-10 h-10 text-[#C4BCAF] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1F1E1B] mb-1">No Weekly Reflection Generated Yet</h3>
          <p className="text-xs text-[#8C857B] max-w-sm mx-auto mb-6">
            Click "Synthesize This Week" to have Gemini analyze your recent journal entries and generate a structured executive retrospective.
          </p>
          <button
            onClick={handleGenerateWeekly}
            disabled={journals.length === 0}
            className="px-5 py-2.5 bg-[#1F1E1B] text-[#FAF8F5] hover:bg-[#34322D] rounded-sm text-xs font-medium cursor-pointer disabled:opacity-50"
          >
            Synthesize Reflection Now
          </button>
        </div>
      )}
    </div>
  );
};
