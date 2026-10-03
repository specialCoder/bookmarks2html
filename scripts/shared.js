/* bookmarks2html · 共享模块：设置读写、主题、书签树索引、通用组件。
   同时被扩展页面（newtab/options）与后台 service worker 使用。 */
const B2H = (() => {
  'use strict';

  const SETTINGS_KEY = 'settings';
  const THEME_LS_KEY = 'b2h-theme';
  const DESCRIPTIONS_KEY = 'b2h-descriptions';

  const DEFAULT_SETTINGS = Object.freeze({
    theme: 'auto', // auto | light | dark
    language: 'auto', // auto | zh | en
    cardSize: 'comfortable', // compact | comfortable | large
    viewMode: 'card', // card | list
    showFavicon: true,
    showUrl: true,
    showFolderPath: true,
    fetchDescriptions: false, // 需用户授权网站访问权限后才抓取
    searchEngine: 'google', // google | bing | baidu
  });

  /* ---------------- 多语言 ----------------
     字典只放界面文案；书签、文件夹名等用户数据不做翻译。
     t(key, params) 中的 {name} 占位符会按 params 逐项替换。 */

  const I18N = {
    zh: {
      brandName: 'bookmarks2html',
      brandTitle: '回到全部书签',
      pageTitleNewtab: 'bookmarks2html · 新标签页',
      pageTitleOptions: 'bookmarks2html · 设置',
      searchPlaceholder: '搜索书签，回车搜索网页',
      searchLabel: '搜索书签',
      refresh: '刷新书签',
      viewToCards: '切换到卡片视图',
      viewToList: '切换到列表视图',
      themeBtnTitle: '主题：{label}（点击切换）',
      settings: '设置',
      settingsAria: '打开设置',
      moreApps: '更多应用',
      moreAppsTitle: '更多应用 · 在新标签页打开',
      tabsLabel: '书签文件夹',
      tabAll: '全部',
      untitled: '未命名',
      expandAll: '展开全部',
      collapse: '收起',
      expandTitle: '展开当前范围内的全部子文件夹，把里面的书签平铺在一起',
      collapseTitle: '收起子文件夹，恢复逐层浏览',
      toastExpanded: '已展开全部子文件夹',
      toastCollapsed: '已恢复文件夹视图',
      toastRefreshed: '已刷新，共 {n} 个书签',
      toastRefreshFailed: '刷新失败，请稍后重试',
      themeAuto: '跟随系统',
      themeLight: '浅色',
      themeDark: '深色',
      toastTheme: '主题：{label}',
      toastViewList: '视图：列表',
      toastViewCards: '视图：卡片',
      crumbBack: '← 返回上级',
      emptyLoadFailedTitle: '读取书签失败',
      emptyLoadFailedText: '请确认扩展拥有「读取和更改您的书签」权限，然后在扩展管理页重新加载。',
      emptyNoBookmarksTitle: '还没有书签',
      emptyNoBookmarksText: '按 Ctrl/⌘ + Shift + O 打开书签管理器，收藏第一个网页后回到这里看看。',
      sectionUncategorized: '未分类书签',
      sectionBookmarks: '书签',
      sectionTruncated: '仅显示前 {max} 个书签（共 {total} 个）',
      emptyFolderTitle: '这个文件夹还是空的',
      emptyFolderText: '在书签管理器里把书签拖进「{name}」，这里会立刻显示。',
      emptyExpandedTitle: '这里还没有书签',
      emptyExpandedText: '在书签管理器里添加书签后，展开这里就能一次看全。',
      emptySearchTitle: '没有找到「{q}」',
      emptySearchText: '按回车使用 {engine} 搜索网页内容。',
      folderTitle: '打开文件夹：{name}',
      untitledFolder: '未命名文件夹',
      bookmarkCount: '{n} 个书签',
      bookmarkCountOne: '{n} 个书签',
      welcomeToast: '已启用：每次新建标签页都会看到你的书签',
      engineGoogle: 'Google',
      engineBing: 'Bing',
      engineBaidu: '百度',
      labelLanguage: '语言',
      hintLanguage: '界面显示语言，设置页与新标签页同时生效',
      langAuto: '跟随系统',
      langZh: '中文',
      langEn: 'English',
      panelAppearance: '外观',
      labelTheme: '主题',
      hintTheme: '跟随系统，或手动指定深浅色',
      labelViewMode: '视图模式',
      hintViewMode: '卡片信息更丰富，列表更紧凑，适合快速扫读',
      optCards: '卡片',
      optList: '列表',
      labelCardSize: '卡片尺寸',
      hintCardSize: '调整卡片密度，适配你的屏幕（列表模式不适用）',
      sizeCompact: '紧凑',
      sizeComfortable: '舒适',
      sizeLarge: '宽松',
      checkFavicon: '显示网站图标（失败时显示彩色首字母）',
      checkUrl: '显示网址',
      panelBehavior: '行为',
      checkFolderPath: '搜索结果中显示书签所在文件夹',
      checkDescriptions: '抓取网页简介，显示在卡片上',
      hintDescriptions:
        '开启后会请求「读取网站数据」权限：扩展联网读取每个书签网页的简介并缓存在本地，读取失败时卡片仍显示网址。关闭即停止抓取。',
      labelEngine: '搜索引擎',
      hintEngine: '搜索无结果时按回车会用它搜索网页',
      panelData: '数据',
      statsLine: '当前浏览器共有 {b} 个书签、{f} 个文件夹',
      statsFailed: '无法读取书签数据',
      hintOrganize: '整理书签：按 Ctrl/⌘ + Shift + O 打开 Chrome 书签管理器',
      resetBtn: '恢复默认设置',
      optFooter: '书签数据由浏览器本地提供，扩展只读取展示，不会上传到任何服务器。',
      toastSaved: '已保存',
      toastSaveFailed: '保存失败，请重试',
      toastReset: '已恢复默认设置',
      descOff: '已关闭，停止抓取网页简介',
      descDenied: '未授予「读取网站数据」权限，保持关闭',
      descOn: '已开启，简介会逐个抓取并缓存',
      optHeaderSub: '把浏览器书签变成清爽的卡片式主页',
    },
    en: {
      brandName: 'bookmarks2html',
      brandTitle: 'Back to all bookmarks',
      pageTitleNewtab: 'bookmarks2html · New Tab',
      pageTitleOptions: 'bookmarks2html · Settings',
      searchPlaceholder: 'Search bookmarks — Enter searches the web',
      searchLabel: 'Search bookmarks',
      refresh: 'Refresh bookmarks',
      viewToCards: 'Switch to card view',
      viewToList: 'Switch to list view',
      themeBtnTitle: 'Theme: {label} (click to switch)',
      settings: 'Settings',
      settingsAria: 'Open settings',
      moreApps: 'More apps',
      moreAppsTitle: 'More apps — opens in a new tab',
      tabsLabel: 'Bookmark folders',
      tabAll: 'All',
      untitled: 'Untitled',
      expandAll: 'Expand all',
      collapse: 'Collapse',
      expandTitle: 'Flatten every subfolder in the current view into one list',
      collapseTitle: 'Collapse back to browsing folders level by level',
      toastExpanded: 'Expanded all subfolders',
      toastCollapsed: 'Back to folder view',
      toastRefreshed: 'Refreshed — {n} bookmarks',
      toastRefreshFailed: 'Refresh failed, please try again',
      themeAuto: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      toastTheme: 'Theme: {label}',
      toastViewList: 'View: list',
      toastViewCards: 'View: cards',
      crumbBack: '← Back',
      emptyLoadFailedTitle: "Couldn't load bookmarks",
      emptyLoadFailedText:
        'Make sure the extension is allowed to read and change your bookmarks, then reload it on the extensions page.',
      emptyNoBookmarksTitle: 'No bookmarks yet',
      emptyNoBookmarksText:
        'Press Ctrl/⌘ + Shift + O to open the bookmark manager, save your first page and come back here.',
      sectionUncategorized: 'Uncategorized',
      sectionBookmarks: 'Bookmarks',
      sectionTruncated: 'Showing the first {max} of {total} bookmarks',
      emptyFolderTitle: 'This folder is empty',
      emptyFolderText: 'Drag bookmarks into “{name}” in the bookmark manager and they will show up here right away.',
      emptyExpandedTitle: 'No bookmarks here yet',
      emptyExpandedText: 'Add bookmarks in the bookmark manager, then expand this view to see them all at once.',
      emptySearchTitle: 'No bookmarks match “{q}”',
      emptySearchText: 'Press Enter to search the web with {engine}.',
      folderTitle: 'Open folder: {name}',
      untitledFolder: 'Untitled folder',
      bookmarkCount: '{n} bookmarks',
      bookmarkCountOne: '{n} bookmark',
      welcomeToast: 'Enabled — your bookmarks now appear on every new tab',
      engineGoogle: 'Google',
      engineBing: 'Bing',
      engineBaidu: 'Baidu',
      labelLanguage: 'Language',
      hintLanguage: 'Interface language, applies to this page and the new tab page',
      langAuto: 'System',
      langZh: '中文',
      langEn: 'English',
      panelAppearance: 'Appearance',
      labelTheme: 'Theme',
      hintTheme: 'Follow the system, or pick light / dark manually',
      labelViewMode: 'View mode',
      hintViewMode: 'Cards show more info; the list view is denser and easier to scan',
      optCards: 'Cards',
      optList: 'List',
      labelCardSize: 'Card size',
      hintCardSize: 'Tune card density to fit your screen (not used in list view)',
      sizeCompact: 'Compact',
      sizeComfortable: 'Comfortable',
      sizeLarge: 'Spacious',
      checkFavicon: 'Show site icons (fall back to a colored initial)',
      checkUrl: 'Show URLs',
      panelBehavior: 'Behavior',
      checkFolderPath: "Show each bookmark's folder in search results",
      checkDescriptions: 'Fetch page descriptions to show on cards',
      hintDescriptions:
        'When on, the extension asks for permission to read site data, then fetches and locally caches each page description. Cards fall back to the URL when a fetch fails; turning it off stops fetching.',
      labelEngine: 'Search engine',
      hintEngine: 'Used to search the web when Enter finds no bookmark matches',
      panelData: 'Data',
      statsLine: 'This browser has {b} bookmarks in {f} folders',
      statsFailed: "Couldn't read bookmark data",
      hintOrganize: "Organize: press Ctrl/⌘ + Shift + O to open Chrome's bookmark manager",
      resetBtn: 'Restore defaults',
      optFooter: 'Bookmarks stay in your browser — the extension only reads and displays them; nothing is uploaded.',
      toastSaved: 'Saved',
      toastSaveFailed: 'Failed to save, please try again',
      toastReset: 'Defaults restored',
      descOff: 'Off — stopped fetching descriptions',
      descDenied: 'Permission denied — stays off',
      descOn: 'On — descriptions will be fetched and cached one by one',
      optHeaderSub: 'Turn your browser bookmarks into a clean, card-based homepage',
    },
  };

  let currentLang = 'zh';

  function resolveLanguage(lang) {
    if (lang === 'zh' || lang === 'en') return lang;
    return String((typeof navigator !== 'undefined' && navigator.language) || '').toLowerCase().startsWith('zh')
      ? 'zh'
      : 'en';
  }

  function t(key, params) {
    const dict = I18N[currentLang] || I18N.zh;
    let text = dict[key] !== undefined ? dict[key] : I18N.zh[key] !== undefined ? I18N.zh[key] : key;
    if (params) {
      for (const name of Object.keys(params)) {
        text = text.split(`{${name}}`).join(String(params[name]));
      }
    }
    return text;
  }

  /* 按 data-i18n / data-i18n-title / data-i18n-placeholder / data-i18n-aria-label 刷新静态文案 */
  function applyI18n(root) {
    const scope = root || document;
    for (const el of scope.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of scope.querySelectorAll('[data-i18n-title]')) el.setAttribute('title', t(el.dataset.i18nTitle));
    for (const el of scope.querySelectorAll('[data-i18n-placeholder]')) {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    }
    for (const el of scope.querySelectorAll('[data-i18n-aria-label]')) {
      el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
    }
  }

  function setLanguage(lang) {
    currentLang = resolveLanguage(lang);
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    applyI18n();
    return currentLang;
  }

  const SEARCH_ENGINES = {
    google: { name: 'Google', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
    bing: { name: 'Bing', url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
    baidu: { name: '百度', url: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
  };

  /* ---------------- 设置 ---------------- */

  async function loadSettings() {
    try {
      const stored = await chrome.storage.sync.get(SETTINGS_KEY);
      return { ...DEFAULT_SETTINGS, ...(stored && stored[SETTINGS_KEY]) };
    } catch (err) {
      console.warn('[bookmarks2html] 读取设置失败', err);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async function saveSettings(patch) {
    const current = await loadSettings();
    const next = { ...current, ...patch };
    await chrome.storage.sync.set({ [SETTINGS_KEY]: next });
    return next;
  }

  function onSettingsChanged(handler) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync' || !changes[SETTINGS_KEY]) return;
      handler({ ...DEFAULT_SETTINGS, ...(changes[SETTINGS_KEY].newValue || {}) });
    });
  }

  /* ---------------- 主题 ---------------- */

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function resolveTheme(theme) {
    return theme === 'light' || theme === 'dark' ? theme : systemTheme();
  }

  function applyTheme(theme) {
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
    try {
      localStorage.setItem(THEME_LS_KEY, theme === 'light' || theme === 'dark' ? theme : 'auto');
    } catch (err) {
      /* 隐私模式下 localStorage 可能不可用，仅影响首屏闪烁 */
    }
    return resolved;
  }

  /* ---------------- 网址工具 ---------------- */

  function faviconUrl(pageUrl, size = 32) {
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', pageUrl);
    url.searchParams.set('size', String(size));
    return url.toString();
  }

  function prettyUrl(rawUrl) {
    if (!rawUrl) return '';
    try {
      const u = new URL(rawUrl);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return rawUrl;
      const host = u.host.replace(/^www\./, '');
      const path = u.pathname === '/' ? '' : decodeURIComponent(u.pathname);
      const full = host + path + (u.search || '');
      return full.length > 64 ? `${full.slice(0, 62)}…` : full;
    } catch (err) {
      return rawUrl;
    }
  }

  function hostOf(rawUrl) {
    try {
      return new URL(rawUrl).host.replace(/^www\./, '');
    } catch (err) {
      return rawUrl || '';
    }
  }

  function hashString(text) {
    let hash = 5381;
    const value = String(text || '');
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function firstLetter(text) {
    const chars = Array.from(String(text || '').trim());
    return chars.length ? chars[0].toUpperCase() : '#';
  }

  /* ---------------- 书签树 ---------------- */

  function isFolder(node) {
    return !!node && !node.url;
  }

  function countBookmarks(node) {
    let total = 0;
    for (const child of node.children || []) {
      total += isFolder(child) ? countBookmarks(child) : 1;
    }
    return total;
  }

  /* 把 chrome.bookmarks.getTree() 的结果展平为便于查询的索引 */
  function indexTree(tree) {
    const nodes = new Map();
    const parent = new Map();
    const path = new Map();
    const bookmarks = [];
    let totalFolders = 0;

    const walk = (node, ancestors) => {
      nodes.set(node.id, node);
      path.set(node.id, ancestors);
      for (const child of node.children || []) parent.set(child.id, node.id);
      if (node.url) {
        bookmarks.push({
          id: node.id,
          title: node.title || '',
          url: node.url,
          dateAdded: node.dateAdded || 0,
          folderId: node.parentId || '',
        });
      } else if (node.parentId) {
        totalFolders += 1;
      }
      const isRoot = !node.parentId;
      const nextAncestors = isRoot ? [] : ancestors.concat([{ id: node.id, title: node.title || '' }]);
      for (const child of node.children || []) walk(child, nextAncestors);
    };

    for (const root of tree || []) walk(root, []);

    const rootChildren = (((tree || [])[0] || {}).children || []).filter(isFolder);
    return {
      nodes,
      parent,
      path,
      bookmarks,
      roots: rootChildren,
      topIds: new Set(rootChildren.map((node) => node.id)),
      totalBookmarks: bookmarks.length,
      totalFolders,
    };
  }

  function searchBookmarks(index, query, limit = 200) {
    const q = String(query || '').trim().toLowerCase();
    if (!q || !index) return [];
    const hits = [];
    for (const bookmark of index.bookmarks) {
      if (bookmark.title.toLowerCase().includes(q) || bookmark.url.toLowerCase().includes(q)) {
        hits.push(bookmark);
        if (hits.length >= limit) break;
      }
    }
    return hits;
  }

  /* ---------------- 通用 UI ---------------- */

  /* 网站图标 + 首字母彩色头像的兜底 */
  function buildIconTile(title, url, options = {}) {
    const tile = document.createElement('span');
    tile.className = 'icon-tile';

    const letter = document.createElement('span');
    letter.className = `avatar av-${hashString(title || url || '') % 8}`;
    letter.textContent = firstLetter(title || hostOf(url));

    const canUseFavicon = options.showFavicon !== false && url && /^https?:/i.test(url);
    if (canUseFavicon) {
      const img = document.createElement('img');
      img.className = 'favicon';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = faviconUrl(url, 32);
      img.addEventListener('error', () => img.replaceWith(letter), { once: true });
      tile.append(img);
    } else {
      tile.append(letter);
    }
    return tile;
  }

  function debounce(fn, wait = 200) {
    let timer;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function engineName(key) {
    return (SEARCH_ENGINES[key] || SEARCH_ENGINES.google).name;
  }

  function engineUrl(key, query) {
    return (SEARCH_ENGINES[key] || SEARCH_ENGINES.google).url(query);
  }

  return {
    DEFAULT_SETTINGS,
    THEME_LS_KEY,
    DESCRIPTIONS_KEY,
    SEARCH_ENGINES,
    loadSettings,
    saveSettings,
    onSettingsChanged,
    setLanguage,
    t,
    applyI18n,
    resolveTheme,
    applyTheme,
    faviconUrl,
    prettyUrl,
    hostOf,
    hashString,
    firstLetter,
    isFolder,
    countBookmarks,
    indexTree,
    searchBookmarks,
    buildIconTile,
    debounce,
    engineName,
    engineUrl,
  };
})();
