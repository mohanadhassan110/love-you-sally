import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const CONFIG_STORAGE_KEY = 'nfc_firebase_config_v1';

export function getStoredFirebaseConfig() {
  // 1. Try environment variables
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  // 2. Try localStorage custom config
  try {
    const local = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading stored Firebase config:', err);
  }

  return null;
}

export function saveStoredFirebaseConfig(config) {
  try {
    if (!config) {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      return true;
    }
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save Firebase config:', err);
    return false;
  }
}

let appInstance = null;
let dbInstance = null;

export function getFirebaseDb() {
  const config = getStoredFirebaseConfig();
  if (!config) return null;

  try {
    if (!appInstance) {
      appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
    }
    if (!dbInstance && appInstance) {
      dbInstance = getFirestore(appInstance);
    }
    return dbInstance;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

export function resetFirebaseInstance() {
  appInstance = null;
  dbInstance = null;
}
