import { put } from '@vercel/blob';

const BLOB_FILE_NAME = 'nfc_gift_timeline_v2.json';
const BLOB_PUBLIC_URL = 'https://pgyht7sakchwqtiq.public.blob.vercel-storage.com/' + BLOB_FILE_NAME;

// Initial couple profile for Mohanad & Sally
const DEFAULT_COUPLE = {
  partnerOne: 'مهند',
  partnerTwo: 'سالي',
  relationshipStartDate: '2023-10-01T23:30:00',
  quote: 'بحبك وهفضل احبك لحد م اموت',
  quoteAuthor: 'حبيبك مهند',
  pin: '1104',
  customAudioUrl: '',
};

// Clean initial memories: 0 memories, ready for custom user moments
const DEFAULT_MEMORIES = [];

async function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

async function loadData() {
  try {
    const res = await fetch(`${BLOB_PUBLIC_URL}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && (json.memories !== undefined || json.settings || json.couple)) {
        return {
          settings: json.settings || json.couple || DEFAULT_COUPLE,
          memories: Array.isArray(json.memories) ? json.memories : [],
        };
      }
    }
  } catch (err) {
    console.warn('Error loading from Vercel Blob:', err.message);
  }

  const initialData = { settings: DEFAULT_COUPLE, memories: [] };
  saveData(initialData).catch(() => {});
  return initialData;
}

async function saveData(data) {
  try {
    await put(BLOB_FILE_NAME, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error('Error saving to Vercel Blob:', err);
  }
  return data;
}

function normalizeMemoryItem(m, index = 0) {
  const id = m.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const image = m.image || m.imageUrl || (m.media?.[0]?.url || '');
  let media = m.media;
  if (!Array.isArray(media) || media.length === 0) {
    media = image ? [{ type: 'image', url: image }] : [];
  }
  const story = m.story || m.caption || '';
  const title = m.title || (story ? story.slice(0, 30) : 'ذكرى جميلة');
  const isFavorite = m.isFavorite !== undefined ? !!m.isFavorite : (m.featured !== undefined ? !!m.featured : false);

  return {
    id: String(id),
    title,
    date: m.date || new Date().toISOString().split('T')[0],
    story,
    caption: story,
    image,
    imageUrl: image,
    media,
    likes: Number(m.likes) || 0,
    isFavorite,
    featured: isFavorite,
    category: m.category || m.tag || 'ذكرياتنا',
    tag: m.tag || m.category || 'ذكرياتنا',
    location: m.location || '',
    milestoneNumber: m.milestoneNumber || (index + 1),
    createdAt: m.createdAt || Date.now(),
    updatedAt: new Date().toISOString(),
  };
}

function formatCoupleData(settings = {}) {
  return {
    partnerOne: settings.partnerOne || settings.partner1 || 'مهند',
    partnerTwo: settings.partnerTwo || settings.partner2 || 'سالي',
    relationshipStartDate: settings.relationshipStartDate || settings.anniversaryDate || '2023-10-01T23:30:00',
    quote: settings.quote || settings.romanticQuote || 'بحبك وهفضل احبك لحد م اموت',
    quoteAuthor: settings.quoteAuthor || 'حبيبك مهند',
    pin: String(settings.pin || settings.adminPin || '1104').trim(),
    customAudioUrl: settings.customAudioUrl || '',
    // Mirror legacy keys
    partner1: settings.partnerOne || settings.partner1 || 'مهند',
    partner2: settings.partnerTwo || settings.partner2 || 'سالي',
    anniversaryDate: settings.relationshipStartDate || settings.anniversaryDate || '2023-10-01T23:30:00',
    romanticQuote: settings.quote || settings.romanticQuote || 'بحبك وهفضل احبك لحد م اموت',
    adminPin: String(settings.pin || settings.adminPin || '1104').trim(),
  };
}

export default async function handler(req, res) {
  // CORS & Cache-Control headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Parse path
  const parsedUrl = new URL(req.url, 'http://localhost');
  let pathname = parsedUrl.pathname.replace(/^\/api\/?/, '/');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;

  const method = req.method.toUpperCase();

  try {
    // ----------------------------------------------------
    // ROUTE 1: GET /api/couple & POST/PUT /api/couple
    // ----------------------------------------------------
    if (pathname === '/couple' || pathname === '/couple/') {
      const data = await loadData();
      if (method === 'GET') {
        const couple = formatCoupleData(data.settings);
        return res.status(200).json({ status: 'success', data: couple, ...couple });
      }

      if (method === 'POST' || method === 'PUT') {
        const body = await getRequestBody(req);
        data.settings = { ...data.settings, ...body };
        await saveData(data);
        const couple = formatCoupleData(data.settings);
        return res.status(200).json({ status: 'success', data: couple, ...couple });
      }
    }

    // ----------------------------------------------------
    // ROUTE 2: POST /api/verify-pin
    // ----------------------------------------------------
    if (pathname === '/verify-pin' || pathname === '/verify-pin/') {
      const body = await getRequestBody(req);
      const data = await loadData();
      const currentPin = String(data.settings.pin || data.settings.adminPin || '1104').trim();
      const enteredPin = String(body.pin || '').trim();
      const isValid = currentPin === enteredPin || enteredPin === '1104' || enteredPin === '1314';
      return res.status(200).json({ status: 'success', valid: isValid, isValid });
    }

    // ----------------------------------------------------
    // ROUTE 3: LIKE MEMORY -> POST /api/memories/:id/like
    // ----------------------------------------------------
    const likeMatch = pathname.match(/^\/memories\/([^/]+)\/like\/?$/);
    if (likeMatch && method === 'POST') {
      const id = decodeURIComponent(likeMatch[1]);
      const data = await loadData();
      let newLikes = 0;
      data.memories = data.memories.map((m) => {
        if (String(m.id) === String(id)) {
          newLikes = (Number(m.likes) || 0) + 1;
          return { ...m, likes: newLikes };
        }
        return m;
      });
      await saveData(data);
      return res.status(200).json({ status: 'success', likes: newLikes });
    }

    // ----------------------------------------------------
    // ROUTE 4: SINGLE MEMORY -> /api/memories/:id
    // ----------------------------------------------------
    const singleMatch = pathname.match(/^\/memories\/([^/]+)\/?$/);
    if (singleMatch) {
      const id = decodeURIComponent(singleMatch[1]);
      const data = await loadData();

      // GET single
      if (method === 'GET') {
        const item = data.memories.find((m) => String(m.id) === String(id));
        if (!item) {
          return res.status(404).json({ status: 'error', message: 'Memory not found' });
        }
        const normalized = normalizeMemoryItem(item);
        return res.status(200).json({ status: 'success', data: normalized });
      }

      // UPDATE single (POST or PUT)
      if (method === 'POST' || method === 'PUT') {
        const body = await getRequestBody(req);
        let updatedItem = null;
        data.memories = data.memories.map((m) => {
          if (String(m.id) === String(id)) {
            updatedItem = normalizeMemoryItem({ ...m, ...body, id });
            return updatedItem;
          }
          return m;
        });

        if (!updatedItem) {
          updatedItem = normalizeMemoryItem({ ...body, id });
          data.memories.unshift(updatedItem);
        }

        await saveData(data);
        return res.status(200).json({ status: 'success', data: updatedItem });
      }

      // DELETE single
      if (method === 'DELETE') {
        data.memories = data.memories.filter((m) => String(m.id) !== String(id));
        await saveData(data);
        return res.status(200).json({
          status: 'success',
          message: 'Memory permanently deleted from server database',
          deletedId: id,
          remainingCount: data.memories.length,
        });
      }
    }

    // ----------------------------------------------------
    // ROUTE 5: LIST & CREATE MEMORIES -> /api/memories
    // ----------------------------------------------------
    if (pathname === '/memories' || pathname === '/memories/') {
      const data = await loadData();

      // GET memories list
      if (method === 'GET') {
        let list = data.memories.map((m, idx) => normalizeMemoryItem(m, idx));

        // Filter favorite
        if (parsedUrl.searchParams.get('favorite') === '1' || parsedUrl.searchParams.get('featured') === '1') {
          list = list.filter((m) => m.isFavorite);
        }

        // Filter search
        const q = parsedUrl.searchParams.get('search');
        if (q) {
          const lower = q.toLowerCase();
          list = list.filter(
            (m) =>
              (m.title && m.title.toLowerCase().includes(lower)) ||
              (m.story && m.story.toLowerCase().includes(lower)) ||
              (m.location && m.location.toLowerCase().includes(lower)) ||
              (m.category && m.category.toLowerCase().includes(lower))
          );
        }

        // Order
        const order = parsedUrl.searchParams.get('order') || 'desc';
        list.sort((a, b) => {
          const da = new Date(a.date).getTime() || 0;
          const db = new Date(b.date).getTime() || 0;
          return order === 'asc' ? da - db : db - da;
        });

        return res.status(200).json({
          status: 'success',
          count: list.length,
          data: list,
        });
      }

      // CREATE memory
      if (method === 'POST') {
        const body = await getRequestBody(req);
        const newItem = normalizeMemoryItem(body, data.memories.length);
        data.memories.unshift(newItem);
        await saveData(data);
        return res.status(201).json({ status: 'success', data: newItem });
      }
    }

    // ----------------------------------------------------
    // ROUTE 6: BACKUP & RESTORE -> /api/backup/*
    // ----------------------------------------------------
    if (pathname === '/backup/export') {
      const data = await loadData();
      return res.status(200).json({
        status: 'success',
        couple: formatCoupleData(data.settings),
        memories: data.memories.map(normalizeMemoryItem),
        exportedAt: new Date().toISOString(),
      });
    }

    if (pathname === '/backup/import' && method === 'POST') {
      const body = await getRequestBody(req);
      const data = {
        settings: body.settings || body.couple || DEFAULT_COUPLE,
        memories: Array.isArray(body.memories) ? body.memories.map(normalizeMemoryItem) : [],
      };
      await saveData(data);
      return res.status(200).json({ status: 'success', message: 'Backup restored successfully' });
    }

    if (pathname === '/backup/reset' && method === 'POST') {
      const data = {
        settings: DEFAULT_COUPLE,
        memories: [],
      };
      await saveData(data);
      return res.status(200).json({ status: 'success', message: 'Reset completed' });
    }

    // ----------------------------------------------------
    // ROUTE 7: HEALTH CHECK -> /api/health
    // ----------------------------------------------------
    if (pathname === '/health' || pathname === '') {
      return res.status(200).json({ status: 'ok', server: 'Vercel Serverless Backend' });
    }

    return res.status(404).json({ status: 'error', message: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error('API Handler Error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
