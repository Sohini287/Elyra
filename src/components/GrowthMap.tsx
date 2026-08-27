import React, { useState, useEffect } from "react";
import { Journal, GrowthMapData } from "../types";
import { generateGrowthMap } from "../services/geminiService";
import { TrendingUp, Sparkles, RefreshCw, Compass, BarChart3, ArrowUpRight, Flame } from "lucide-react";

interface GrowthMapProps {
  journals: Journal[];
}

export const GrowthMap: React.FC<GrowthMapProps> = ({ journals }) => {
  const [growthData, setGrowthData] = useState<GrowthMapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowthMap = async () => {
    if (journals.length === 0) {
      setGrowthData({
        categories: [
          { name: "Initial Reflection", count: 1, percentage: 100, color: "#8C6D32" },
        ],
        recentThemes: ["First Entry Discovery"],
        trajectoryInsight: "Begin recording your thoughts to witness your intellectual journey and recurring topics take shape.",
        momentumScore: 80,
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateGrowthMap(journals);
      setGrowthData(data);
    } catch (err: any) {
      console.error("[Growth Map Error]", err);
      setError("Failed to synthesize growth map from recent journals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthMap();
  }, [journals.length]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="border-b border-[#E5E2DA] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#C5A059] font-bold mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Temporal Journey Intelligence</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Journal Growth Map
          </h1>
          <p className="text-sm text-[#666158] mt-1">
            Synthesizing thematic evolution and cognitive focus across your {journals.length} private {journals.length === 1 ? "entry" : "entries"}.
          </p>
        </div>

        <button
          onClick={fetchGrowthMap}
          disabled={loading}
          className="px-3.5 py-2 bg-[#FDFCF9] hover:bg-[#F5F2ED] border border-[#E2DDD3] text-[#1A1A1A] rounded-sm text-xs font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C5A059] ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Analyzing..." : "Refresh Insights"}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C2C2] text-[#9B2C2C] text-sm rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="paper-sheet rounded-sm border border-[#E5E2DA] p-12 text-center bg-[#FFFFFF]">
          <Sparkles className="w-8 h-8 text-[#C5A059] animate-spin mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1A1A1A] mb-1">Mapping Cognitive Trajectory</h3>
          <p className="text-xs text-[#8C857B]">
            Gemini is analyzing recurring topics and progress across your personal archive...
          </p>
        </div>
      ) : growthData ? (
        <div className="space-y-8">
          {/* Top Metric Cards: Momentum & Catalog Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF]">
              <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Reflection Momentum</span>
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A1A1A]">
                {growthData.momentumScore || 88}
                <span className="text-sm font-sans font-normal text-[#8C857B]"> / 100</span>
              </div>
              <div className="text-xs text-[#666158] mt-1">Consistency & depth index</div>
            </div>

            <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF]">
              <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-1 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Catalog Density</span>
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A1A1A]">
                {journals.length}
              </div>
              <div className="text-xs text-[#666158] mt-1">User-isolated cloud documents</div>
            </div>

            <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF]">
              <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#3D5A45]" />
                <span>Dominant Focus</span>
              </div>
              <div className="font-serif text-xl font-medium text-[#1A1A1A] truncate">
                {growthData.categories[0]?.name || "Exploration"}
              </div>
              <div className="text-xs text-[#666158] mt-1">
                {growthData.categories[0]?.percentage || 100}% of recorded reflection
              </div>
            </div>
          </div>

          {/* Core Visual: Thematic Distribution Bar Matrix */}
          <div className="paper-sheet rounded-sm border border-[#E2DDD3] p-6 sm:p-8 bg-[#FFFFFF] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059]">
                  YOUR JOURNEY
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                  Cognitive Domain Distribution
                </h3>
              </div>
              <span className="text-[10px] font-sans uppercase tracking-wider font-semibold text-[#8C857B] bg-[#F5F2ED] px-2.5 py-1 rounded">
                Personal Baseline
              </span>
            </div>

            <div className="space-y-6">
              {growthData.categories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans uppercase tracking-wider font-semibold text-[#1A1A1A]">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[#777167]">
                      <span>{cat.count} {cat.count === 1 ? "entry" : "entries"}</span>
                      <span className="font-bold text-[#1A1A1A]">{cat.percentage}%</span>
                    </div>
                  </div>

                  {/* Visual Editorial Bar */}
                  <div className="w-full h-4 bg-[#F5F2ED] rounded-xs overflow-hidden flex border border-[#EAE5DC]">
                    <div
                      className="h-full rounded-xs transition-all duration-1000 ease-out"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || "#C5A059",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Below the visualization: Recent Themes */}
            <div className="mt-8 pt-6 border-t border-[#EAE5DC]">
              <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-3">
                RECENT THEMES
              </div>
              <div className="flex flex-wrap gap-2">
                {growthData.recentThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#FDFCF9] border border-[#E2DDD3] text-[#2C2A26] rounded-sm text-xs font-medium"
                  >
                    • {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Trajectory Evolution Narrative */}
          <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FDFCF9] border-l-3 border-l-[#C5A059]">
            <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Trajectory Evolution</span>
            </div>
            <p className="font-serif text-lg italic text-[#2C2A26] leading-relaxed">
              "{growthData.trajectoryInsight}"
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#8C857B]">
              Synthesized purely from your authenticated session archives. No medical or psychological diagnosis.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
