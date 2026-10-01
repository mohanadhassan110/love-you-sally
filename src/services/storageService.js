import { INITIAL_COUPLE_DATA, INITIAL_MEMORIES } from '../data/initialMemories';

const STORAGE_KEYS = {
  COUPLE: 'nfc_couple_profile_v1',
  MEMORIES: 'nfc_timeline_memories_v1',
};

export const storageService = {
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
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read memories from localStorage:', err);
    }
    // Seed with initial memories on first run
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(INITIAL_MEMORIES));
    return INITIAL_MEMORIES;
  },

  saveMemories: (memories) => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
      return true;
    } catch (err) {
      console.error('Failed to save memories to localStorage:', err);
      return false;
    }
  },

  addMemory: (memory) => {
    const memories = storageService.getMemories();
    const newMemory = {
      ...memory,
      id: memory.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
      if (item.id === id) {
        updatedItem = { ...item, ...updatedFields };
        return updatedItem;
      }
      return item;
    });
    storageService.saveMemories(updated);
    return updatedItem || { id, ...updatedFields };
  },

  deleteMemory: (id) => {
    const memories = storageService.getMemories();
    const updated = memories.filter((item) => item.id !== id);
    storageService.saveMemories(updated);
    return updated;
  },

  toggleLike: (id) => {
    const memories = storageService.getMemories();
    const updated = memories.map((item) => {
      if (item.id === id) {
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
    localStorage.removeItem(STORAGE_KEYS.COUPLE);
    localStorage.removeItem(STORAGE_KEYS.MEMORIES);
    return {
      couple: INITIAL_COUPLE_DATA,
      memories: INITIAL_MEMORIES,
    };
  },
};
