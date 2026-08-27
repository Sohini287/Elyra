import { Journal, JournalMessage, GrowthMapData, WeeklyReflection, SemanticSearchResult } from "../types";

export interface ChatResponse {
  reply: string;
  modelUsed: string;
}

export interface AnalysisResponse {
  title: string;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{ text: string; status: "suggested" }>;
  tags: string[];
  sentiment: string;
}

export async function sendJournalMessage(
  messages: JournalMessage[],
  userThought?: string
): Promise<ChatResponse> {
  const response = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      userThought,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate reflection response from Gemini.");
  }

  return response.json();
}

export async function analyzeJournalSession(
  messages: JournalMessage[]
): Promise<AnalysisResponse> {
  const response = await fetch("/api/gemini/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to analyze journal session.");
  }

  const data = await response.json();
  return data.analysis;
}

export async function generateGrowthMap(journals: Journal[]): Promise<GrowthMapData> {
  const response = await fetch("/api/gemini/growth-map", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ journals }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate growth map.");
  }

  const data = await response.json();
  return data.growthMap;
}

export async function generateWeeklyReflection(
  journals: Journal[],
  weekLabel: string
): Promise<Omit<WeeklyReflection, "id" | "userId" | "createdAt">> {
  const response = await fetch("/api/gemini/weekly-reflection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ journals, weekLabel }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate weekly reflection.");
  }

  const data = await response.json();
  return {
    weekStartDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    weekEndDate: new Date().toISOString().split("T")[0],
    weekLabel,
    keyThemes: data.reflection.keyThemes || [],
    focusedOn: data.reflection.focusedOn || [],
    lessonsLearned: data.reflection.lessonsLearned || [],
    nextSteps: data.reflection.nextSteps || [],
    summaryNarrative: data.reflection.summaryNarrative || "",
  };
}

export async function performSemanticSearch(
  query: string,
  journals: Journal[]
): Promise<SemanticSearchResult[]> {
  const response = await fetch("/api/gemini/semantic-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, journals }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Semantic search request failed.");
  }

  const data = await response.json();
  return data.matches || [];
}
