export interface JournalMessage {
  id: string;
  role: "user" | "gemini";
  text: string;
  timestamp: string;
}

export interface SmartActionItem {
  id: string;
  journalId?: string;
  text: string;
  status: "suggested" | "accepted" | "completed" | "dismissed";
  createdAt?: string;
}

export interface Journal {
  id: string;
  userId: string;
  title: string;
  summary: string;
  messages: JournalMessage[];
  keyPoints: string[];
  actionItems: SmartActionItem[];
  tags: string[];
  sentiment?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItemDocument {
  id: string;
  userId: string;
  journalId?: string;
  journalTitle?: string;
  text: string;
  status: "suggested" | "accepted" | "completed" | "dismissed";
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  sourceJournalId?: string;
  sourceJournalTitle?: string;
  createdAt: string;
}

export interface WeeklyReflection {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
  keyThemes: string[];
  focusedOn: string[];
  lessonsLearned: string[];
  nextSteps: string[];
  summaryNarrative: string;
  createdAt: string;
}

export interface GrowthMapCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GrowthMapData {
  categories: GrowthMapCategory[];
  recentThemes: string[];
  trajectoryInsight: string;
  momentumScore: number;
}

export interface SemanticSearchResult {
  id: string;
  relevanceScore: number;
  matchReason: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemoUser?: boolean;
}

export type TabType =
  | "journal"
  | "history"
  | "growth-map"
  | "action-items"
  | "idea-vault"
  | "weekly-reflection"
  | "security";

export type ActiveTab = TabType;
