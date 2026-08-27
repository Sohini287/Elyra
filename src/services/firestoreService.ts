import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Journal, ActionItemDocument, IdeaItem, WeeklyReflection } from "../types";

/**
 * Strict Zero-Crash Payload Sanitizer:
 * Recursively strips undefined values so that Firestore drivers never throw runtime write errors.
 */
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload) as unknown as T;
  }
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizePayload(value);
    }
  }
  return clean;
}

// ----------------------------------------------------
// 1. JOURNALS: /users/{userId}/journals/{journalId}
// ----------------------------------------------------

export async function saveJournal(userId: string, journal: Journal): Promise<void> {
  if (!userId) throw new Error("Unauthorized: User ID is required to persist journal.");
  const journalRef = doc(db, "users", userId, "journals", journal.id);
  const cleanData = sanitizePayload({
    ...journal,
    userId,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(journalRef, cleanData);
}

export async function getJournals(userId: string): Promise<Journal[]> {
  if (!userId) return [];
  const colRef = collection(db, "users", userId, "journals");
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as Journal);
}

export function subscribeJournals(
  userId: string,
  onData: (journals: Journal[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const colRef = collection(db, "users", userId, "journals");
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const journals = snapshot.docs.map((d) => d.data() as Journal);
      onData(journals);
    },
    (error) => {
      console.error("[Firestore Error] Failed to stream journals:", error);
      if (onError) onError(error);
    }
  );
}

export async function deleteJournal(userId: string, journalId: string): Promise<void> {
  if (!userId || !journalId) throw new Error("Unauthorized: User and Journal ID required.");
  const journalRef = doc(db, "users", userId, "journals", journalId);
  await deleteDoc(journalRef);
}

export async function togglePinJournal(userId: string, journalId: string, currentPin: boolean): Promise<void> {
  if (!userId || !journalId) throw new Error("Unauthorized");
  const journalRef = doc(db, "users", userId, "journals", journalId);
  await updateDoc(journalRef, {
    isPinned: !currentPin,
    updatedAt: new Date().toISOString(),
  });
}

// ----------------------------------------------------
// 2. ACTION ITEMS: /users/{userId}/actionItems/{actionItemId}
// ----------------------------------------------------

export async function saveActionItem(userId: string, item: ActionItemDocument): Promise<void> {
  if (!userId) throw new Error("Unauthorized");
  const itemRef = doc(db, "users", userId, "actionItems", item.id);
  const cleanData = sanitizePayload({
    ...item,
    userId,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(itemRef, cleanData);
}

export function subscribeActionItems(
  userId: string,
  onData: (items: ActionItemDocument[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const colRef = collection(db, "users", userId, "actionItems");
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as ActionItemDocument);
      onData(items);
    },
    (error) => {
      console.error("[Firestore Error] Failed to stream action items:", error);
      if (onError) onError(error);
    }
  );
}

export async function updateActionItemStatus(
  userId: string,
  itemId: string,
  status: "suggested" | "accepted" | "completed" | "dismissed"
): Promise<void> {
  if (!userId || !itemId) throw new Error("Unauthorized");
  const itemRef = doc(db, "users", userId, "actionItems", itemId);
  await updateDoc(itemRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteActionItem(userId: string, itemId: string): Promise<void> {
  if (!userId || !itemId) throw new Error("Unauthorized");
  const itemRef = doc(db, "users", userId, "actionItems", itemId);
  await deleteDoc(itemRef);
}

// ----------------------------------------------------
// 3. IDEA VAULT: /users/{userId}/ideas/{ideaId}
// ----------------------------------------------------

export async function saveIdea(userId: string, idea: IdeaItem): Promise<void> {
  if (!userId) throw new Error("Unauthorized");
  const ideaRef = doc(db, "users", userId, "ideas", idea.id);
  const cleanData = sanitizePayload({
    ...idea,
    userId,
  });
  await setDoc(ideaRef, cleanData);
}

export function subscribeIdeas(
  userId: string,
  onData: (ideas: IdeaItem[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const colRef = collection(db, "users", userId, "ideas");
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const ideas = snapshot.docs.map((d) => d.data() as IdeaItem);
      onData(ideas);
    },
    (error) => {
      console.error("[Firestore Error] Failed to stream ideas:", error);
      if (onError) onError(error);
    }
  );
}

export async function deleteIdea(userId: string, ideaId: string): Promise<void> {
  if (!userId || !ideaId) throw new Error("Unauthorized");
  const ideaRef = doc(db, "users", userId, "ideas", ideaId);
  await deleteDoc(ideaRef);
}

// ----------------------------------------------------
// 4. WEEKLY REFLECTIONS: /users/{userId}/weeklyReflections/{reflectionId}
// ----------------------------------------------------

export async function saveWeeklyReflection(userId: string, reflection: WeeklyReflection): Promise<void> {
  if (!userId) throw new Error("Unauthorized");
  const reflectionRef = doc(db, "users", userId, "weeklyReflections", reflection.id);
  const cleanData = sanitizePayload({
    ...reflection,
    userId,
  });
  await setDoc(reflectionRef, cleanData);
}

export function subscribeWeeklyReflections(
  userId: string,
  onData: (reflections: WeeklyReflection[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const colRef = collection(db, "users", userId, "weeklyReflections");
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const reflections = snapshot.docs.map((d) => d.data() as WeeklyReflection);
      onData(reflections);
    },
    (error) => {
      console.error("[Firestore Error] Failed to stream reflections:", error);
      if (onError) onError(error);
    }
  );
}

// ----------------------------------------------------
// 5. SECURITY SIMULATOR: Proof of Cross-User Rejection
// ----------------------------------------------------

/**
 * Attempts an unauthorized cross-user read to prove Firestore Rules enforce isolation.
 * Expected result: Promise rejects with 'permission-denied'.
 */
export async function attemptUnauthorizedAccess(targetVictimUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const victimRef = collection(db, "users", targetVictimUserId, "journals");
    await getDocs(victimRef);
    return { success: true }; // Should never happen with our security rules!
  } catch (err: any) {
    return {
      success: false,
      error: err?.code || err?.message || "PERMISSION_DENIED: Firebase Security Rules blocked cross-tenant access.",
    };
  }
}
