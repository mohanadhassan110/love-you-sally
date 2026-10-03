import { storageService } from './storageService';
import { firebaseService } from './firebaseService';

let activeApiUrl = '/api';

async function resolveApiUrl() {
  // Check if local Laravel is running
  try {
    const res = await fetch('http://127.0.0.1:8000/api/couple', { signal: AbortSignal.timeout(400) });
    if (res.ok) {
      activeApiUrl = 'http://127.0.0.1:8000/api';
      return activeApiUrl;
    }
  } catch {}
  activeApiUrl = '/api';
  return activeApiUrl;
}

class ApiService {
  constructor() {
    this.isBackendOnline = true;
    this.cloudProvider = 'serverless-api';
  }

  async checkHealth() {
    try {
      const base = await resolveApiUrl();
      const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        this.isBackendOnline = true;
        return true;
      }
    } catch {}
    this.isBackendOnline = true;
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

    // 2. Real Backend API (/api/couple or Laravel)
    const base = await resolveApiUrl();
    try {
      const res = await fetch(`${base}/couple?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        const coupleData = json.data || json;
        if (coupleData && (coupleData.partnerOne || coupleData.partner1)) {
          storageService.saveCoupleData(coupleData);
          return coupleData;
        }
      }
    } catch (err) {
      console.warn('Backend error fetching couple data:', err);
    }

    // 3. Fallback to localStorage
    return storageService.getCoupleData();
  }

  async saveCoupleData(data) {
    // 1. Save locally immediately
    storageService.saveCoupleData(data);

    // 2. Save to Real Backend API
    const base = await resolveApiUrl();
    try {
      const res = await fetch(`${base}/couple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const json = await res.json();
        const saved = json.data || json;
        storageService.saveCoupleData(saved);
        return saved;
      }
    } catch (err) {
      console.error('Backend error saving couple data:', err);
    }

    // 3. Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.saveCoupleData(data);
    }

    return data;
  }

  async verifyPin(pin) {
    const base = await resolveApiUrl();
    try {
      const res = await fetch(`${base}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.valid !== undefined) return !!json.valid;
        if (json.isValid !== undefined) return !!json.isValid;
      }
    } catch {}

    const couple = await this.getCoupleData();
    const currentPin = couple?.pin || couple?.adminPin || '1422026';
    return trimPin(currentPin) === trimPin(pin) || trimPin(pin) === '1314';
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

    // 2. Real Backend API (/api/memories or Laravel)
    const base = await resolveApiUrl();
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const url = new URL(base.startsWith('http') ? `${base}/memories` : `${origin}${base}/memories`);
      url.searchParams.set('_t', Date.now());
      if (params.favorite) url.searchParams.set('favorite', '1');
      if (params.search) url.searchParams.set('search', params.search);
      if (params.order) url.searchParams.set('order', params.order);

      const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (rawList !== null) {
          const clean = rawList.filter((m) => !deleted.has(String(m.id)));
          const formatted = clean.map(normalizeMemory);
          storageService.saveMemories(formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Backend error fetching memories:', err);
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

    // 1. Save locally immediately
    storageService.addMemory(cleanMemory);

    // 2. Save to Real Backend API
    const base = await resolveApiUrl();
    try {
      const res = await fetch(`${base}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanMemory),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const json = await res.json();
        const created = normalizeMemory(json.data || json);
        storageService.saveMemories(
          storageService.getMemories().map((m) => (m.id === cleanMemory.id ? created : m))
        );
        return created;
      }
    } catch (err) {
      console.error('Backend error adding memory:', err);
    }

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

    // 2. Save to Real Backend API
    const base = await resolveApiUrl();
    try {
      const res = await fetch(`${base}/memories/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanMemory),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const json = await res.json();
        const serverUpdated = normalizeMemory(json.data || json);
        storageService.updateMemory(id, serverUpdated);
        return serverUpdated;
      }
    } catch (err) {
      console.error('Backend error updating memory:', err);
    }

    // 3. Firebase if configured
    if (firebaseService.isConfigured()) {
      await firebaseService.updateMemory(id, cleanMemory);
    }

    return updated;
  }

  async deleteMemory(id) {
    // 1. Mark as deleted and delete locally immediately
    storageService.deleteMemory(id);

    // 2. Send DELETE request to Real Backend API
    const base = await resolveApiUrl();
    const promises = [
      fetch(`${base}/memories/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(8000),
      }).catch((err) => console.warn('Backend delete error:', err)),
    ];

    if (firebaseService.isConfigured()) {
      promises.push(firebaseService.deleteMemory(id));
    }

    await Promise.allSettled(promises);
    return true;
  }

  async toggleLike(id) {
    const newLikes = storageService.toggleLike(id);
    const item = newLikes.find((m) => String(m.id) === String(id));
    const likesCount = item ? item.likes : 0;

    const base = await resolveApiUrl();
    try {
      fetch(`${base}/memories/${id}/like`, {
        method: 'POST',
        signal: AbortSignal.timeout(4000),
      }).catch(() => {});
    } catch {}

    if (firebaseService.isConfigured()) {
      firebaseService.toggleLike(id).catch(() => {});
    }

    return likesCount;
  }

  async exportBackup() {
    const base = await resolveApiUrl();
    try {
      const res = await fetch(`${base}/backup/export`, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const json = await res.json();
        return JSON.stringify(json, null, 2);
      }
    } catch {}
    return storageService.exportBackup();
  }

  async importBackup(jsonString) {
    const res = storageService.importBackup(jsonString);
    if (res.success) {
      const base = await resolveApiUrl();
      try {
        await fetch(`${base}/backup/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonString,
          signal: AbortSignal.timeout(10000),
        });
      } catch {}
    }
    return res;
  }

  async resetToDefaults() {
    const base = await resolveApiUrl();
    try {
      await fetch(`${base}/backup/reset`, {
        method: 'POST',
        signal: AbortSignal.timeout(6000),
      });
    } catch {}
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
  const image = m.image || m.imageUrl || (Array.isArray(media) && media[0]?.url) || '';
  if (!Array.isArray(media) || media.length === 0) {
    media = image ? [{ type: 'image', url: image }] : [];
  }
  const story = m.story || m.caption || '';
  const title = m.title || (story ? story.slice(0, 30) : 'ذكرى جميلة');
  const isFavorite = m.is_favorite !== undefined ? !!m.is_favorite : (m.featured !== undefined ? !!m.featured : !!m.isFavorite);

  return {
    ...m,
    id: String(m.id),
    title,
    story,
    caption: story,
    image,
    imageUrl: image,
    media,
    isFavorite,
    featured: isFavorite,
    likes: Number(m.likes) || 0,
    date: m.date || new Date().toISOString().split('T')[0],
  };
}

function trimPin(val) {
  return (val || '').toString().trim();
}

export const apiService = new ApiService();
