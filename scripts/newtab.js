/* 书签卡片 · 新标签页：文件夹 Tab、卡片网格、搜索、面包屑下钻 */
(() => {
  'use strict';

  const ALL = '__all__';
  const MAX_CARDS = 500;
  const MAX_RESULTS = 200;

  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none"/></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/><path d="M23 4v6h-6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.2 14.6a1.6 1.6 0 0 0 .32 1.77l.05.06a2 2 0 1 1-2.83 2.82l-.06-.05a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.77.32l-.06.05a2 2 0 1 1-2.82-2.82l.05-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.77l-.05-.06a2 2 0 1 1 2.82-2.82l.06.05a1.6 1.6 0 0 0 1.77.32h.08a1.6 1.6 0 0 0 .97-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 .97 1.46 1.6 1.6 0 0 0 1.77-.32l.06-.05a2 2 0 1 1 2.82 2.82l-.05.06a1.6 1.6 0 0 0-.32 1.77v.08a1.6 1.6 0 0 0 1.47.97H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.46.97Z"/></svg>',
    folder:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.6A2.6 2.6 0 0 1 5.6 5h3.1a2 2 0 0 1 1.6.8l.9 1.2h7.2A2.6 2.6 0 0 1 21 9.6v7.8A2.6 2.6 0 0 1 18.4 20H5.6A2.6 2.6 0 0 1 3 17.4Z"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>',
    chevron:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9.5 6h11M9.5 12h11M9.5 18h11"/><circle cx="4.4" cy="6" r="1.15" fill="currentColor" stroke="none"/><circle cx="4.4" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="4.4" cy="18" r="1.15" fill="currentColor" stroke="none"/></svg>',
    cards:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3.4" y="3.4" width="7.7" height="7.7" rx="2.2"/><rect x="12.9" y="3.4" width="7.7" height="7.7" rx="2.2"/><rect x="3.4" y="12.9" width="7.7" height="7.7" rx="2.2"/><rect x="12.9" y="12.9" width="7.7" height="7.7" rx="2.2"/></svg>',
    chevronsDown:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 6.5 5 5 5-5"/><path d="m7 12.5 5 5 5-5"/></svg>',
    chevronsUp:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 11.5-5-5-5 5"/><path d="m17 17.5-5-5-5 5"/></svg>',
  };

  const THEME_LABELS = {
    auto: { icon: 'auto', key: 'themeAuto' },
    light: { icon: 'sun', key: 'themeLight' },
    dark: { icon: 'moon', key: 'themeDark' },
  };
  const THEME_ORDER = ['auto', 'light', 'dark'];

  const $ = (id) => document.getElementById(id);
  const els = {
    grid: $('grid'),
    empty: $('empty'),
    emptyIcon: $('emptyIcon'),
    emptyTitle: $('emptyTitle'),
    emptyText: $('emptyText'),
    tabs: $('tabs'),
    expandBtn: $('expandBtn'),
    crumb: $('crumb'),
    searchInput: $('searchInput'),
    refreshBtn: $('refreshBtn'),
    viewBtn: $('viewBtn'),
    themeBtn: $('themeBtn'),
    settingsBtn: $('settingsBtn'),
    brandBtn: $('brandBtn'),
    toast: $('toast'),
  };

  const state = {
    settings: { ...B2H.DEFAULT_SETTINGS },
    index: null,
    tabs: [],
    activeTabId: ALL,
    folderId: null,
    query: '',
    results: [],
    refreshing: false,
    expandAll: false,
  };

  const descriptions = new Map();
  const requested = new Set();

  init();

  async function init() {
    state.settings = await B2H.loadSettings();
    B2H.setLanguage(state.settings.language);
    applySettings(state.settings);
    renderThemeButton();
    renderViewButton();
    els.refreshBtn.innerHTML = ICONS.refresh;
    els.settingsBtn.innerHTML = ICONS.gear;
    bindEvents();
    await loadDescriptions();
    try {
      await reloadBookmarks();
    } catch (err) {
      console.error('[书签卡片] 初始化失败', err);
      showEmpty(B2H.t('emptyLoadFailedTitle'), B2H.t('emptyLoadFailedText'), 'folder');
    }
    showWelcomeIfNeeded();
  }

  /* ---------------- 数据 ---------------- */

  async function reloadBookmarks() {
    const tree = await chrome.bookmarks.getTree();
    state.index = B2H.indexTree(tree);
    state.tabs = buildTabs(state.index);
    ensureValidState();
    render();
  }

  /* 手动刷新：重新拉取书签树，保留当前 Tab、文件夹与搜索状态。
     转一圈的最短时长让刷新动作可见，书签少时也能看清反馈。 */
  const SPIN_MIN_MS = 420;

  async function refreshBookmarks() {
    if (state.refreshing) return;
    state.refreshing = true;
    els.refreshBtn.classList.add('is-spinning');
    try {
      await Promise.all([reloadBookmarks(), new Promise((resolve) => setTimeout(resolve, SPIN_MIN_MS))]);
      toast(B2H.t('toastRefreshed', { n: state.index.totalBookmarks }));
    } catch (err) {
      console.error('[书签卡片] 刷新书签失败', err);
      toast(B2H.t('toastRefreshFailed'));
    } finally {
      state.refreshing = false;
      els.refreshBtn.classList.remove('is-spinning');
    }
  }

  /* 顶层文件夹（书签栏 / 其他书签 / 移动端书签…）的直接子文件夹作为 Tab */
  function buildTabs(index) {
    const tabs = [{ id: ALL, title: '', count: index.totalBookmarks, isAll: true }];
    for (const top of index.roots) {
      for (const child of top.children || []) {
        if (!B2H.isFolder(child)) continue;
        tabs.push({
          id: child.id,
          title: child.title || '',
          count: B2H.countBookmarks(child),
          topId: top.id,
        });
      }
    }
    return tabs;
  }

  function ensureValidState() {
    if (state.activeTabId !== ALL && !state.tabs.some((tab) => tab.id === state.activeTabId)) {
      state.activeTabId = ALL;
    }
    if (state.folderId && !state.index.nodes.has(state.folderId)) {
      state.folderId = null;
    }
  }

  /* ---------------- 设置 ---------------- */

  function applySettings(settings) {
    B2H.applyTheme(settings.theme);
    document.documentElement.dataset.cardSize = settings.cardSize || 'comfortable';
    document.documentElement.dataset.view = settings.viewMode === 'list' ? 'list' : 'card';
  }

  function renderThemeButton() {
    const theme = state.settings.theme;
    const meta = THEME_LABELS[theme] || THEME_LABELS.auto;
    els.themeBtn.innerHTML = ICONS[meta.icon];
    els.themeBtn.title = B2H.t('themeBtnTitle', { label: B2H.t(meta.key) });
    els.themeBtn.setAttribute('aria-label', els.themeBtn.title);
  }

  function cycleTheme() {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(state.settings.theme) + 1) % THEME_ORDER.length];
    state.settings.theme = next;
    applySettings(state.settings);
    renderThemeButton();
    toast(B2H.t('toastTheme', { label: B2H.t(THEME_LABELS[next].key) }));
    B2H.saveSettings({ theme: next }).catch((err) => console.warn(err));
  }

  /* 按钮图标显示的是「点一下会切到的目标视图」 */
  function renderViewButton() {
    const isList = state.settings.viewMode === 'list';
    els.viewBtn.innerHTML = ICONS[isList ? 'cards' : 'list'];
    els.viewBtn.title = B2H.t(isList ? 'viewToCards' : 'viewToList');
    els.viewBtn.setAttribute('aria-label', els.viewBtn.title);
  }

  function toggleViewMode() {
    const next = state.settings.viewMode === 'list' ? 'card' : 'list';
    state.settings.viewMode = next;
    applySettings(state.settings);
    renderViewButton();
    toast(B2H.t(next === 'list' ? 'toastViewList' : 'toastViewCards'));
    B2H.saveSettings({ viewMode: next }).catch((err) => console.warn(err));
  }

  /* ---------------- 渲染 ---------------- */

  function render() {
    renderTabs();
    renderCrumb();
    renderExpandButton();
    if (!state.index) return;
    if (state.query) renderSearch();
    else if (state.expandAll) renderExpanded();
    else if (state.folderId) renderFolder(state.folderId);
    else renderAll();
  }

  function renderExpandButton() {
    const on = state.expandAll;
    els.expandBtn.innerHTML = `${ICONS[on ? 'chevronsUp' : 'chevronsDown']}<span>${B2H.t(on ? 'collapse' : 'expandAll')}</span>`;
    els.expandBtn.setAttribute('aria-pressed', String(on));
    els.expandBtn.title = B2H.t(on ? 'collapseTitle' : 'expandTitle');
  }

  function toggleExpandAll() {
    state.expandAll = !state.expandAll;
    render();
    toast(B2H.t(state.expandAll ? 'toastExpanded' : 'toastCollapsed'));
  }

  function renderTabs() {
    const frag = document.createDocumentFragment();
    for (const tab of state.tabs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab';
      btn.setAttribute('role', 'tab');
      const selected = state.activeTabId === tab.id;
      btn.setAttribute('aria-selected', String(selected));

      const labelText = tab.isAll ? B2H.t('tabAll') : tab.title || B2H.t('untitled');
      btn.title = labelText;

      const label = document.createElement('span');
      label.textContent = labelText;
      btn.append(label);

      if (typeof tab.count === 'number') {
        const count = document.createElement('span');
        count.className = 'tab__count';
        count.textContent = String(tab.count);
        btn.append(count);
      }

      btn.addEventListener('click', () => selectTab(tab.id));
      frag.append(btn);
    }
    els.tabs.replaceChildren(frag);

    const active = els.tabs.querySelector('[aria-selected="true"]');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function renderCrumb() {
    const drilled = state.folderId && state.folderId !== state.activeTabId;
    if (!drilled) {
      els.crumb.hidden = true;
      els.crumb.replaceChildren();
      return;
    }

    const trail = [];
    for (const item of state.index.path.get(state.folderId) || []) trail.push(item);
    const node = state.index.nodes.get(state.folderId);
    if (node) trail.push({ id: node.id, title: node.title || '' });

    let start = 0;
    if (state.activeTabId !== ALL) {
      const tabIndex = trail.findIndex((item) => item.id === state.activeTabId);
      if (tabIndex >= 0) start = tabIndex + 1;
    }
    const items = trail.slice(start);

    const frag = document.createDocumentFragment();
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'crumb__back';
    back.textContent = B2H.t('crumbBack');
    back.addEventListener('click', goUp);
    frag.append(back);

    items.forEach((item, position) => {
      if (position > 0) {
        const sep = document.createElement('span');
        sep.className = 'crumb__sep';
        sep.textContent = '/';
        frag.append(sep);
      }
      const isLast = position === items.length - 1;
      if (isLast) {
        const current = document.createElement('span');
        current.className = 'crumb__current';
        current.textContent = item.title || B2H.t('untitled');
        frag.append(current);
      } else {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'crumb__link';
        link.textContent = item.title || B2H.t('untitled');
        link.addEventListener('click', () => openFolder(item.id));
        frag.append(link);
      }
    });

    els.crumb.replaceChildren(frag);
    els.crumb.hidden = false;
  }

  function renderAll() {
    const { index } = state;
    const folderTabs = state.tabs.filter((tab) => !tab.isAll);
    const loose = index.bookmarks.filter((bookmark) => index.topIds.has(bookmark.folderId));

    if (!folderTabs.length && !loose.length) {
      showEmpty(B2H.t('emptyNoBookmarksTitle'), B2H.t('emptyNoBookmarksText'), 'folder');
      return;
    }

    const frag = document.createDocumentFragment();
    let order = 0;
    for (const tab of folderTabs) {
      const node = index.nodes.get(tab.id);
      if (node) frag.append(folderCard(node, order++));
    }
    if (folderTabs.length && loose.length) frag.append(sectionLabel(B2H.t('sectionUncategorized')));
    for (const bookmark of loose.slice(0, MAX_CARDS)) {
      frag.append(bookmarkCard(bookmark, order++, { showPath: false }));
    }
    if (loose.length > MAX_CARDS) {
      frag.append(sectionLabel(B2H.t('sectionTruncated', { max: MAX_CARDS, total: loose.length })));
    }

    showGrid(frag);
  }

  function renderFolder(folderId) {
    const node = state.index.nodes.get(folderId);
    if (!node) return renderAll();
    const children = node.children || [];
    const folders = children.filter(B2H.isFolder);
    const links = children.filter((child) => child.url);

    if (!children.length) {
      showEmpty(
        B2H.t('emptyFolderTitle'),
        B2H.t('emptyFolderText', { name: node.title || B2H.t('untitled') }),
        'folder'
      );
      return;
    }

    const frag = document.createDocumentFragment();
    let order = 0;
    for (const folder of folders) frag.append(folderCard(folder, order++));
    if (folders.length && links.length) frag.append(sectionLabel(B2H.t('sectionBookmarks')));
    for (const child of links.slice(0, MAX_CARDS)) {
      frag.append(
        bookmarkCard(
          {
            id: child.id,
            title: child.title || '',
            url: child.url,
            dateAdded: child.dateAdded || 0,
            folderId,
          },
          order++,
          { showPath: false }
        )
      );
    }
    if (links.length > MAX_CARDS) {
      frag.append(sectionLabel(B2H.t('sectionTruncated', { max: MAX_CARDS, total: links.length })));
    }

    showGrid(frag);
  }

  /* 展开模式：把当前范围内的子文件夹递归摊平，所有书签一起展示 */
  function renderExpanded() {
    const scopeId = state.folderId || (state.activeTabId === ALL ? null : state.activeTabId);
    const scopeNode = scopeId ? state.index.nodes.get(scopeId) : null;
    const bookmarks = [];
    if (scopeNode) collectBookmarks(scopeNode, bookmarks);
    else bookmarks.push(...state.index.bookmarks);

    if (!bookmarks.length) {
      showEmpty(B2H.t('emptyExpandedTitle'), B2H.t('emptyExpandedText'), 'folder');
      return;
    }

    const frag = document.createDocumentFragment();
    let order = 0;
    for (const bookmark of bookmarks.slice(0, MAX_CARDS)) {
      frag.append(bookmarkCard(bookmark, order++, { showPath: true, forcePath: true, pathScopeId: scopeId }));
    }
    if (bookmarks.length > MAX_CARDS) {
      frag.append(sectionLabel(B2H.t('sectionTruncated', { max: MAX_CARDS, total: bookmarks.length })));
    }
    showGrid(frag);
  }

  function collectBookmarks(node, out) {
    for (const child of node.children || []) {
      if (child.url) {
        out.push({
          id: child.id,
          title: child.title || '',
          url: child.url,
          dateAdded: child.dateAdded || 0,
          folderId: child.parentId || node.id,
        });
      } else {
        collectBookmarks(child, out);
      }
    }
  }

  function renderSearch() {
    const query = state.query;
    const results = B2H.searchBookmarks(state.index, query, MAX_RESULTS);
    state.results = results;

    if (!results.length) {
      showEmpty(
        B2H.t('emptySearchTitle', { q: query }),
        B2H.t('emptySearchText', { engine: engineLabel() }),
        'search'
      );
      return;
    }

    const frag = document.createDocumentFragment();
    results.forEach((bookmark, position) => {
      frag.append(bookmarkCard(bookmark, position, { highlight: query, showPath: true }));
    });
    showGrid(frag);
  }

  /* ---------------- 卡片 ---------------- */

  function bookmarkCard(bookmark, order, options = {}) {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = bookmark.url;
    card.title = `${bookmark.title || bookmark.url}\n${bookmark.url}`;
    card.style.setProperty('--i', String(order % 24));
    /* 普通左键点击由 grid 委托处理器拦截走 chrome.tabs.create；
       带修饰键 / 中键点击回退到原生 <a target=_blank> 行为 */
    card.target = '_blank';
    card.rel = 'noreferrer';

    card.append(B2H.buildIconTile(bookmark.title, bookmark.url, { showFavicon: state.settings.showFavicon }));

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('div');
    title.className = 'card__title';
    if (options.highlight) appendHighlighted(title, bookmark.title || bookmark.url, options.highlight);
    else title.textContent = bookmark.title || bookmark.url;
    body.append(title);

    const description = descriptionOf(bookmark.url);
    if (description) {
      body.append(descriptionNode(description));
    } else {
      card.dataset.descUrl = bookmark.url;
      if (state.settings.showUrl) {
        const url = document.createElement('div');
        url.className = 'card__url';
        url.textContent = B2H.prettyUrl(bookmark.url);
        body.append(url);
      }
    }

    if (options.showPath && (state.settings.showFolderPath || options.forcePath)) {
      const chips = buildPathChips(bookmark, options.pathScopeId);
      if (chips) body.append(chips);
    }

    card.append(body);
    return card;
  }

  function folderCard(folder, order) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card card--folder';
    card.dataset.folderId = folder.id;
    card.title = B2H.t('folderTitle', { name: folder.title || B2H.t('untitled') });
    card.style.setProperty('--i', String(order % 24));

    const tile = document.createElement('span');
    tile.className = 'icon-tile icon-tile--folder';
    tile.innerHTML = ICONS.folder;
    card.append(tile);

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('div');
    title.className = 'card__title';
    title.textContent = folder.title || B2H.t('untitledFolder');
    body.append(title);

    const meta = document.createElement('div');
    meta.className = 'card__url';
    const count = B2H.countBookmarks(folder);
    meta.textContent = B2H.t(count === 1 ? 'bookmarkCountOne' : 'bookmarkCount', { n: count });
    body.append(meta);

    const parentId = state.index.parent.get(folder.id);
    const parentNode = parentId ? state.index.nodes.get(parentId) : null;
    if (parentNode && parentId !== '1' && state.index.topIds.has(parentId) && parentNode.title) {
      const chips = document.createElement('div');
      chips.className = 'card__path';
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = parentNode.title;
      chips.append(chip);
      body.append(chips);
    }

    card.append(body);

    const chevron = document.createElement('span');
    chevron.className = 'chev';
    chevron.innerHTML = ICONS.chevron;
    card.append(chevron);

    return card;
  }

  /* cutBefore：展开模式的当前范围 id，裁掉范围自身的层级，只留子文件夹路径 */
  function buildPathChips(bookmark, cutBefore) {
    let trail = (state.index.path.get(bookmark.id) || []).filter((item) => item.id !== '1');
    if (cutBefore) {
      const at = trail.findIndex((item) => item.id === cutBefore);
      if (at >= 0) trail = trail.slice(at + 1);
    }
    if (!trail.length) return null;
    const chips = document.createElement('div');
    chips.className = 'card__path';
    for (const item of trail) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = item.title || B2H.t('untitled');
      chips.append(chip);
    }
    return chips;
  }

  function sectionLabel(text) {
    const label = document.createElement('div');
    label.className = 'section-label';
    label.textContent = text;
    return label;
  }

  function engineLabel() {
    const key = state.settings.searchEngine;
    if (key === 'baidu') return B2H.t('engineBaidu');
    if (key === 'bing') return B2H.t('engineBing');
    return B2H.t('engineGoogle');
  }

  function appendHighlighted(target, text, query) {
    const source = String(text || '');
    const lower = source.toLowerCase();
    const needle = query.toLowerCase();
    let cursor = 0;

    while (needle) {
      const hit = lower.indexOf(needle, cursor);
      if (hit === -1) break;
      if (hit > cursor) target.append(document.createTextNode(source.slice(cursor, hit)));
      const mark = document.createElement('mark');
      mark.textContent = source.slice(hit, hit + needle.length);
      target.append(mark);
      cursor = hit + needle.length;
    }
    target.append(document.createTextNode(source.slice(cursor)));
  }

  /* ---------------- 视图切换 ---------------- */

  function showGrid(frag) {
    els.empty.hidden = true;
    els.grid.hidden = false;
    els.grid.replaceChildren(frag);
    requestDescriptions(
      Array.from(els.grid.querySelectorAll('[data-desc-url]'), (card) => card.dataset.descUrl)
    );
  }

  function showEmpty(title, text, iconName) {
    els.grid.hidden = true;
    els.grid.replaceChildren();
    els.empty.hidden = false;
    els.emptyIcon.innerHTML = ICONS[iconName] || ICONS.folder;
    els.emptyTitle.textContent = title;
    els.emptyText.textContent = text;
  }

  function selectTab(tabId) {
    state.activeTabId = tabId;
    state.folderId = tabId === ALL ? null : tabId;
    clearQuery();
    render();
    window.scrollTo({ top: 0 });
  }

  function openFolder(folderId) {
    const isTab = state.tabs.some((tab) => tab.id === folderId);
    if (isTab) state.activeTabId = folderId;
    state.folderId = folderId;
    clearQuery();
    render();
    window.scrollTo({ top: 0 });
  }

  function goUp() {
    if (!state.folderId) return;
    const parentId = state.index.parent.get(state.folderId);
    const parentNode = parentId ? state.index.nodes.get(parentId) : null;
    const atRoot = !parentId || !parentNode || parentNode.id === '0' || state.index.topIds.has(parentId) || parentId === state.activeTabId;
    if (atRoot) {
      state.folderId = state.activeTabId === ALL ? null : state.activeTabId;
    } else {
      state.folderId = parentId;
    }
    render();
  }

  function clearQuery() {
    state.query = '';
    state.results = [];
    els.searchInput.value = '';
  }

  /* ---------------- 交互 ---------------- */

  function bindEvents() {
    els.grid.addEventListener('click', (event) => {
      const cardLink = event.target.closest('a.card');
      if (cardLink && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        openUrl(cardLink.href);
        return;
      }
      const folderEl = event.target.closest('[data-folder-id]');
      if (folderEl) {
        event.preventDefault();
        openFolder(folderEl.dataset.folderId);
      }
    });

    els.searchInput.addEventListener(
      'input',
      B2H.debounce(() => {
        state.query = els.searchInput.value.trim();
        render();
      }, 90)
    );
    els.searchInput.addEventListener('keydown', onSearchKey);

    els.refreshBtn.addEventListener('click', refreshBookmarks);
    els.viewBtn.addEventListener('click', toggleViewMode);
    els.expandBtn.addEventListener('click', toggleExpandAll);
    els.themeBtn.addEventListener('click', cycleTheme);
    els.settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
    els.brandBtn.addEventListener('click', () => selectTab(ALL));

    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        els.searchInput.focus();
        els.searchInput.select();
      }
    });

    B2H.onSettingsChanged((next) => {
      const descriptionsToggled = next.fetchDescriptions !== state.settings.fetchDescriptions;
      state.settings = next;
      B2H.setLanguage(next.language);
      applySettings(next);
      renderThemeButton();
      renderViewButton();
      if (!descriptionsToggled) {
        render();
        return;
      }
      requested.clear();
      loadDescriptions().then(() => render());
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message && message.type === 'b2h:described') applyDescriptions(message.entries);
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (state.settings.theme === 'auto') applySettings(state.settings);
      });
    }

    const reload = B2H.debounce(() => {
      reloadBookmarks().catch((err) => console.warn('[书签卡片] 刷新书签失败', err));
    }, 350);
    for (const name of ['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered', 'onImportEnded']) {
      try {
        chrome.bookmarks[name].addListener(reload);
      } catch (err) {
        /* 个别事件在旧版本不存在时忽略 */
      }
    }
  }

  function onSearchKey(event) {
    if (event.key === 'Escape') {
      clearQuery();
      render();
      els.searchInput.blur();
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;

    const hit = state.index ? B2H.searchBookmarks(state.index, query, 1)[0] : null;
    if (hit) {
      openUrl(hit.url);
    } else {
      window.open(B2H.engineUrl(state.settings.searchEngine, query), '_blank', 'noopener');
    }
  }

  function openUrl(url) {
    chrome.tabs.create({ url, active: true });
  }

  function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
  }

  /* ---------------- 网页简介 ---------------- */

  function descriptionOf(url) {
    return state.settings.fetchDescriptions ? descriptions.get(url) || '' : '';
  }

  function descriptionNode(text) {
    const desc = document.createElement('div');
    desc.className = 'card__desc';
    desc.textContent = text;
    return desc;
  }

  async function loadDescriptions() {
    if (!state.settings.fetchDescriptions) return;
    try {
      const stored = await chrome.storage.local.get(B2H.DESCRIPTIONS_KEY);
      const entries = (stored && stored[B2H.DESCRIPTIONS_KEY]) || {};
      for (const url of Object.keys(entries)) {
        const entry = entries[url];
        if (entry && entry.text) descriptions.set(url, entry.text);
      }
    } catch (err) {
      console.warn('[书签卡片] 读取网页简介缓存失败', err);
    }
  }

  /* 交给后台去抓取还没有简介的书签，抓到后按 b2h:described 补进卡片 */
  function requestDescriptions(urls) {
    if (!state.settings.fetchDescriptions) return;
    const missing = urls.filter((url) => url && !descriptions.has(url) && !requested.has(url));
    if (!missing.length) return;
    for (const url of missing) requested.add(url);
    chrome.runtime
      .sendMessage({ type: 'b2h:describe', urls: missing })
      .then((response) => applyDescriptions(response && response.entries))
      .catch(() => {
        /* 后台未就绪时的静默降级：继续显示网址 */
      });
  }

  function applyDescriptions(entries) {
    let changed = false;
    for (const url of Object.keys(entries || {})) {
      const text = entries[url];
      if (!text || descriptions.get(url) === text) continue;
      descriptions.set(url, text);
      changed = true;
    }
    if (changed) patchCardDescriptions();
  }

  function patchCardDescriptions() {
    for (const card of els.grid.querySelectorAll('[data-desc-url]')) {
      const text = descriptions.get(card.dataset.descUrl);
      if (!text) continue;
      const body = card.querySelector('.card__body');
      const title = card.querySelector('.card__title');
      if (!body || !title) continue;
      title.after(descriptionNode(text));
      const url = body.querySelector('.card__url');
      if (url) url.remove();
      card.removeAttribute('data-desc-url');
    }
  }

  /* ---------------- 提示 ---------------- */

  let toastTimer;

  function toast(text, duration = 2400) {
    els.toast.textContent = text;
    els.toast.hidden = false;
    requestAnimationFrame(() => els.toast.classList.add('toast--show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('toast--show');
      setTimeout(() => {
        els.toast.hidden = true;
      }, 240);
    }, duration);
  }

  function showWelcomeIfNeeded() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') !== '1') return;
    history.replaceState(null, '', window.location.pathname);
    toast(B2H.t('welcomeToast'), 4000);
  }
})();
