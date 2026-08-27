import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ActiveTab } from "../types";
import {
  PenLine,
  BookOpen,
  TrendingUp,
  CheckSquare,
  Lightbulb,
  CalendarDays,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Users,
  ChevronDown,
  Lock,
} from "lucide-react";

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  journalCount: number;
  actionCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  journalCount,
  actionCount,
}) => {
  const { user, signOut, switchDemoPersona, activePersona } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: "journal", label: "Journal", icon: <PenLine className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <BookOpen className="w-4 h-4" />, badge: journalCount },
    { id: "growth-map", label: "Growth Map", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "action-items", label: "Action Items", icon: <CheckSquare className="w-4 h-4" />, badge: actionCount },
    { id: "idea-vault", label: "Idea Vault", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "weekly-reflection", label: "Weekly Reflection", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <ShieldAlert className="w-4 h-4 text-[#8C6D32]" /> },
  ];

  return (
    <nav className="border-b border-[#E5E2DA] bg-[#FDFCF9]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Monogram */}
          <div
            onClick={() => setActiveTab("journal")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] text-[#FDFCF9] flex items-center justify-center font-serif text-xl font-bold shadow-xs transition-transform group-hover:scale-105">
              E
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-wider uppercase text-[#1A1A1A] block">
                Elyra
              </span>
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                Editorial AI Workspace
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-sm text-xs font-medium tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F5F2ED] text-[#1A1A1A] font-semibold shadow-xs border border-[#E2DDD3]"
                      : "text-[#666158] hover:bg-[#F5F2ED]/70 hover:text-[#1A1A1A]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-[#1A1A1A] text-[#FDFCF9]" : "bg-[#E5E0D5] text-[#4A453E]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side: Persona Switcher + Profile + Sign Out */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Security Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="px-2.5 py-1.5 bg-[#F5F2ED] hover:bg-[#EDE8E0] border border-[#E2DDD3] rounded-sm text-xs font-mono text-[#2C2A26] flex items-center gap-1.5 cursor-pointer"
                title="Switch persona to test cross-user Firestore security isolation"
              >
                <Lock className="w-3 h-3 text-[#C5A059]" />
                <span className="truncate max-w-[120px]">
                  {activePersona === "user_a"
                    ? "User A (Evelyn)"
                    : activePersona === "user_b"
                    ? "User B (Marcus)"
                    : "Google Account"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#777167]" />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#E2DDD3] rounded-sm shadow-lg py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[9px] font-sans uppercase tracking-[0.2em] text-[#C5A059] font-bold border-b border-[#F5F2ED]">
                    Live Isolation Test Switcher
                  </div>
                  <button
                    onClick={() => {
                      switchDemoPersona("user_a");
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#FDFCF9] flex items-center gap-2 cursor-pointer ${
                      activePersona === "user_a" ? "font-semibold text-[#C5A059] bg-[#F5F2ED]/60" : "text-[#2C2A26]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
                    <div>
                      <div className="font-sans">Dr. Evelyn Vance (User A)</div>
                      <div className="text-[10px] text-[#8C857B] font-mono">UID: usr_a_evelyn_8821</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoPersona("user_b");
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#FDFCF9] flex items-center gap-2 cursor-pointer ${
                      activePersona === "user_b" ? "font-semibold text-[#3D5A45] bg-[#F5F2ED]/60" : "text-[#2C2A26]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3D5A45]"></span>
                    <div>
                      <div className="font-sans">Marcus Sterling (User B)</div>
                      <div className="text-[10px] text-[#8C857B] font-mono">UID: usr_b_marcus_9942</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoPersona("clear");
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#FDFCF9] flex items-center gap-2 cursor-pointer border-t border-[#F5F2ED] ${
                      activePersona === "google" ? "font-semibold text-[#1A1A1A] bg-[#F5F2ED]/60" : "text-[#5C574F]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#1A1A1A]"></span>
                    <div>
                      <div className="font-sans">Live Google Sign-In UID</div>
                      <div className="text-[10px] text-[#8C857B] font-mono">
                        {user?.uid ? `${user.uid.slice(0, 12)}...` : "Authenticated"}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-[#D5CCC0] object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E5E0D5] text-[#1A1A1A] flex items-center justify-center text-xs font-serif font-bold">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="p-2 text-[#7A746B] hover:text-[#1A1A1A] hover:bg-[#F5F2ED] rounded-sm transition-colors cursor-pointer"
              title="Sign out of current identity"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] hover:bg-[#F5F2ED] rounded-sm cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E2DA] bg-[#FDFCF9] px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-sm text-sm font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? "bg-[#F5F2ED] text-[#1A1A1A] font-semibold"
                  : "text-[#666158] hover:bg-[#F5F2ED]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#1A1A1A] text-[#FDFCF9]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-[#E5E2DA] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#666158]">
              <span className="font-mono">Active UID:</span>
              <span className="font-mono font-medium text-[#1A1A1A]">{user?.uid?.slice(0, 10)}...</span>
            </div>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F2ED] hover:bg-[#EAE5DC] text-xs font-medium rounded-sm text-[#1A1A1A]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
