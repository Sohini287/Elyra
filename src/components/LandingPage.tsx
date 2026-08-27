import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Compass,
  CheckCircle2,
  Lightbulb,
  Calendar,
  KeyRound,
  UserCheck,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, switchDemoPersona, loading, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] flex flex-col justify-between selection:bg-[#F5F2ED] selection:text-[#C5A059]">
      {/* Top Header */}
      <header className="border-b border-[#E5E2DA] bg-[#FDFCF9]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#1A1A1A] text-[#FDFCF9] flex items-center justify-center font-serif text-lg font-bold">
              E
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-wider uppercase text-[#1A1A1A]">
                Elyra
              </span>
              <span className="block text-[9px] font-sans uppercase tracking-[0.25em] text-[#C5A059] font-bold">
                Zero-Trust Private Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-[#FDFCF9] hover:bg-[#2C2A26] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        {error && (
          <div className="w-full max-w-xl mb-8 p-4 bg-[#FDF2F2] border border-[#F5C2C2] text-[#9B2C2C] text-sm rounded-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="font-mono text-xs underline cursor-pointer ml-2">Dismiss</button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F2ED] text-[#C5A059] text-[10px] font-sans uppercase tracking-[0.2em] font-bold mb-8 border border-[#E5E0D5]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Private by Design · User-Isolated Firestore · Server-Side Gemini</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.08] tracking-tight text-[#1A1A1A] max-w-4xl mb-6">
          Your thoughts deserve <br />
          <span className="italic font-light text-[#C5A059]">a private place to grow.</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#666158] font-normal leading-relaxed max-w-2xl mb-10">
          A private AI-powered journal for deep reflection, structured brainstorming, and turning raw thoughts into tangible action—backed by strict cryptographic user isolation.
        </p>

        {/* Primary CTA Box */}
        <div className="w-full max-w-md p-6 paper-sheet rounded-sm border border-[#E2DDD3] mb-12 bg-[#FFFFFF] shadow-sm">
          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-[#1A1A1A] text-[#FDFCF9] hover:bg-[#2C2A26] rounded-sm text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
              />
            </svg>
            <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>

          <div className="mt-4 pt-4 border-t border-[#EAE5DC] text-center">
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#C5A059] mb-2.5">
              Or Explore with Demo Personas (Security Testing)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => switchDemoPersona("user_a")}
                className="px-3 py-2 bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#2C2A26] rounded-sm text-xs font-medium border border-[#E2DDD3] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
                <span>Dr. Evelyn (User A)</span>
              </button>
              <button
                onClick={() => switchDemoPersona("user_b")}
                className="px-3 py-2 bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#2C2A26] rounded-sm text-xs font-medium border border-[#E2DDD3] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-[#3D5A45]"></div>
                <span>Marcus (User B)</span>
              </button>
            </div>
            <p className="text-[11px] text-[#8C857B] mt-2 italic">
              Demonstrates guaranteed Firestore document isolation between two distinct user UIDs.
            </p>
          </div>
        </div>

        {/* 5 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-5xl mt-6">
          <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF]">
            <div className="w-10 h-10 rounded-sm bg-[#F5F2ED] text-[#C5A059] flex items-center justify-center mb-4 border border-[#E5E0D5]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-2">
              Strict User Isolation
            </h3>
            <p className="text-sm text-[#666158] leading-relaxed">
              Every journal is locked into <code className="font-mono text-xs bg-[#F5F2ED] px-1 py-0.5 rounded text-[#C5A059] border border-[#E5E0D5]">/users/&#123;uid&#125;/...</code> subcollections and defended by kernel-level Firestore Security Rules.
            </p>
          </div>

          <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF]">
            <div className="w-10 h-10 rounded-sm bg-[#F5F2ED] text-[#C5A059] flex items-center justify-center mb-4 border border-[#E5E0D5]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-2">
              Server-Side Gemini AI
            </h3>
            <p className="text-sm text-[#666158] leading-relaxed">
              Multi-turn conversational reflections, automatic key-point summaries, and actionable extractions. Zero API keys exposed to the browser.
            </p>
          </div>

          <div className="p-6 paper-sheet rounded-sm border border-[#E2DDD3] bg-[#FFFFFF]">
            <div className="w-10 h-10 rounded-sm bg-[#F5F2ED] text-[#C5A059] flex items-center justify-center mb-4 border border-[#E5E0D5]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-2">
              Growth Map & Vault
            </h3>
            <p className="text-sm text-[#666158] leading-relaxed">
              AI-synthesized topic distributions, weekly progress reflections, and an Idea Vault to preserve creative breakthroughs over time.
            </p>
          </div>
        </div>

        {/* Security Statement Footer */}
        <div className="mt-16 pt-8 border-t border-[#E5E2DA] w-full flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8C857B] gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3D5A45]"></span>
            <span>Zero Insecure Defaults · No Mock Credentials</span>
          </div>
          <div>
            Built with Google AI Studio & Firebase Firestore
          </div>
        </div>
      </main>
    </div>
  );
};

