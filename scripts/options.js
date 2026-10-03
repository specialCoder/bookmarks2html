/* 书签卡片 · 设置页逻辑 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const els = {
    themeRadios: Array.from(document.querySelectorAll('input[name="theme"]')),
    languageRadios: Array.from(document.querySelectorAll('input[name="language"]')),
    viewMode: $('viewMode'),
    cardSize: $('cardSize'),
    showFavicon: $('showFavicon'),
    showUrl: $('showUrl'),
    fetchDescriptions: $('fetchDescriptions'),
    showFolderPath: $('showFolderPath'),
    searchEngine: $('searchEngine'),
    resetBtn: $('resetBtn'),
    statsLine: $('statsLine'),
    toast: $('toast'),
  };

  let toastTimer;

  init();

  async function init() {
    const settings = await B2H.loadSettings();
    B2H.applyTheme(settings.theme);
    B2H.setLanguage(settings.language);
    await syncDescriptionPermission(settings);
    bind();
    renderStats();
  }

  /* 权限被外部撤销时自动回退设置，勾选状态始终等于实际设置 */
  async function syncDescriptionPermission(settings) {
    let granted = false;
    try {
      granted = await chrome.permissions.contains({ origins: ['<all_urls>'] });
    } catch (err) {
      granted = false;
    }
    if (!granted && settings.fetchDescriptions) {
      settings = await B2H.saveSettings({ fetchDescriptions: false });
    }
    fill(settings);
  }

  function fill(settings) {
    const radio = els.themeRadios.find((item) => item.value === settings.theme);
    if (radio) radio.checked = true;
    const langRadio = els.languageRadios.find((item) => item.value === settings.language);
    if (langRadio) langRadio.checked = true;
    els.viewMode.value = settings.viewMode === 'list' ? 'list' : 'card';
    els.cardSize.value = settings.cardSize;
    els.cardSize.disabled = els.viewMode.value === 'list';
    els.showFavicon.checked = settings.showFavicon;
    els.showUrl.checked = settings.showUrl;
    els.showFolderPath.checked = settings.showFolderPath;
    els.searchEngine.value = settings.searchEngine;
    els.fetchDescriptions.checked = !!settings.fetchDescriptions;
  }

  function bind() {
    for (const radio of els.themeRadios) {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        B2H.applyTheme(radio.value);
        save({ theme: radio.value });
      });
    }

    for (const radio of els.languageRadios) {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        save({ language: radio.value });
      });
    }

    els.viewMode.addEventListener('change', () => {
      els.cardSize.disabled = els.viewMode.value === 'list';
      save({ viewMode: els.viewMode.value });
    });
    els.cardSize.addEventListener('change', () => save({ cardSize: els.cardSize.value }));
    els.showFavicon.addEventListener('change', () => save({ showFavicon: els.showFavicon.checked }));
    els.showUrl.addEventListener('change', () => save({ showUrl: els.showUrl.checked }));
    els.showFolderPath.addEventListener('change', () => save({ showFolderPath: els.showFolderPath.checked }));
    els.searchEngine.addEventListener('change', () => save({ searchEngine: els.searchEngine.value }));
    els.fetchDescriptions.addEventListener('change', onToggleDescriptions);

    els.resetBtn.addEventListener('click', async () => {
      const hadPermission = els.fetchDescriptions.checked;
      await save({ ...B2H.DEFAULT_SETTINGS }, B2H.t('toastReset'));
      if (hadPermission) removeDescriptionPermission();
    });

    B2H.onSettingsChanged((next) => {
      B2H.setLanguage(next.language);
      fill(next);
      B2H.applyTheme(next.theme);
      renderStats();
    });
  }

  async function save(patch, message = B2H.t('toastSaved')) {
    try {
      await B2H.saveSettings(patch);
      toast(message);
    } catch (err) {
      console.error('[书签卡片] 保存设置失败', err);
      toast(B2H.t('toastSaveFailed'));
    }
  }

  /* ---------------- 网页简介权限 ---------------- */

  async function onToggleDescriptions() {
    if (!els.fetchDescriptions.checked) {
      await save({ fetchDescriptions: false }, B2H.t('descOff'));
      removeDescriptionPermission();
      return;
    }

    let granted = false;
    try {
      granted = await chrome.permissions.request({ origins: ['<all_urls>'] });
    } catch (err) {
      granted = false;
    }
    if (!granted) {
      els.fetchDescriptions.checked = false;
      toast(B2H.t('descDenied'));
      return;
    }
    await save({ fetchDescriptions: true }, B2H.t('descOn'));
  }

  function removeDescriptionPermission() {
    chrome.permissions.remove({ origins: ['<all_urls>'] }).catch(() => {});
  }

  async function renderStats() {
    try {
      const tree = await chrome.bookmarks.getTree();
      const index = B2H.indexTree(tree);
      els.statsLine.textContent = B2H.t('statsLine', { b: index.totalBookmarks, f: index.totalFolders });
    } catch (err) {
      els.statsLine.textContent = B2H.t('statsFailed');
    }
  }

  function toast(text, duration = 2000) {
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
})();
