import { storageService } from './storageService';
import { firebaseService } from './firebaseService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.isBackendAvailable = null;
    this.cloudProvider = firebaseService.isConfigured() ? 'firebase' : null;
  }

  async checkHealth() {
    if (firebaseService.isConfigured()) {
      this.isBackendAvailable = true;
      this.cloudProvider = 'firebase';
      return true;
    }
    try {
      const res = await fetch(`${API_BASE}/couple`, { signal: AbortSignal.timeout(3000) });
      this.isBackendAvailable = res.ok;
      this.cloudProvider = res.ok ? 'laravel' : null;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      this.cloudProvider = null;
      return false;
    }
  }

  async getCoupleData() {
    // 1. Try Firebase if configured
    if (firebaseService.isConfigured()) {
      try {
        const fireData = await firebaseService.getCoupleData();
        if (fireData) {
          storageService.saveCoupleData(fireData);
          this.isBackendAvailable = true;
          this.cloudProvider = 'firebase';
          return fireData;
        }
      } catch (err) {
        console.warn('Firebase error fetching couple data:', err);
      }
    }

    // 2. Try Laravel backend
    try {
      const res = await fetch(`${API_BASE}/couple`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          storageService.saveCoupleData(json.data);
          this.isBackendAvailable = true;
          this.cloudProvider = 'laravel';
          return json.data;
        }
      }
    } catch {
      // Backend not running on this device
    }

    // 3. Fallback to localStorage
    return storageService.getCoupleData();
  }

  async saveCoupleData(data) {
    // 1. Save to Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.saveCoupleData(data);
      storageService.saveCoupleData(data);
      return data;
    }

    // 2. Try Laravel API
    try {
      const res = await fetch(`${API_BASE}/couple`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        const saved = json.data || data;
        storageService.saveCoupleData(saved);
        return saved;
      }
    } catch {
      // Fallback
    }

    // 3. Local storage
    storageService.saveCoupleData(data);
    return data;
  }

  async verifyPin(pin) {
    const couple = await this.getCoupleData();
    return trimPin(couple?.pin || '1314') === trimPin(pin);
  }

  async getMemories(params = {}) {
    // 1. Try Firebase
    if (firebaseService.isConfigured()) {
      try {
        const fireMemories = await firebaseService.getMemories();
        if (Array.isArray(fireMemories) && fireMemories.length > 0) {
          const formatted = fireMemories.map(normalizeMemory);
          storageService.saveMemories(formatted);
          this.isBackendAvailable = true;
          this.cloudProvider = 'firebase';
          return formatted;
        }
      } catch (err) {
        console.warn('Firebase error fetching memories:', err);
      }
    }

    // 2. Try Laravel
    try {
      const url = new URL(`${API_BASE}/memories`);
      if (params.favorite) url.searchParams.set('favorite', '1');
      if (params.search) url.searchParams.set('search', params.search);
      if (params.order) url.searchParams.set('order', params.order);

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const formatted = json.data.map(normalizeMemory);
          storageService.saveMemories(formatted);
          this.isBackendAvailable = true;
          this.cloudProvider = 'laravel';
          return formatted;
        }
      }
    } catch {
      // Backend not running on this device
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

    // 1. Try Firebase
    if (firebaseService.isConfigured()) {
      const created = await firebaseService.addMemory(cleanMemory);
      storageService.addMemory(created || cleanMemory);
      return created || cleanMemory;
    }

    // 2. Try Laravel
    try {
      let body;
      const headers = {};

      if (rawFile) {
        const formData = new FormData();
        formData.append('image_file', rawFile);
        formData.append('title', cleanMemory.title);
        formData.append('date', cleanMemory.date);
        formData.append('story', cleanMemory.story);
        if (cleanMemory.isFavorite) formData.append('is_favorite', '1');
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: cleanMemory.title,
          date: cleanMemory.date,
          story: cleanMemory.story,
          image: cleanMemory.image,
          media: cleanMemory.media,
          is_favorite: cleanMemory.isFavorite,
        });
      }

      const res = await fetch(`${API_BASE}/memories`, {
        method: 'POST',
        headers,
        body,
      });

      if (res.ok) {
        const json = await res.json();
        const created = normalizeMemory(json.data);
        storageService.addMemory(created);
        return created;
      }
    } catch (err) {
      console.warn('Backend error adding memory, saving to local cache:', err.message);
    }

    // 3. Fallback to localStorage
    return storageService.addMemory(cleanMemory);
  }

  async updateMemory(id, memoryData, rawFile = null) {
    const cleanMemory = {
      ...memoryData,
      media: memoryData.media || (memoryData.image ? [{ type: 'image', url: memoryData.image }] : []),
      image: memoryData.image || (memoryData.media?.[0]?.url || ''),
      story: memoryData.story || '',
      title: memoryData.title || memoryData.story?.slice(0, 30) || 'ذكرى جميلة',
    };

    // 1. Try Firebase
    if (firebaseService.isConfigured()) {
      await firebaseService.updateMemory(id, cleanMemory);
      return storageService.updateMemory(id, cleanMemory);
    }

    // 2. Try Laravel
    try {
      let body;
      const headers = {};

      if (rawFile) {
        const formData = new FormData();
        formData.append('image_file', rawFile);
        if (cleanMemory.title) formData.append('title', cleanMemory.title);
        if (cleanMemory.date) formData.append('date', cleanMemory.date);
        if (cleanMemory.story !== undefined) formData.append('story', cleanMemory.story);
        if (cleanMemory.isFavorite !== undefined) formData.append('is_favorite', cleanMemory.isFavorite ? '1' : '0');
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: cleanMemory.title,
          date: cleanMemory.date,
          story: cleanMemory.story,
          image: cleanMemory.image,
          media: cleanMemory.media,
          is_favorite: cleanMemory.isFavorite,
        });
      }

      const res = await fetch(`${API_BASE}/memories/${id}`, {
        method: 'POST',
        headers,
        body,
      });

      if (res.ok) {
        const json = await res.json();
        const updated = normalizeMemory(json.data);
        storageService.updateMemory(id, updated);
        return updated;
      }
    } catch (err) {
      console.warn('Backend error updating memory:', err.message);
    }

    // 3. Fallback
    return storageService.updateMemory(id, cleanMemory);
  }

  async deleteMemory(id) {
    // 1. Try Firebase
    if (firebaseService.isConfigured()) {
      await firebaseService.deleteMemory(id);
      return storageService.deleteMemory(id);
    }

    // 2. Try Laravel
    try {
      const res = await fetch(`${API_BASE}/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        storageService.deleteMemory(id);
        return true;
      }
    } catch {
      // Fallback
    }

    storageService.deleteMemory(id);
    return true;
  }

  async toggleLike(id) {
    // 1. Try Firebase
    if (firebaseService.isConfigured()) {
      const likes = await firebaseService.toggleLike(id);
      if (likes !== null) {
        storageService.updateMemory(id, { likes });
        return likes;
      }
    }

    // 2. Try Laravel
    try {
      const res = await fetch(`${API_BASE}/memories/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        storageService.updateMemory(id, { likes: json.likes });
        return json.likes;
      }
    } catch {
      // Fallback
    }

    const updated = storageService.toggleLike(id);
    const item = updated.find((m) => m.id === id);
    return item ? item.likes : 0;
  }

  async exportBackup() {
    return storageService.exportBackup();
  }

  async importBackup(jsonString) {
    const res = storageService.importBackup(jsonString);
    if (res.success && firebaseService.isConfigured()) {
      const couple = storageService.getCoupleData();
      const memories = storageService.getMemories();
      await firebaseService.uploadAllToFirebase(couple, memories);
    }
    return res;
  }

  async resetToDefaults() {
    const defaults = storageService.resetToDefaults();
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
