import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { JournalEditor } from "./components/JournalEditor";
import { JournalArchive } from "./components/JournalArchive";
import { GrowthMap } from "./components/GrowthMap";
import { SmartActionItems } from "./components/SmartActionItems";
import { WeeklyReflectionView } from "./components/WeeklyReflectionView";
import { IdeaVault } from "./components/IdeaVault";
import { SecurityCenter } from "./components/SecurityCenter";
import {
  subscribeJournals,
  subscribeActionItems,
  subscribeIdeas,
} from "./services/firestoreService";
import { Journal, ActionItemDocument, IdeaItem, TabType } from "./types";
import { ShieldCheck, Info } from "lucide-react";

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("journal");

  // Real-time Firestore State for Authenticated User
  const [journals, setJournals] = useState<Journal[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemDocument[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Subscribe to authenticated user's isolated subcollections
  useEffect(() => {
    if (!user) {
      setJournals([]);
      setActionItems([]);
      setIdeas([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubJournals = subscribeJournals(user.uid, (data) => {
      setJournals(data);
      setDataLoading(false);
    });

    const unsubActionItems = subscribeActionItems(user.uid, (data) => {
      setActionItems(data);
    });

    const unsubIdeas = subscribeIdeas(user.uid, (data) => {
      setIdeas(data);
    });

    return () => {
      unsubJournals();
      unsubActionItems();
      unsubIdeas();
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#8C6D32] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-serif text-lg text-[#1F1E1B]">
            Securing Personal Journal Vault...
          </div>
          <div className="font-mono text-xs text-[#8C857B]">
            Verifying cryptographic identity & Firestore token
          </div>
        </div>
      </div>
    );
  }

  // If not signed in, show luxury editorial landing page
  if (!user) {
    return <LandingPage onGetStarted={() => {}} />;
  }

  const pendingActionsCount = actionItems.filter(
    (a) => a.status === "suggested" || a.status === "accepted"
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col selection:bg-[#E8D4B5] selection:text-[#1F1E1B]">
      {/* Navigation Header with Persona Switcher */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        journalCount={journals.length}
        actionCount={pendingActionsCount}
      />

      {/* Persona Isolation Indicator Banner */}
      <div className="bg-[#FAF3E8] border-b border-[#E8DFC8] px-4 py-1.5 text-xs text-[#7A5E2E] flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3D5A45] animate-pulse" />
            <span className="font-mono text-[11px]">
              Active Session: <strong className="text-[#1F1E1B]">{user.displayName || "User"}</strong> (UID: <code className="text-[10px]">{user.uid.slice(0, 16)}...</code>)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#8C6D32]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Path: /users/{user.uid.slice(0, 8)}/* (Zero-Cross Access Enforced)</span>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === "journal" && (
          <JournalEditor
            onJournalSaved={() => {
              setActiveTab("history");
            }}
          />
        )}

        {activeTab === "history" && <JournalArchive journals={journals} />}

        {activeTab === "growth-map" && <GrowthMap journals={journals} />}

        {activeTab === "action-items" && <SmartActionItems actionItems={actionItems} />}

        {activeTab === "weekly-reflection" && <WeeklyReflectionView journals={journals} />}

        {activeTab === "idea-vault" && <IdeaVault ideas={ideas} />}

        {activeTab === "security" && <SecurityCenter />}
      </main>

      {/* Luxury Editorial Footer */}
      <footer className="border-t border-[#EAE3D6] bg-[#FFFFFF] py-6 px-4 text-center text-xs text-[#8C857B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-serif italic text-sm text-[#1F1E1B]">
            Personal Gemini Journal — Curated Thought Intelligence & Zero-Trust Security
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Model Ladder: gemini-3.7-flash ➔ gemini-3.1-flash-lite</span>
            <span>•</span>
            <span>Firestore Rules: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
