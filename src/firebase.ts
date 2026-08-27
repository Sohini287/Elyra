import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../firebase-applet-config.json";

// Public Firebase Client Configuration
// NOTE: Firebase web configuration parameters (appId, projectId, authDomain) are public client identifiers,
// NOT secret API keys. Actual secret API keys (such as GEMINI_API_KEY) are kept exclusively on the server.
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// If a dedicated databaseId is specified in configuration, connect to it
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export default app;
