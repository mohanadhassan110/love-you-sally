import { INITIAL_COUPLE_DATA, INITIAL_MEMORIES } from '../data/initialMemories';
import { storageService } from './storageService';

const CLOUD_BUCKET_ID = 'W7QiGNMvf1TkkNSAB7pZGM';
const CLOUD_BASE = `https://kvdb.io/${CLOUD_BUCKET_ID}`;

export const cloudService = {
  isAvailable: true,

  // 1. Get couple profile from cloud
  getCoupleData: async () => {
    try {
      const res = await fetch(`${CLOUD_BASE}/couple`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith('{')) {
          const parsed = JSON.parse(text);
          storageService.saveCoupleData(parsed);
          return parsed;
        }
      } else if (res.status === 404) {
        // First run: seed cloud with initial data
        await cloudService.saveCoupleData(INITIAL_COUPLE_DATA);
        return INITIAL_COUPLE_DATA;
      }
    } catch (err) {
      console.warn('Cloud sync couple data error, using local fallback:', err);
    }
    return storageService.getCoupleData();
  },

  // 2. Save couple profile to cloud
  saveCoupleData: async (data) => {
    try {
      await fetch(`${CLOUD_BASE}/couple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      storageService.saveCoupleData(data);
      return data;
    } catch (err) {
      console.error('Cloud save couple error:', err);
      storageService.saveCoupleData(data);
      return data;
    }
  },

  // 3. Get all memories from cloud
  getMemories: async () => {
    try {
      const res = await fetch(`${CLOUD_BASE}/memories`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith('[')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            storageService.saveMemories(parsed);
            return parsed;
          }
        }
      } else if (res.status === 404) {
        // First run: seed cloud with initial memories
        await cloudService.saveMemories(INITIAL_MEMORIES);
        return INITIAL_MEMORIES;
      }
    } catch (err) {
      console.warn('Cloud sync memories error, using local fallback:', err);
    }
    return storageService.getMemories();
  },

  // 4. Save entire memories array to cloud
  saveMemories: async (memories) => {
    try {
      await fetch(`${CLOUD_BASE}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memories),
      });
      storageService.saveMemories(memories);
      return memories;
    } catch (err) {
      console.error('Cloud save memories error:', err);
      storageService.saveMemories(memories);
      return memories;
    }
  },

  // 5. Add new memory to cloud
  addMemory: async (memory) => {
    const memories = await cloudService.getMemories();
    const newMemory = {
      ...memory,
      id: memory.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      likes: memory.likes || 0,
      isFavorite: !!memory.isFavorite,
    };
    const updated = [newMemory, ...memories];
    await cloudService.saveMemories(updated);
    return newMemory;
  },

  // 6. Update existing memory in cloud
  updateMemory: async (id, updatedFields) => {
    const memories = await cloudService.getMemories();
    let updatedItem = null;
    const updated = memories.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updatedFields, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });
    await cloudService.saveMemories(updated);
    return updatedItem || { id, ...updatedFields };
  },

  // 7. Delete memory from cloud
  deleteMemory: async (id) => {
    const memories = await cloudService.getMemories();
    const updated = memories.filter((item) => item.id !== id);
    await cloudService.saveMemories(updated);
    return true;
  },

  // 8. Toggle like in cloud
  toggleLike: async (id) => {
    const memories = await cloudService.getMemories();
    let newLikes = 0;
    const updated = memories.map((item) => {
      if (item.id === id) {
        newLikes = (item.likes || 0) + 1;
        return { ...item, likes: newLikes };
      }
      return item;
    });
    await cloudService.saveMemories(updated);
    return newLikes;
  },

  // 9. Reset to default starter memories in cloud
  resetToDefaults: async () => {
    await cloudService.saveCoupleData(INITIAL_COUPLE_DATA);
    await cloudService.saveMemories(INITIAL_MEMORIES);
    return {
      couple: INITIAL_COUPLE_DATA,
      memories: INITIAL_MEMORIES,
    };
  },
};
