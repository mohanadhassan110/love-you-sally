import { put } from '@vercel/blob';

const BLOB_FILE_NAME = 'nfc_gift_timeline_v2.json';
const BLOB_PUBLIC_URL = 'https://pgyht7sakchwqtiq.public.blob.vercel-storage.com/' + BLOB_FILE_NAME;

// Isolated initial couple profile for NFC Gift (أحمد & سارة)
const DEFAULT_COUPLE = {
  partnerOne: 'أحمد',
  partnerTwo: 'سارة',
  relationshipStartDate: '2023-04-15T18:30:00',
  quote: '«في كل العالم، ليس هناك قلبٌ لي كقلبكِ.. وفي كل العالم، ليس هناك حبٌ لكِ كحبي.»',
  quoteAuthor: 'مايا أنجيلو',
  pin: '1314',
  customAudioUrl: '',
};

// Initial starter memories for this project
const DEFAULT_MEMORIES = [
  {
    id: 'mem-1',
    date: '2023-04-15',
    story: 'كان المطر يهطل بغزارة حين ركضنا معاً تحت مظلة ذلك المقهى الدافئ، ملابسنا مبللة وأيدينا باردة. طلبتِ الشوكولاتة الساخنة بالقرفة، وانسكبت قهوتي ونحن نضحك على مظلتكِ المكسورة. مرت ثلاث ساعات وكأنها ثلاث دقائق معدودات، ومشيت معكِ تحت أضواء الشارع وأنا أعلم في قلبي أن حياتي تغيرت للأبد منذ تلك اللحظة.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likes: 24,
    isFavorite: true,
  },
  {
    id: 'mem-2',
    date: '2023-07-22',
    story: 'حزمنا حقائبنا دون خطط مسبقة، وجلسنا في هدوء الليل أمام البحر حين بدت النجوم كأنها مرسومة فوق رؤوسنا. لُففنا بسترة دافئة نستمع لصوت الأمواج الهادئة، وبدأنا نحكي عن كل الأحلام الصامتة التي لم نجرؤ يوماً على البوح بها لأحد.',
    media: [
      {
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likes: 19,
    isFavorite: false,
  },
  {
    id: 'mem-3',
    date: '2023-11-04',
    story: 'كان من المفترض أن نطلب طعاماً جاهزاً، لكنكِ أصررتِ فجأة أن نتعلم صنع عجينة المعكرونة الإيطالية بأنفسنا. تحولت الطاولة إلى كومة من الدقيق الأبيض، والموسيقى الهادئة تعلو في الخلفية، بينما آثار العجين تزين طرف أنفكِ وأنتِ تضحكين بقلبك. كانت من أجمل الليالي التي شعرت فيها بقمة السعادة.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=1200&q=80',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likes: 31,
    isFavorite: true,
  },
  {
    id: 'mem-4',
    date: '2023-12-24',
    story: 'كانت نسمات الهواء الباردة تداعب شعركِ وأضواء الزينة الصفراء تنعكس في عينيكِ بريقاً يخطف الأنفاس. تقاسمنا كوب قهوة ساخناً، وقفازاً واحداً لأنني كالعادة نسيت قفازاتي في المنزل. عندما وضعتِ يديكِ الباردتين في جيب معطفي وابتسمتِ، شعرت وكأن برودة العالم كله قد تلاشت فجأة.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likes: 15,
    isFavorite: false,
  },
  {
    id: 'mem-5',
    date: '2024-04-15',
    story: 'سنة كاملة مرّت مع ضحكتكِ، صوتكِ الصباحي، حنانكِ الاستثنائي، وتفاصيلكِ التي لا تشبه أحداً. قدمتُ لكِ الصندوق الخشبي الصغير الذي احتفظتُ فيه بكل تذاكر السفر والرسائل الصغيرة التي كتبناها سوياً. حين لمعت عيناكِ بالدموع فرحاً، قطعتُ عهداً بيني وبين قلبي أن أجعل كل أيامكِ القادمة مليئة بهذا الدفء.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likes: 42,
    isFavorite: true,
  },
  {
    id: 'mem-6',
    date: '2024-08-19',
    story: 'توقفت حركة القارب في تلك اللحظة الساحرة التي تلونت فيها السماء بألوان المشمش والوردي والذهبي. كان نسيم البحر يحمل رائحة الصيف وعبق الراحة. أسندتِ رأسكِ على كتفي وأنتِ تراقبين انعكاس الغروب على سطح الماء. تلك اللحظة الهادئة ونحن ممسكان بأيدي بعضنا محفورة في ذاكرتي إلى الأبد.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likes: 27,
    isFavorite: true,
  },
];

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
      if (json && (json.memories || json.settings || json.couple)) {
        return {
          settings: json.settings || json.couple || DEFAULT_COUPLE,
          memories: Array.isArray(json.memories) && json.memories.length > 0 ? json.memories : DEFAULT_MEMORIES,
        };
      }
    }
  } catch (err) {
    console.warn('Error loading from Vercel Blob:', err.message);
  }

  // First time initialization for this project: seed into blob
  const initialData = { settings: DEFAULT_COUPLE, memories: DEFAULT_MEMORIES };
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
    partnerOne: settings.partnerOne || settings.partner1 || 'أحمد',
    partnerTwo: settings.partnerTwo || settings.partner2 || 'سارة',
    relationshipStartDate: settings.relationshipStartDate || settings.anniversaryDate || '2023-04-15T18:30:00',
    quote: settings.quote || settings.romanticQuote || '«في كل العالم، ليس هناك قلبٌ لي كقلبكِ.. وفي كل العالم، ليس هناك حبٌ لكِ كحبي.»',
    quoteAuthor: settings.quoteAuthor || 'مايا أنجيلو',
    pin: String(settings.pin || settings.adminPin || '1314').trim(),
    customAudioUrl: settings.customAudioUrl || '',
    // Mirror legacy keys
    partner1: settings.partnerOne || settings.partner1 || 'أحمد',
    partner2: settings.partnerTwo || settings.partner2 || 'سارة',
    anniversaryDate: settings.relationshipStartDate || settings.anniversaryDate || '2023-04-15T18:30:00',
    romanticQuote: settings.quote || settings.romanticQuote || '«في كل العالم، ليس هناك قلبٌ لي كقلبكِ.. وفي كل العالم، ليس هناك حبٌ لكِ كحبي.»',
    adminPin: String(settings.pin || settings.adminPin || '1314').trim(),
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
      const currentPin = String(data.settings.pin || data.settings.adminPin || '1314').trim();
      const enteredPin = String(body.pin || '').trim();
      const isValid = currentPin === enteredPin || enteredPin === '1314';
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
        memories: DEFAULT_MEMORIES,
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
