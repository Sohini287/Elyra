import React, { useState } from "react";
import { ActionItemDocument } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  saveActionItem,
  updateActionItemStatus,
  deleteActionItem,
} from "../services/firestoreService";
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Filter,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface SmartActionItemsProps {
  actionItems: ActionItemDocument[];
}

export const SmartActionItems: React.FC<SmartActionItemsProps> = ({ actionItems }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "suggested" | "accepted" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newActionText, setNewActionText] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const filteredItems = actionItems.filter((item) => {
    if (filter === "all") return item.status !== "dismissed";
    return item.status === filter;
  });

  const handleStatusChange = async (
    item: ActionItemDocument,
    newStatus: "suggested" | "accepted" | "completed" | "dismissed"
  ) => {
    if (!user) return;
    try {
      await updateActionItemStatus(user.uid, item.id, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user) return;
    try {
      await deleteActionItem(user.uid, itemId);
    } catch (err) {
      console.error("Failed to delete action item", err);
    }
  };

  const handleSaveEdit = async (item: ActionItemDocument) => {
    if (!user || !editText.trim()) return;
    try {
      await saveActionItem(user.uid, {
        ...item,
        text: editText.trim(),
        updatedAt: new Date().toISOString(),
      });
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save edit", err);
    }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newActionText.trim()) return;
    try {
      await saveActionItem(user.uid, {
        id: `act_manual_${Date.now()}`,
        userId: user.uid,
        text: newActionText.trim(),
        status: "accepted",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNewActionText("");
      setIsAddingNew(false);
    } catch (err) {
      console.error("Failed to add manual action item", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="border-b border-[#EAE3D6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono tracking-widest text-[#8C6D32] uppercase mb-1 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Intent to Action</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F1E1B]">
            Smart Action Items
          </h1>
          <p className="text-sm text-[#5C574F] mt-1">
            Actionable commitments extracted by Gemini during your reflective dialogues.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-[#1F1E1B] hover:bg-[#34322D] text-[#FAF8F5] rounded-sm text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C9A96E]" />
          <span>New Action</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#F0EBE2] pb-3 text-xs">
        <span className="text-[#8C857B] font-mono uppercase tracking-wider text-[10px] mr-2">
          Status:
        </span>
        {(["all", "suggested", "accepted", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-sm capitalize transition-colors cursor-pointer ${
              filter === tab
                ? "bg-[#1F1E1B] text-[#FAF8F5] font-semibold"
                : "bg-[#FAF8F5] text-[#5C574F] hover:bg-[#EAE4DC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Manual Quick Add Form */}
      {isAddingNew && (
        <form onSubmit={handleAddNew} className="paper-sheet rounded-sm border border-[#D5CCC0] p-4 bg-[#FFFFFF] mb-6 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D32] mb-2">
            Create Custom Action Item
          </div>
          <input
            type="text"
            value={newActionText}
            onChange={(e) => setNewActionText(e.target.value)}
            placeholder="What commitment would you like to track?"
            className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-sm px-3 py-2 text-sm text-[#1F1E1B] focus:border-[#8C6D32] focus:outline-hidden mb-3"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-[#6C675F] hover:text-[#1F1E1B] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newActionText.trim()}
              className="px-4 py-1.5 bg-[#1F1E1B] text-[#FAF8F5] rounded-sm text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              Add Action
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center paper-sheet rounded-sm border border-[#EAE3D6]">
          <CheckSquare className="w-8 h-8 text-[#C4BCAF] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1F1E1B] mb-1">No Action Items</h3>
          <p className="text-xs text-[#8C857B] max-w-sm mx-auto">
            {filter === "all"
              ? "Reflect in your journal, and Gemini will automatically extract suggested action items here."
              : `No action items currently marked as ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isEditing = editingId === item.id;
            const isCompleted = item.status === "completed";
            const isSuggested = item.status === "suggested";
            const isAccepted = item.status === "accepted";

            return (
              <div
                key={item.id}
                className={`paper-sheet rounded-sm border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? "bg-[#F7F9F7] border-[#D1E3D6] opacity-75"
                    : isSuggested
                    ? "bg-[#FCFAF7] border-[#E8DFC8]"
                    : "bg-[#FFFFFF] border-[#E0D7C8]"
                }`}
              >
                {/* Left Side: Checkbox / Status + Text */}
                <div className="flex items-start sm:items-center gap-3 flex-1">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        item,
                        isCompleted ? "accepted" : "completed"
                      )
                    }
                    className={`w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors mt-0.5 sm:mt-0 ${
                      isCompleted
                        ? "bg-[#3D5A45] border-[#3D5A45] text-white"
                        : "border-[#BDB5A7] hover:border-[#8C6D32] bg-[#FAF8F5]"
                    }`}
                    title={isCompleted ? "Mark active" : "Mark completed"}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#8C6D32] rounded-sm px-2.5 py-1 text-xs text-[#1F1E1B] focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleSaveEdit(item)}
                        className="p-1 text-[#3D5A45] hover:bg-[#EAE4DC] rounded-xs cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-[#8C857B] hover:bg-[#EAE4DC] rounded-xs cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span
                        className={`text-sm leading-snug ${
                          isCompleted ? "line-through text-[#7A756D]" : "text-[#1F1E1B]"
                        }`}
                      >
                        {item.text}
                      </span>
                      {item.journalTitle && (
                        <div className="text-[10px] font-mono text-[#8C857B] mt-0.5">
                          Source: {item.journalTitle}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Status Badge + Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ECE4D8]">
                  {isSuggested ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStatusChange(item, "accepted")}
                        className="px-2.5 py-1 bg-[#3D5A45] text-white hover:bg-[#2F4736] rounded-xs text-[10px] font-mono uppercase font-semibold cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(item, "dismissed")}
                        className="px-2 py-1 bg-[#F3EFEA] text-[#6C675F] hover:bg-[#EAE4DC] rounded-xs text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                        isCompleted
                          ? "bg-[#3D5A45]/15 text-[#244E35]"
                          : "bg-[#EFE9DF] text-[#7A5E2E]"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}

                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditText(item.text);
                      }}
                      className="p-1 text-[#8C857B] hover:text-[#1F1E1B] rounded-xs transition-colors cursor-pointer"
                      title="Edit text"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-[#C4BCAF] hover:text-[#B91C1C] rounded-xs transition-colors cursor-pointer"
                    title="Delete item"
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
  );
};
