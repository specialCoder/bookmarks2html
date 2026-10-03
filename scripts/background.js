/* 书签卡片 · 后台脚本：初始化默认设置、图标点击打开主页、网页简介抓取 */
importScripts('shared.js');

const DESCS_KEY = 'b2h-descriptions'; // chrome.storage.local：{ [网址]: { text, ts } }
const OK_TTL = 30 * 24 * 60 * 60 * 1000; // 抓取成功缓存 30 天
const FAIL_TTL = 24 * 60 * 60 * 1000; // 抓取失败 1 天内不重试
const MAX_BYTES = 200 * 1024; // 只读取网页前 200KB
const MAX_URLS_PER_REQUEST = 120;
const CONCURRENCY = 3;
const FETCH_TIMEOUT = 8000;

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ldquo: '\u201c',
  rdquo: '\u201d',
  hellip: '\u2026',
  mdash: '\u2014',
  ndash: '\u2013',
};

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    const stored = await chrome.storage.sync.get('settings');
    if (!stored || !stored.settings) {
      await chrome.storage.sync.set({ settings: { ...B2H.DEFAULT_SETTINGS } });
    }
  } catch (err) {
    console.warn('[书签卡片] 初始化设置失败', err);
  }

  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html?welcome=1') });
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
});

/* 撤销网站访问权限后清空已缓存的网页简介 */
if (chrome.permissions && chrome.permissions.onRemoved) {
  chrome.permissions.onRemoved.addListener((permissions) => {
    if (permissions.origins && permissions.origins.length) {
      chrome.storage.local.remove(DESCS_KEY).catch(() => {});
    }
  });
}

/* ---------------- 网页简介 ---------------- */

let cache = null;
let cacheReady = null;
const queue = [];
const inFlight = new Set();
let running = 0;

function loadCache() {
  if (!cacheReady) {
    cacheReady = chrome.storage.local
      .get(DESCS_KEY)
      .then((stored) => {
        cache = (stored && stored[DESCS_KEY]) || {};
        return cache;
      })
      .catch(() => {
        cache = {};
        return cache;
      });
  }
  return cacheReady;
}

function readCached(url) {
  const entry = cache[url];
  if (!entry) return null;
  const ttl = entry.text ? OK_TTL : FAIL_TTL;
  return Date.now() - entry.ts < ttl ? entry.text : null;
}

async function store(url, text) {
  cache[url] = { text, ts: Date.now() };
  try {
    await chrome.storage.local.set({ [DESCS_KEY]: cache });
  } catch (err) {
    console.warn('[书签卡片] 写入简介缓存失败', err);
  }
}

function notifyPage(entries) {
  try {
    const sent = chrome.runtime.sendMessage({ type: 'b2h:described', entries });
    if (sent && sent.catch) sent.catch(() => {});
  } catch (err) {
    /* 没有正在打开的书签主页时忽略 */
  }
}

function pump() {
  while (running < CONCURRENCY && queue.length) {
    const url = queue.shift();
    running += 1;
    fetchDescription(url)
      .catch(() => '')
      .then(async (text) => {
        running -= 1;
        inFlight.delete(url);
        await store(url, text);
        if (text) notifyPage({ [url]: text });
        pump();
      });
  }
}

function enqueue(url) {
  if (inFlight.has(url) || !/^https?:/i.test(url)) return;
  inFlight.add(url);
  queue.push(url);
  pump();
}

async function handleDescribeRequest(urls) {
  await loadCache();
  const granted = await chrome.permissions
    .contains({ origins: ['<all_urls>'] })
    .catch(() => false);
  if (!granted) return { entries: {}, queued: 0 };

  const entries = {};
  const missing = [];
  const seen = new Set();
  for (const raw of urls) {
    const url = String(raw || '');
    if (!url || seen.has(url)) continue;
    seen.add(url);
    if (seen.size > MAX_URLS_PER_REQUEST) break;
    const text = readCached(url);
    if (text === null) missing.push(url);
    else if (text) entries[url] = text;
  }

  for (const url of missing) enqueue(url);
  return { entries, queued: missing.length };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'b2h:describe') return undefined;
  handleDescribeRequest(message.urls || [])
    .then(sendResponse)
    .catch((err) => {
      console.warn('[书签卡片] 处理简介请求失败', err);
      sendResponse({ entries: {}, queued: 0 });
    });
  return true;
});

async function fetchDescription(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      redirect: 'follow',
      signal: controller.signal,
      headers: { accept: 'text/html,application/xhtml+xml' },
    });
    if (!response.ok || !response.body) return '';
    const type = response.headers.get('content-type') || '';
    if (type && !/text\/html|application\/xhtml/i.test(type)) return '';
    const html = await readBounded(response, MAX_BYTES);
    return extractDescription(html);
  } finally {
    clearTimeout(timer);
  }
}

async function readBounded(response, limit) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let html = '';
  let size = 0;
  while (size < limit) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    html += decoder.decode(value, { stream: true });
  }
  reader.cancel().catch(() => {});
  return html;
}

function extractDescription(html) {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd === -1 ? html : html.slice(0, headEnd);
  const tags = head.match(/<meta\s+[^>]*>/gi) || [];
  const found = { description: '', 'og:description': '', 'twitter:description': '' };

  for (const tag of tags) {
    const attrs = {};
    const attrRe = /([a-zA-Z][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let match;
    while ((match = attrRe.exec(tag))) {
      attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? '';
    }
    const key = (attrs.name || attrs.property || attrs.itemprop || '').toLowerCase();
    if (key in found && !found[key]) found[key] = normalizeText(attrs.content || '');
    if (found.description) break;
  }

  return found.description || found['og:description'] || found['twitter:description'];
}

function normalizeText(text) {
  const value = decodeEntities(text).replace(/\s+/g, ' ').trim();
  return value.length > 400 ? `${value.slice(0, 399)}\u2026` : value;
}

function decodeEntities(text) {
  return String(text).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    const key = body.toLowerCase();
    return ENTITIES[key] !== undefined ? ENTITIES[key] : match;
  });
}
