import React, { useState, useMemo } from "react";
import { Journal, SemanticSearchResult } from "../types";
import { togglePinJournal, deleteJournal } from "../services/firestoreService";
import { performSemanticSearch } from "../services/geminiService";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Sparkles,
  Pin,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
  ArrowUpRight,
  X,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  ListTodo,
} from "lucide-react";

interface JournalArchiveProps {
  journals: Journal[];
  onSelectJournal?: (journal: Journal) => void;
}

export const JournalArchive: React.FC<JournalArchiveProps> = ({ journals }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    journals.forEach((j) => {
      j.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [journals]);

  // Execute Semantic Search via Gemini
  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !isSemanticMode) return;

    setSemanticLoading(true);
    try {
      const results = await performSemanticSearch(searchQuery, journals);
      setSemanticResults(results);
    } catch (err) {
      console.error("[Semantic Search Error]", err);
    } finally {
      setSemanticLoading(false);
    }
  };

  // Filtered Journals List
  const filteredJournals = useMemo(() => {
    if (isSemanticMode && semanticResults.length > 0) {
      const idMap = new Map<string, SemanticSearchResult>(
        semanticResults.map((r) => [r.id, r])
      );
      return journals
        .filter((j) => idMap.has(j.id))
        .sort((a, b) => {
          const scoreA = idMap.get(a.id)?.relevanceScore || 0;
          const scoreB = idMap.get(b.id)?.relevanceScore || 0;
          return scoreB - scoreA;
        });
    }

    return journals.filter((j) => {
      const matchesQuery =
        searchQuery === "" ||
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === null || (j.tags && j.tags.includes(selectedTag));

      return matchesQuery && matchesTag;
    });
  }, [journals, searchQuery, selectedTag, isSemanticMode, semanticResults]);

  // Pin Toggle
  const handleTogglePin = async (e: React.MouseEvent, j: Journal) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await togglePinJournal(user.uid, j.id, !!j.isPinned);
    } catch (err) {
      console.error("Failed to pin journal", err);
    }
  };

  // Delete Journal
  const handleDelete = async (e: React.MouseEvent, journalId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteJournal(user.uid, journalId);
      setDeleteConfirmId(null);
      if (selectedJournal?.id === journalId) {
        setSelectedJournal(null);
      }
    } catch (err) {
      console.error("Failed to delete journal", err);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Archive Header */}
      <div className="border-b border-[#E5E2DA] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#C5A059] font-bold mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Curated History</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Journal Archive
          </h1>
          <p className="text-sm text-[#666158] mt-1">
            {journals.length} {journals.length === 1 ? "entry" : "entries"} preserved in your private collection.
          </p>
        </div>

        {/* Search Bar & Semantic Search Toggle */}
        <div className="w-full sm:w-auto">
          <form onSubmit={handleSemanticSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isSemanticMode
                    ? "Ask in natural language (e.g. 'When did I discuss latency?')"
                    : "Search title, keywords, or summary..."
                }
                className="w-full sm:w-80 bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm pl-9 pr-3.5 py-2 text-xs text-[#1A1A1A] placeholder-[#9E988D] focus:border-[#C5A059] focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSemanticMode(!isSemanticMode);
                setSemanticResults([]);
              }}
              className={`px-3 py-2 rounded-sm text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isSemanticMode
                  ? "bg-[#C5A059] text-white border-[#C5A059]"
                  : "bg-[#FDFCF9] text-[#666158] border-[#E2DDD3] hover:bg-[#F5F2ED]"
              }`}
              title="Feature 5: Semantic Journal Search using Gemini embeddings"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSemanticMode ? "Semantic Active" : "Semantic Search"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-[#EAE5DC]">
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mr-1">
            Filter:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
              selectedTag === null
                ? "bg-[#1A1A1A] text-[#FDFCF9] font-medium"
                : "bg-[#F5F2ED] text-[#666158] hover:bg-[#EDE8E0]"
            }`}
          >
            All Entries
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                selectedTag === tag
                  ? "bg-[#C5A059] text-white font-medium"
                  : "bg-[#F5F2ED] text-[#666158] hover:bg-[#EDE8E0]"
              }`}
            >
              <span>#{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Semantic Results Notification */}
      {isSemanticMode && semanticResults.length > 0 && (
        <div className="mb-6 p-3 bg-[#FDFBF7] border border-[#E8DCC8] rounded-sm text-xs text-[#C5A059] flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>
              Semantic search found {semanticResults.length} matching {semanticResults.length === 1 ? "entry" : "entries"}.
            </span>
          </div>
          <button
            onClick={() => {
              setSemanticResults([]);
              setSearchQuery("");
            }}
            className="font-mono text-[11px] underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Journals Grid / List */}
      {filteredJournals.length === 0 ? (
        <div className="p-12 text-center paper-sheet rounded-sm border border-[#E5E2DA] bg-[#FFFFFF]">
          <Clock className="w-10 h-10 text-[#C4BCAF] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1A1A1A] mb-1">No Journals Found</h3>
          <p className="text-xs text-[#8C857B] max-w-sm mx-auto">
            {searchQuery || selectedTag
              ? "No journals match your active search or tag criteria."
              : "Your journal history is currently empty. Start your first reflection session."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJournals.map((journal) => {
            const isDeleting = deleteConfirmId === journal.id;
            const semanticMatch = semanticResults.find((r) => r.id === journal.id);

            return (
              <div
                key={journal.id}
                onClick={() => setSelectedJournal(journal)}
                className={`paper-sheet rounded-sm border p-6 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer relative group ${
                  journal.isPinned
                    ? "border-[#C5A059] bg-[#FCFAF5]"
                    : "border-[#E2DDD3] bg-[#FFFFFF] hover:border-[#C5A059]/40"
                }`}
              >
                <div>
                  {/* Top Bar: Date + Pin + Actions */}
                  <div className="flex items-center justify-between mb-3 border-b border-[#EAE5DC] pb-2">
                    <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059]">
                      {formatDate(journal.createdAt)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleTogglePin(e, journal)}
                        className={`p-1 rounded-xs transition-colors cursor-pointer ${
                          journal.isPinned
                            ? "text-[#C5A059]"
                            : "text-[#C4BCAF] hover:text-[#C5A059] opacity-0 group-hover:opacity-100"
                        }`}
                        title={journal.isPinned ? "Unpin entry" : "Pin entry to top"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(isDeleting ? null : journal.id);
                        }}
                        className="p-1 text-[#C4BCAF] hover:text-[#B91C1C] rounded-xs transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Delete journal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Alert */}
                  {isDeleting && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mb-4 p-3 bg-[#FDF2F2] border border-[#F5C2C2] rounded-sm text-xs text-[#9B2C2C] flex items-center justify-between"
                    >
                      <span>Permanently delete this entry?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDelete(e, journal.id)}
                          className="px-2 py-1 bg-[#B91C1C] text-white rounded-xs font-mono text-[10px] uppercase font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-[#EAE4DC] text-[#333] rounded-xs font-mono text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Journal Title */}
                  <h3 className="font-serif text-xl font-medium text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#C5A059] transition-colors">
                    {journal.title}
                  </h3>

                  {/* Journal Summary */}
                  <p className="text-xs text-[#666158] leading-relaxed line-clamp-3 mb-4">
                    {journal.summary}
                  </p>

                  {/* Semantic match reason if applicable */}
                  {semanticMatch && (
                    <div className="mb-4 p-2 bg-[#FDFBF7] border border-[#E8DCC8] rounded-sm text-[11px] text-[#C5A059] italic">
                      Match insight: {semanticMatch.matchReason}
                    </div>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {journal.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#F5F2ED] text-[#666158] text-[10px] font-mono rounded-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {(journal.tags?.length || 0) > 3 && (
                      <span className="text-[10px] text-[#999287]">
                        +{journal.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#8C857B]">
                    {journal.actionItems && journal.actionItems.length > 0 && (
                      <span className="flex items-center gap-1 text-[#3D5A45]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{journal.actionItems.length}</span>
                      </span>
                    )}
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Journal Modal View */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFCF9] border border-[#E2DDD3] rounded-sm shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5E2DA] flex items-start justify-between gap-4 bg-[#FFFFFF]">
              <div>
                <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-1">
                  {formatDate(selectedJournal.createdAt)} · DOCUMENT ID: {selectedJournal.id}
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] leading-tight">
                  {selectedJournal.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-[#7A746B] hover:text-[#1A1A1A] hover:bg-[#F5F2ED] rounded-sm transition-colors cursor-pointer"
                  title="Print or export entry"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedJournal(null)}
                  className="p-2 text-[#7A746B] hover:text-[#1A1A1A] hover:bg-[#F5F2ED] rounded-sm transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
              {/* Executive Summary */}
              <div className="p-5 bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm">
                <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-1">
                  Executive Reflection
                </div>
                <p className="text-sm text-[#2C2A26] leading-relaxed">
                  {selectedJournal.summary}
                </p>
              </div>

              {/* Key Discoveries */}
              {selectedJournal.keyPoints && selectedJournal.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-serif text-lg text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-[#C5A059]" />
                    <span>Key Discoveries</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedJournal.keyPoints.map((kp, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FFFFFF] border border-[#E5E0D5] rounded-sm text-xs text-[#2C2A26] flex items-start gap-2"
                      >
                        <span className="text-[#C5A059] font-serif font-bold">•</span>
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Action Items */}
              {selectedJournal.actionItems && selectedJournal.actionItems.length > 0 && (
                <div>
                  <h4 className="font-serif text-lg text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3D5A45]" />
                    <span>Action Items</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedJournal.actionItems.map((ai, idx) => (
                      <div
                        key={ai.id || idx}
                        className="p-3 bg-[#FFFFFF] border border-[#E5E0D5] rounded-sm text-xs text-[#2C2A26] flex items-center justify-between"
                      >
                        <span>{ai.text}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#F5F2ED] text-[#C5A059]">
                          {ai.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Multi-Turn Transcript */}
              <div>
                <h4 className="font-serif text-lg text-[#1A1A1A] mb-3">Dialogue Transcript</h4>
                <div className="space-y-4">
                  {selectedJournal.messages.map((m, i) => (
                    <div
                      key={m.id || i}
                      className={`p-4 rounded-sm border ${
                        m.role === "user"
                          ? "bg-[#FDFCF9] border-[#E5E0D5]"
                          : "bg-[#FFFFFF] border-[#E2DDD3] border-l-2 border-l-[#C5A059]"
                      }`}
                    >
                      <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-1">
                        {m.role === "user" ? "Author" : "Gemini Reflection"}
                      </div>
                      <div className="text-sm leading-relaxed text-[#1A1A1A] whitespace-pre-wrap">
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E2DA] bg-[#FFFFFF] flex items-center justify-between text-xs font-mono text-[#8C857B]">
              <div className="flex items-center gap-2">
                <span>Tags:</span>
                {selectedJournal.tags?.map((t, idx) => (
                  <span key={idx} className="bg-[#F5F2ED] px-1.5 py-0.5 rounded text-[10px]">
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="px-4 py-1.5 bg-[#1A1A1A] text-[#FDFCF9] rounded-sm text-xs font-medium cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
