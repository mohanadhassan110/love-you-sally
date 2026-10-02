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
    const deleted = storageService.getDeletedIds();

    // 1. Firebase if configured
    if (firebaseService.isConfigured()) {
      try {
        const fireMemories = await firebaseService.getMemories();
        if (Array.isArray(fireMemories)) {
          const clean = fireMemories.filter((m) => !deleted.has(String(m.id)));
          const formatted = clean.map(normalizeMemory);
          storageService.saveMemories(formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('Firebase error fetching memories:', err);
      }
    }

    // 2. Try Laravel backend if running locally
    try {
      const res = await fetch(`${API_BASE}/memories?_t=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const clean = json.data.filter((m) => !deleted.has(String(m.id)));
          const formatted = clean.map(normalizeMemory);
          storageService.saveMemories(formatted);
          return formatted;
        }
      }
    } catch {
      // Backend not running locally, proceed
    }

    // 3. Automated 24/7 Cloud Sync
    try {
      const cloudMemories = await cloudService.getMemories();
      if (Array.isArray(cloudMemories)) {
        const clean = cloudMemories.filter((m) => !deleted.has(String(m.id)));
        const formatted = clean.map(normalizeMemory);
        storageService.saveMemories(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Cloud sync error, using local fallback:', err);
    }

    // 4. Fallback to localStorage
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

    // 1. Save locally immediately
    storageService.addMemory(cleanMemory);

    // 2. Save to 24/7 Cloud Sync
    await cloudService.addMemory(cleanMemory);

    // 3. Save to Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.addMemory(cleanMemory);
    }

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

    // 1. Save locally immediately
    const updated = storageService.updateMemory(id, cleanMemory);

    // 2. Save to 24/7 Cloud Sync
    await cloudService.updateMemory(id, cleanMemory);

    // 3. Save to Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.updateMemory(id, cleanMemory);
    }

    return updated;
  }

  async deleteMemory(id) {
    // 1. Mark as deleted and delete locally immediately
    storageService.deleteMemory(id);

    // 2. Sync deletion to cloud, Firebase, and Laravel
    const promises = [cloudService.deleteMemory(id)];
    if (firebaseService.isConfigured()) {
      promises.push(firebaseService.deleteMemory(id));
    }
    promises.push(
      fetch(`${API_BASE}/memories/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1000),
      }).catch(() => {})
    );

    await Promise.allSettled(promises);
    return true;
  }

  async toggleLike(id) {
    const newLikes = storageService.toggleLike(id);
    const item = newLikes.find((m) => String(m.id) === String(id));
    const likesCount = item ? item.likes : 0;

    const promises = [cloudService.toggleLike(id)];
    if (firebaseService.isConfigured()) {
      promises.push(firebaseService.toggleLike(id));
    }
    Promise.allSettled(promises).catch(() => {});

    return likesCount;
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
