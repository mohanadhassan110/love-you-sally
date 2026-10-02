import { INITIAL_COUPLE_DATA, INITIAL_MEMORIES } from '../data/initialMemories';

const STORAGE_KEYS = {
  COUPLE: 'nfc_couple_profile_v1',
  MEMORIES: 'nfc_timeline_memories_v1',
  DELETED_IDS: 'nfc_deleted_memory_ids_v1',
};

export const storageService = {
  getDeletedIds: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map(String));
        }
      }
    } catch (err) {
      console.warn('Could not read deleted IDs:', err);
    }
    return new Set();
  },

  addDeletedId: (id) => {
    try {
      const set = storageService.getDeletedIds();
      set.add(String(id));
      localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify([...set]));
    } catch (err) {
      console.error('Failed to save deleted ID:', err);
    }
  },

  clearDeletedIds: () => {
    localStorage.removeItem(STORAGE_KEYS.DELETED_IDS);
  },

  getCoupleData: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COUPLE);
      if (stored) {
        return { ...INITIAL_COUPLE_DATA, ...JSON.parse(stored) };
      }
    } catch (err) {
      console.warn('Could not read couple data from localStorage:', err);
    }
    return INITIAL_COUPLE_DATA;
  },

  saveCoupleData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUPLE, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Failed to save couple data:', err);
      return false;
    }
  },

  getMemories: () => {
    const deleted = storageService.getDeletedIds();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((m) => !deleted.has(String(m.id)));
        }
      }
    } catch (err) {
      console.warn('Could not read memories from localStorage:', err);
    }
    // Seed with initial memories only on very first run (key not in localStorage)
    const initial = INITIAL_MEMORIES.filter((m) => !deleted.has(String(m.id)));
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(initial));
    return initial;
  },

  saveMemories: (memories) => {
    try {
      const deleted = storageService.getDeletedIds();
      const filtered = Array.isArray(memories)
        ? memories.filter((m) => !deleted.has(String(m.id)))
        : [];
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to save memories to localStorage:', err);
      return false;
    }
  },

  addMemory: (memory) => {
    const memories = storageService.getMemories();
    const memoryId = memory.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // If this ID was previously marked deleted, remove it from deleted set
    try {
      const set = storageService.getDeletedIds();
      if (set.has(String(memoryId))) {
        set.delete(String(memoryId));
        localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify([...set]));
      }
    } catch (e) {}

    const newMemory = {
      ...memory,
      id: memoryId,
      likes: memory.likes || 0,
      isFavorite: !!memory.isFavorite,
    };
    const updated = [newMemory, ...memories];
    storageService.saveMemories(updated);
    return newMemory;
  },

  updateMemory: (id, updatedFields) => {
    const memories = storageService.getMemories();
    let updatedItem = null;
    const updated = memories.map((item) => {
      if (String(item.id) === String(id)) {
        updatedItem = { ...item, ...updatedFields };
        return updatedItem;
      }
      return item;
    });
    storageService.saveMemories(updated);
    return updatedItem || { id, ...updatedFields };
  },

  deleteMemory: (id) => {
    storageService.addDeletedId(id);
    const memories = storageService.getMemories();
    const updated = memories.filter((item) => String(item.id) !== String(id));
    storageService.saveMemories(updated);
    return updated;
  },

  toggleLike: (id) => {
    const memories = storageService.getMemories();
    const updated = memories.map((item) => {
      if (String(item.id) === String(id)) {
        return { ...item, likes: (item.likes || 0) + 1 };
      }
      return item;
    });
    storageService.saveMemories(updated);
    return updated;
  },

  exportBackup: () => {
    const data = {
      couple: storageService.getCoupleData(),
      memories: storageService.getMemories(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.couple) storageService.saveCoupleData(parsed.couple);
      if (Array.isArray(parsed.memories)) storageService.saveMemories(parsed.memories);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetToDefaults: () => {
    storageService.clearDeletedIds();
    localStorage.removeItem(STORAGE_KEYS.COUPLE);
    localStorage.removeItem(STORAGE_KEYS.MEMORIES);
    return {
      couple: INITIAL_COUPLE_DATA,
      memories: INITIAL_MEMORIES,
    };
  },
};
