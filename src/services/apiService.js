import { storageService } from './storageService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.isBackendAvailable = null;
  }

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/couple`, { signal: AbortSignal.timeout(3000) });
      this.isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  async getCoupleData() {
    try {
      const res = await fetch(`${API_BASE}/couple`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          storageService.saveCoupleData(json.data);
          this.isBackendAvailable = true;
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to local cache for couple data:', err.message);
      this.isBackendAvailable = false;
    }
    return storageService.getCoupleData();
  }

  async saveCoupleData(data) {
    try {
      const res = await fetch(`${API_BASE}/couple`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        storageService.saveCoupleData(json.data || data);
        return json.data || data;
      }
    } catch (err) {
      console.warn('Backend error saving couple data, saving locally:', err.message);
    }
    storageService.saveCoupleData(data);
    return data;
  }

  async verifyPin(pin) {
    try {
      const res = await fetch(`${API_BASE}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) return true;
      if (res.status === 403) return false;
    } catch {
      // Fallback to local check
    }
    const localCouple = storageService.getCoupleData();
    return trimPin(localCouple.pin) === trimPin(pin);
  }

  async getMemories(params = {}) {
    try {
      const url = new URL(`${API_BASE}/memories`);
      if (params.favorite) url.searchParams.set('favorite', '1');
      if (params.search) url.searchParams.set('search', params.search);
      if (params.order) url.searchParams.set('order', params.order);

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          // Normalize fields for frontend (is_favorite -> isFavorite)
          const formatted = json.data.map(normalizeMemory);
          storageService.saveMemories(formatted);
          this.isBackendAvailable = true;
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to local cache for memories:', err.message);
      this.isBackendAvailable = false;
    }
    return storageService.getMemories();
  }

  async addMemory(memoryData, rawFile = null) {
    try {
      let body;
      const headers = {};

      if (rawFile) {
        const formData = new FormData();
        formData.append('image_file', rawFile);
        formData.append('title', memoryData.title);
        formData.append('date', memoryData.date);
        if (memoryData.tag) formData.append('tag', memoryData.tag);
        if (memoryData.location) formData.append('location', memoryData.location);
        if (memoryData.milestone) formData.append('milestone', memoryData.milestone);
        if (memoryData.story) formData.append('story', memoryData.story);
        if (memoryData.isFavorite) formData.append('is_favorite', '1');
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: memoryData.title || memoryData.story?.slice(0, 30) || 'ذكرى جميلة',
          date: memoryData.date,
          tag: memoryData.tag,
          location: memoryData.location,
          milestone: memoryData.milestone,
          story: memoryData.story,
          image: memoryData.image,
          media: memoryData.media || [],
          is_favorite: memoryData.isFavorite,
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
    return storageService.addMemory(memoryData);
  }

  async updateMemory(id, memoryData, rawFile = null) {
    try {
      let body;
      const headers = {};

      if (rawFile) {
        const formData = new FormData();
        formData.append('image_file', rawFile);
        if (memoryData.title) formData.append('title', memoryData.title);
        if (memoryData.date) formData.append('date', memoryData.date);
        if (memoryData.tag !== undefined) formData.append('tag', memoryData.tag);
        if (memoryData.location !== undefined) formData.append('location', memoryData.location);
        if (memoryData.milestone !== undefined) formData.append('milestone', memoryData.milestone);
        if (memoryData.story !== undefined) formData.append('story', memoryData.story);
        if (memoryData.isFavorite !== undefined) formData.append('is_favorite', memoryData.isFavorite ? '1' : '0');
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: memoryData.title || memoryData.story?.slice(0, 30) || 'ذكرى جميلة',
          date: memoryData.date,
          tag: memoryData.tag,
          location: memoryData.location,
          milestone: memoryData.milestone,
          story: memoryData.story,
          image: memoryData.image,
          media: memoryData.media || [],
          is_favorite: memoryData.isFavorite,
        });
      }

      // Using POST to /memories/{id} handles multipart FormData comfortably in PHP
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
      console.warn('Backend error updating memory, updating locally:', err.message);
    }
    return storageService.updateMemory(id, memoryData);
  }

  async deleteMemory(id) {
    try {
      const res = await fetch(`${API_BASE}/memories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        storageService.deleteMemory(id);
        return true;
      }
    } catch (err) {
      console.warn('Backend error deleting memory, deleting locally:', err.message);
    }
    storageService.deleteMemory(id);
    return true;
  }

  async toggleLike(id) {
    try {
      const res = await fetch(`${API_BASE}/memories/${id}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        storageService.updateMemory(id, { likes: json.likes });
        return json.likes;
      }
    } catch (err) {
      console.warn('Backend error liking memory, updating locally:', err.message);
    }
    const updated = storageService.toggleLike(id);
    const item = updated.find((m) => m.id === id);
    return item ? item.likes : 0;
  }

  async exportBackup() {
    try {
      const res = await fetch(`${API_BASE}/backup/export`);
      if (res.ok) {
        const data = await res.json();
        return JSON.stringify(data, null, 2);
      }
    } catch {
      // Fallback
    }
    return storageService.exportBackup();
  }

  async importBackup(jsonString) {
    try {
      const res = await fetch(`${API_BASE}/backup/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
      });
      if (res.ok) {
        const local = storageService.importBackup(jsonString);
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend error importing backup, applying locally:', err.message);
    }
    return storageService.importBackup(jsonString);
  }

  async resetToDefaults() {
    try {
      const res = await fetch(`${API_BASE}/backup/reset`, {
        method: 'POST',
      });
      if (res.ok) {
        const defaults = storageService.resetToDefaults();
        return defaults;
      }
    } catch (err) {
      console.warn('Backend error resetting, resetting locally:', err.message);
    }
    return storageService.resetToDefaults();
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
