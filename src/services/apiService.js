import { storageService } from './storageService';
import { firebaseService } from './firebaseService';
import { cloudService } from './cloudService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.isBackendOnline = true;
    this.cloudProvider = firebaseService.isConfigured() ? 'firebase' : 'cloud';
  }

  async checkHealth() {
    if (firebaseService.isConfigured()) {
      this.isBackendOnline = true;
      this.cloudProvider = 'firebase';
      return true;
    }
    this.isBackendOnline = true;
    this.cloudProvider = 'cloud';
    return true;
  }

  async getCoupleData() {
    // 1. Firebase if user configured it
    if (firebaseService.isConfigured()) {
      try {
        const fireData = await firebaseService.getCoupleData();
        if (fireData) {
          storageService.saveCoupleData(fireData);
          return fireData;
        }
      } catch (err) {
        console.warn('Firebase error fetching couple data:', err);
      }
    }

    // 2. Automated 24/7 Cloud Sync
    try {
      const cloudData = await cloudService.getCoupleData();
      if (cloudData) {
        return cloudData;
      }
    } catch (err) {
      console.warn('Cloud sync error, using local fallback:', err);
    }

    // 3. Fallback to localStorage
    return storageService.getCoupleData();
  }

  async saveCoupleData(data) {
    // 1. Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.saveCoupleData(data);
    }

    // 2. Save to 24/7 Cloud Sync
    await cloudService.saveCoupleData(data);

    // 3. Save locally
    storageService.saveCoupleData(data);
    return data;
  }

  async verifyPin(pin) {
    const couple = await this.getCoupleData();
    return trimPin(couple?.pin || '1314') === trimPin(pin);
  }

  async getMemories(params = {}) {
    // 1. Firebase if configured
    if (firebaseService.isConfigured()) {
      try {
        const fireMemories = await firebaseService.getMemories();
        if (Array.isArray(fireMemories) && fireMemories.length > 0) {
          const formatted = fireMemories.map(normalizeMemory);
          storageService.saveMemories(formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('Firebase error fetching memories:', err);
      }
    }

    // 2. Automated 24/7 Cloud Sync
    try {
      const cloudMemories = await cloudService.getMemories();
      if (Array.isArray(cloudMemories) && cloudMemories.length > 0) {
        const formatted = cloudMemories.map(normalizeMemory);
        storageService.saveMemories(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Cloud sync error, using local fallback:', err);
    }

    // 3. Fallback to localStorage
    return storageService.getMemories();
  }

  async addMemory(memoryData, rawFile = null) {
    const cleanMemory = {
      ...memoryData,
      id: memoryData.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      media: memoryData.media || (memoryData.image ? [{ type: 'image', url: memoryData.image }] : []),
      image: memoryData.image || (memoryData.media?.[0]?.url || ''),
      story: memoryData.story || '',
      title: memoryData.title || memoryData.story?.slice(0, 30) || 'ذكرى جميلة',
      date: memoryData.date || new Date().toISOString().split('T')[0],
      isFavorite: !!memoryData.isFavorite,
      likes: memoryData.likes || 0,
    };

    // 1. Save to Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.addMemory(cleanMemory);
    }

    // 2. Save to 24/7 Cloud Sync
    await cloudService.addMemory(cleanMemory);

    // 3. Save locally
    storageService.addMemory(cleanMemory);
    return cleanMemory;
  }

  async updateMemory(id, memoryData, rawFile = null) {
    const cleanMemory = {
      ...memoryData,
      media: memoryData.media || (memoryData.image ? [{ type: 'image', url: memoryData.image }] : []),
      image: memoryData.image || (memoryData.media?.[0]?.url || ''),
      story: memoryData.story || '',
      title: memoryData.title || memoryData.story?.slice(0, 30) || 'ذكرى جميلة',
    };

    // 1. Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.updateMemory(id, cleanMemory);
    }

    // 2. Save to 24/7 Cloud Sync
    await cloudService.updateMemory(id, cleanMemory);

    // 3. Save locally
    return storageService.updateMemory(id, cleanMemory);
  }

  async deleteMemory(id) {
    if (firebaseService.isConfigured()) {
      await firebaseService.deleteMemory(id);
    }
    await cloudService.deleteMemory(id);
    storageService.deleteMemory(id);
    return true;
  }

  async toggleLike(id) {
    if (firebaseService.isConfigured()) {
      await firebaseService.toggleLike(id);
    }
    const newLikes = await cloudService.toggleLike(id);
    storageService.updateMemory(id, { likes: newLikes });
    return newLikes;
  }

  async exportBackup() {
    return storageService.exportBackup();
  }

  async importBackup(jsonString) {
    const res = storageService.importBackup(jsonString);
    if (res.success) {
      const couple = storageService.getCoupleData();
      const memories = storageService.getMemories();
      await cloudService.saveCoupleData(couple);
      await cloudService.saveMemories(memories);
      if (firebaseService.isConfigured()) {
        await firebaseService.uploadAllToFirebase(couple, memories);
      }
    }
    return res;
  }

  async resetToDefaults() {
    const defaults = await cloudService.resetToDefaults();
    storageService.resetToDefaults();
    if (firebaseService.isConfigured()) {
      await firebaseService.uploadAllToFirebase(defaults.couple, defaults.memories);
    }
    return defaults;
  }
}

function normalizeMemory(m) {
  let media = m.media;
  if (typeof media === 'string') {
    try {
      media = JSON.parse(media);
    } catch {
      media = null;
    }
  }
  if (!Array.isArray(media) || media.length === 0) {
    if (m.image) {
      media = [{ type: 'image', url: m.image }];
    } else {
      media = [];
    }
  }

  return {
    ...m,
    id: m.id,
    media,
    isFavorite: m.is_favorite !== undefined ? !!m.is_favorite : !!m.isFavorite,
    likes: Number(m.likes) || 0,
  };
}

function trimPin(val) {
  return (val || '').toString().trim();
}

export const apiService = new ApiService();
