# Chrome Web Store — Listing & Review Materials

Everything to paste into the Chrome Web Developer Dashboard when publishing
**bookmarks2html**. Text is final; character counts were verified against the
store's limits.

| Field | Limit | This listing |
|-------|:-----:|:-----------:|
| Item name | 45 | 14 |
| Single purpose statement | 150 | 122 |
| Short description | 132 | 120 |
| Release notes | 1,000 | 993 |
| Each permission justification | 1,000 | 452 / 492 / 514 / 795 |

---

## 1. Identity

- **Name:** bookmarks2html
- **Version:** 1.0.0 (kept in sync with `manifest.json` and `CHANGELOG.md`)
- **Website:** https://specialcoder.github.io/bookmarks2html/
- **Source:** https://github.com/specialCoder/bookmarks2html
- **License:** Apache-2.0
- **Category:** Productivity
- **Languages:** English, 简体中文 (the extension UI itself is bilingual)

> `manifest.json` uses the same item name (`name` / `short_name` = `bookmarks2html`) but its
> `description` is Chinese. Either ship `_locales` with a `default_locale` to make both languages
> first-class, or fill the store name and description in the Dashboard — the Dashboard values win.

---

## 2. Single purpose statement (≤150)

```
To display the bookmarks you already have in Chrome as a card-style new tab page with folder tabs, instant search, themes.
```

---

## 3. Short description (≤132)

```
Turn your Chrome bookmarks into a card-style new tab page: folder tabs, instant search, light/dark themes, bilingual UI.
```

---

## 4. Release notes (≤1,000)

```
bookmarks2html turns the bookmarks you already have into a clean, readable new tab page.

Why install it:
- Your bookmarks become a homepage. Ctrl/⌘ + T opens a card grid of the links you actually save, grouped into tabs by your bookmark-bar folders, with breadcrumb drill-down into nested folders.
- Find things fast. Search filters the whole tree as you type; when nothing matches, Enter hands the query to Google, Bing or Baidu.
- Readable by design. Site icons fall back to a colored initial so a broken image never appears, with optional page descriptions, three card sizes and a denser list view.
- Fits your setup. Light, dark or system theme applied before first paint, plus a Chinese / English interface that follows your browser language.
- Private by design. Manifest V3, zero third-party code. It reads your bookmark tree through Chrome's own API and uploads nothing. No network requests at all unless you opt in to page descriptions — switch it off and that permission is revoked.
```

---

## 5. Privacy policy URL

```
https://specialcoder.github.io/bookmarks2html/privacy.html
```

Source file: `docs/privacy.html`. Requires GitHub Pages enabled (branch `main`, folder `/docs`)
and the file pushed before the URL resolves.

### Data privacy declarations (Dashboard → Privacy tab)

- **Single purpose:** Bookmark homepage (see §2).
- **Limited Use:** Not applicable — no user data is collected.
- **Data collected:** None. The extension does not collect or transmit bookmarks, browsing
  history, search queries, or personally identifiable information.
- **Data usage / sharing:** None; no third parties, no ad networks, no trackers.
- **Affiliation:** Independent; not affiliated with Google or the Chrome Web Store.

---

## 6. Permission justifications (each ≤1,000)

### `bookmarks`
```
We use the bookmarks permission for the extension's entire function: reading the user's existing bookmark tree so it can be displayed as a card-based new tab page, and listening for bookmark change events so the page stays current without a reload. Access is strictly read-only — the extension never creates, updates, moves or deletes a bookmark, and never sends bookmark data anywhere. No other Chrome data (history, cookies, tabs, downloads) is read.
```

### `favicon`
```
We use the favicon permission to render each bookmark's site icon through Chrome's own local _favicon/ endpoint, which serves icons from the browser's existing on-device favicon cache. This is a local request to the extension itself, not a network call: it adds no tracking, sends no data off the device, and lets us show crisp icons without scraping Google's or any third party's favicon service. When Chrome has no cached icon for a site, the card falls back to a generated colored initial.
```

### `storage`
```
We use chrome.storage for two things only. (1) storage.sync: to remember the user's own interface settings — language, theme, view mode, card size, which fields cards display, and the preferred search engine — so they persist and follow the user's signed-in Chrome profile. (2) storage.local: to cache page descriptions that the user explicitly opted in to fetching, so pages are not re-requested within the cache window. Nothing is read from or written to any server; uninstalling the extension removes all of it.
```

### Optional host permissions (`<all_urls>`)
```
This is an optional, on-demand permission that is not requested at install time. The extension has a "Fetch page descriptions" switch that is off by default, so by default it has no host access and makes no network requests whatsoever. Only when the user turns that switch on does Chrome prompt for this permission, and it is then used for exactly one thing: opening the URLs already present in the user's own bookmark list to read each page's description text (the first 200 KB of the response), which is displayed on that bookmark's card. Requests are made without credentials, so no cookies or session data are sent. Results are cached locally and never uploaded. Turning the switch off immediately calls chrome.permissions.remove to revoke this permission and clears the cached descriptions.
```

---

## 7. Store metadata

- **Item name:** bookmarks2html
- **Package:** build with `scripts/package.sh` →
  `dist/bookmarks2html-v<version>.zip` (manifest at zip root)
- **Unlisted / public:** public; source published at https://github.com/specialCoder/bookmarks2html
- **In-product promotion:** the header has a "More apps" button linking to
  https://i.eatmango.cn/ (the developer's other tools). It is a plain `<a target="_blank">` link that
  opens only on user click, requests no permission, and sends no data — declare it in the review
  notes if the Dashboard asks about external links.
- **Target users:** people who keep things in the Chrome bookmark bar and want a usable homepage
  instead of the default tile grid.

---

## 8. Assets checklist (upload separately in the Dashboard)

- [x] Icon (128×128) — ready at `icons/icon128.png`
- [x] Screenshot #1 (1280×800, the store maximum) — `docs/assets/screenshot-home-light.png`:
      light theme, English UI, card view with folder-tab counts and the hover tooltip.
      Reused on the landing page (`docs/index.html`) and at the top of both READMEs.
- [ ] Screenshots #2+ (optional, the store accepts up to 10) — dark theme, list view, options page
- [ ] Store banner (1280×800)
- [ ] Small promo tile (440×280)
- [ ] Privacy policy URL (§5) is live and reachable
- [ ] Description text (§2–§4) pasted, character limits confirmed by the Dashboard

> Screenshot #1 predates the rename to `bookmarks2html`, so its header still reads "Bookmark Cards",
> and it was captured against the developer's real bookmark tree (real folder and site names).
> Re-shoot it from the dev preview (`dev-preview.html`, 50 sample bookmarks) after reloading the
> extension, so the store asset shows the current brand and no personal bookmarks.
