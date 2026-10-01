import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import {
  getFirebaseDb,
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  resetFirebaseInstance,
} from './firebase';

const COUPLE_DOC_PATH = ['gift_data', 'couple_profile'];
const MEMORIES_COLLECTION_NAME = 'memories';

export const firebaseService = {
  isConfigured: () => {
    return !!getStoredFirebaseConfig();
  },

  getConfig: () => {
    return getStoredFirebaseConfig();
  },

  setConfig: (configObj) => {
    const success = saveStoredFirebaseConfig(configObj);
    resetFirebaseInstance();
    return success;
  },

  removeConfig: () => {
    saveStoredFirebaseConfig(null);
    resetFirebaseInstance();
  },

  // 1. Fetch couple profile
  getCoupleData: async () => {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const docRef = doc(db, COUPLE_DOC_PATH[0], COUPLE_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn('Firebase getCoupleData error:', err);
    }
    return null;
  },

  // 2. Save couple profile
  saveCoupleData: async (data) => {
    const db = getFirebaseDb();
    if (!db) return false;

    try {
      const docRef = doc(db, COUPLE_DOC_PATH[0], COUPLE_DOC_PATH[1]);
      await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (err) {
      console.error('Firebase saveCoupleData error:', err);
      return false;
    }
  },

  // 3. Fetch all memories
  getMemories: async () => {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const colRef = collection(db, MEMORIES_COLLECTION_NAME);
      const snap = await getDocs(colRef);
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      return list;
    } catch (err) {
      console.warn('Firebase getMemories error:', err);
      return null;
    }
  },

  // 4. Add new memory
  addMemory: async (memory) => {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const id = memory.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const docRef = doc(db, MEMORIES_COLLECTION_NAME, id);
      const cleanMemory = {
        ...memory,
        id,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, cleanMemory);
      return cleanMemory;
    } catch (err) {
      console.error('Firebase addMemory error:', err);
      return null;
    }
  },

  // 5. Update existing memory
  updateMemory: async (id, updatedFields) => {
    const db = getFirebaseDb();
    if (!db) return false;

    try {
      const docRef = doc(db, MEMORIES_COLLECTION_NAME, id);
      await setDoc(docRef, { ...updatedFields, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (err) {
      console.error('Firebase updateMemory error:', err);
      return false;
    }
  },

  // 6. Delete memory
  deleteMemory: async (id) => {
    const db = getFirebaseDb();
    if (!db) return false;

    try {
      const docRef = doc(db, MEMORIES_COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('Firebase deleteMemory error:', err);
      return false;
    }
  },

  // 7. Toggle like
  toggleLike: async (id) => {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const docRef = doc(db, MEMORIES_COLLECTION_NAME, id);
      await updateDoc(docRef, {
        likes: increment(1),
      });
      const snap = await getDoc(docRef);
      return snap.data()?.likes || 1;
    } catch (err) {
      console.error('Firebase toggleLike error:', err);
      return null;
    }
  },

  // 8. Push all local memories and couple data to Firebase
  uploadAllToFirebase: async (coupleData, memoriesList) => {
    const db = getFirebaseDb();
    if (!db) throw new Error('يرجى التحقق من بيانات تهيئة Firebase أولاً.');

    if (coupleData) {
      await firebaseService.saveCoupleData(coupleData);
    }

    if (Array.isArray(memoriesList)) {
      for (const m of memoriesList) {
        await firebaseService.addMemory(m);
      }
    }
    return true;
  },

  // 9. Real-time subscription for live sync across devices
  subscribeRealtime: (onCoupleUpdate, onMemoriesUpdate) => {
    const db = getFirebaseDb();
    if (!db) return () => {};

    const unsubCouple = onSnapshot(
      doc(db, COUPLE_DOC_PATH[0], COUPLE_DOC_PATH[1]),
      (snap) => {
        if (snap.exists() && onCoupleUpdate) {
          onCoupleUpdate(snap.data());
        }
      },
      (err) => console.warn('Couple realtime sync warning:', err)
    );

    const unsubMemories = onSnapshot(
      collection(db, MEMORIES_COLLECTION_NAME),
      (snap) => {
        if (onMemoriesUpdate) {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          onMemoriesUpdate(list);
        }
      },
      (err) => console.warn('Memories realtime sync warning:', err)
    );

    return () => {
      unsubCouple();
      unsubMemories();
    };
  },
};
