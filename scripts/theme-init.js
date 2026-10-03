/* 首屏同步应用主题，避免深色模式下的白屏闪烁。
   与 scripts/shared.js 中的 THEME_LS_KEY 保持一致。 */
(() => {
  'use strict';
  let stored = null;
  try {
    stored = localStorage.getItem('b2h-theme');
  } catch (err) {
    stored = null;
  }
  const resolved =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.dataset.theme = resolved;
})();
