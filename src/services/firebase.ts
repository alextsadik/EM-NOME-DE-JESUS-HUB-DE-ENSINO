import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use the dedicated firestoreDatabaseId from the config if present
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

let currentUser: User | null = null;
let authInitialized = false;

// Authenticate anonymously so every visitor gets a real Firebase Auth UID for secure Firestore interactions
export async function ensureAuthUser(): Promise<User | null> {
  if (currentUser) return currentUser;

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        authInitialized = true;
        resolve(user);
      } else if (!authInitialized) {
        authInitialized = true;
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          resolve(userCredential.user);
        } catch (error) {
          console.warn('[Firebase] Anonymous sign-in failed, proceeding in offline mode:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or database initializing.');
    }
    return false;
  }
}

// Initial connection test
testConnection();
