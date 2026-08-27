import React, { createContext, useContext, useEffect, useState } from "react";
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoPersona: (persona: "user_a" | "user_b" | "clear") => void;
  activePersona: "google" | "user_a" | "user_b";
  error: string | null;
  clearError: () => void;
}

const DEMO_PERSONAS = {
  user_a: {
    uid: "usr_a_evelyn_vance_8821",
    email: "evelyn.vance@journal.internal",
    displayName: "Dr. Evelyn Vance (User A)",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isDemoUser: true,
  },
  user_b: {
    uid: "usr_b_marcus_sterling_9942",
    email: "marcus.sterling@journal.internal",
    displayName: "Marcus Sterling (User B)",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isDemoUser: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<UserProfile | null>(null);
  const [activePersona, setActivePersona] = useState<"google" | "user_a" | "user_b">("google");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (fUser) => {
        setFirebaseUser(fUser);
        if (fUser && activePersona === "google") {
          setCustomUser({
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName || "Journal Author",
            photoURL: fUser.photoURL,
          });
        } else if (!fUser && activePersona === "google") {
          setCustomUser(null);
        }
        setLoading(false);
      },
      (authErr) => {
        console.error("[Auth State Error]", authErr);
        setError("Failed to establish secure identity session.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activePersona]);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      setActivePersona("google");
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      setCustomUser({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || "Journal Author",
        photoURL: u.photoURL,
      });
    } catch (err: any) {
      console.error("[Google Sign-In Error]", err);
      // If popup was closed by user or blocked in preview iframe, provide clear explanation
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completion.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domain not authorized in Firebase Console yet. Use test personas or authorize domain.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (firebaseUser) {
        await fbSignOut(auth);
      }
      setCustomUser(null);
      setActivePersona("google");
    } catch (err: any) {
      console.error("[Sign Out Error]", err);
      setError("Sign out failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchDemoPersona = (persona: "user_a" | "user_b" | "clear") => {
    if (persona === "clear") {
      setActivePersona("google");
      if (firebaseUser) {
        setCustomUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setCustomUser(null);
      }
    } else {
      setActivePersona(persona);
      setCustomUser(DEMO_PERSONAS[persona]);
    }
  };

  const clearError = () => setError(null);

  const currentUser = customUser || (firebaseUser ? {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || "Journal Author",
    photoURL: firebaseUser.photoURL,
  } : null);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        firebaseUser,
        loading,
        signInWithGoogle,
        signOut,
        switchDemoPersona,
        activePersona,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
