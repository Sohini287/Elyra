import React, { useState } from "react";
import { IdeaItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { saveIdea, deleteIdea } from "../services/firestoreService";
import {
  Lightbulb,
  Plus,
  Trash2,
  Search,
  Tag,
  Share2,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";

interface IdeaVaultProps {
  ideas: IdeaItem[];
}

export const IdeaVault: React.FC<IdeaVaultProps> = ({ ideas }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Innovation");

  const categories = Array.from(new Set(ideas.map((i) => i.category || "General")));

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      searchQuery === "" ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    try {
      const newIdea: IdeaItem = {
        id: `idea_${Date.now()}`,
        userId: user.uid,
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory.trim() || "Innovation",
        createdAt: new Date().toISOString(),
      };

      await saveIdea(user.uid, newIdea);
      setNewTitle("");
      setNewDesc("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to save idea", err);
    }
  };

  const handleDelete = async (ideaId: string) => {
    if (!user) return;
    try {
      await deleteIdea(user.uid, ideaId);
    } catch (err) {
      console.error("Failed to delete idea", err);
    }
  };

  const handleCopy = (idea: IdeaItem) => {
    navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="border-b border-[#E5E2DA] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#C5A059] font-bold mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Creative Breakthroughs</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Idea Vault
          </h1>
          <p className="text-sm text-[#666158] mt-1">
            Preserve and organize spark moments, research concepts, and product ideas.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#2C2A26] text-[#FDFCF9] rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>New Idea</span>
        </button>
      </div>

      {/* Controls: Search + Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search idea vault..."
            className="w-full bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm pl-9 pr-3.5 py-1.5 text-xs text-[#1A1A1A] placeholder-[#9E988D] focus:border-[#C5A059] focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-[#8C857B] absolute left-3 top-2" />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                selectedCategory === null
                  ? "bg-[#1A1A1A] text-[#FDFCF9] font-medium"
                  : "bg-[#F5F2ED] text-[#666158] hover:bg-[#EDE8E0]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#C5A059] text-white font-medium"
                    : "bg-[#F5F2ED] text-[#666158] hover:bg-[#EDE8E0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Idea Modal Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateIdea}
          className="paper-sheet rounded-sm border border-[#E2DDD3] p-6 bg-[#FFFFFF] mb-8 shadow-md"
        >
          <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-3">
            Add New Concept to Vault
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#666158] mb-1">
                Idea Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. AI Campus Navigator, Multi-Agent Memory Graph..."
                className="w-full bg-[#FDFCF9] border border-[#E2DDD3] rounded-sm px-3 py-2 text-base font-serif text-[#1A1A1A] focus:border-[#C5A059] focus:outline-hidden"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#666158] mb-1">
                Category
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. AI Architecture, Deep Work, Cryptography"
                className="w-full bg-[#FDFCF9] border border-[#E2DDD3] rounded-sm px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#666158] mb-1">
                Concept Details & Thesis
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                placeholder="Describe why this idea matters, implementation mechanics, or open questions..."
                className="w-full bg-[#FDFCF9] border border-[#E2DDD3] rounded-sm px-3 py-2 text-xs text-[#2C2A26] leading-relaxed focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-2 text-xs text-[#666158] hover:text-[#1A1A1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-5 py-2 bg-[#1A1A1A] text-[#FDFCF9] rounded-sm text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Save to Vault
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Numbered Editorial Idea Cards */}
      {filteredIdeas.length === 0 ? (
        <div className="p-12 text-center paper-sheet rounded-sm border border-[#E5E2DA] bg-[#FFFFFF]">
          <Lightbulb className="w-8 h-8 text-[#C4BCAF] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1A1A1A] mb-1">No Ideas in Vault</h3>
          <p className="text-xs text-[#8C857B] max-w-sm mx-auto">
            Save insights directly from your journal dialogues or click "+ New Idea" above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea, index) => {
            const indexNumber = String(index + 1).padStart(2, "0");
            const isCopied = copiedId === idea.id;

            return (
              <div
                key={idea.id}
                className="paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF] p-6 flex flex-col justify-between hover:border-[#C5A059]/50 transition-all group"
              >
                <div>
                  {/* Top: Editorial Number + Category */}
                  <div className="flex items-center justify-between mb-4 border-b border-[#EAE5DC] pb-2">
                    <span className="font-serif text-2xl font-normal text-[#C5A059]">
                      {indexNumber}
                    </span>
                    <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-[#F5F2ED] text-[#666158] px-2 py-0.5 rounded">
                      {idea.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-xl font-medium text-[#1A1A1A] mb-2 leading-snug">
                    {idea.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#666158] leading-relaxed mb-4">
                    {idea.description}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-[#8C857B]">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(idea)}
                      className="p-1.5 text-[#8C857B] hover:text-[#1A1A1A] rounded-xs transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#3D5A45]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="p-1.5 text-[#C4BCAF] hover:text-[#B91C1C] rounded-xs transition-colors cursor-pointer"
                      title="Delete idea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
