# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The `version` field in `manifest.json` is kept in sync with the latest entry below.

## [1.1.1] - 2026-10-12

Store policy fix: review could not reproduce the "Query" behavior 1.1.0 advertised — `chrome.search`
needs the `search` permission, which that build did not declare, so Enter threw a `TypeError` and did
nothing. Instead of adding a permission for a fallback nobody needs, the feature is removed and the
listing now describes only what the extension actually does.

### Removed
- The Enter-with-no-match web search: the `searchWeb()` call path and the `search` permission. The
  search box filters bookmarks only; with no match, Enter does nothing and the "nothing found" state
  stays on screen. The package now contains no web search, no search-engine list and no search URLs,
  so it cannot affect the user's search experience in any way.
- The `chrome.search` mock in `dev/mock-chrome.js` and the failure toast that went with it.

### Changed
- Search box placeholder and the empty-search hint no longer promise a web search (both languages);
  the keyboard docs now say Enter opens the first matching bookmark.
- README (both languages), the privacy policy and the landing page are back to the accurate claim that
  the extension makes no requests at all unless "Fetch page descriptions" is enabled — overstating
  privacy is itself a listing-accuracy problem, which is half of what review flagged.

## [1.1.0] - 2026-10-04

Store policy fix: the new tab page no longer decides which search engine to use — it delegates
web search to Chrome.

### Added
- Header "More apps…" button (flame icon, orange gradient) that opens https://i.eatmango.cn/ in a
  new tab. Plain `<a target="_blank">` — no extra permission, no request until clicked; the label is
  localized (更多应用 / More apps) and hidden below 720px so the header never overflows.

### Changed
- Enter on a query with no bookmark match now calls `chrome.search.query()`, so Chrome performs the
  search with the engine the user selected in their own browser settings, in a new tab.
- The project is named `bookmarks2html` everywhere: `manifest.json` `name` / `short_name`, the
  in-product brand (both languages), page titles, console log prefixes and all docs. The previous
  names 书签卡片 / Bookmark Cards / Bookmarks to Cards are gone; the Chinese UI text is unchanged
  apart from the brand.
- `package.sh` moved from `scripts/` to `tools/`. `scripts/` is loaded at runtime by the manifest and
  both pages, so build tooling did not belong there; the zip no longer needs a carve-out for it.

### Removed
- The "Search engine" setting (Google / Bing / 百度) and the hard-coded search URLs behind it.
  Picking an engine on the user's behalf is what the store's new-tab / search-experience policy
  prohibits; a stored `searchEngine` value from an earlier version is simply ignored now.

## [1.0.0] - 2026-10-03

Initial release: a Manifest V3 Chrome extension that turns your existing bookmarks into
a card-style new-tab homepage. Zero build step, zero runtime dependencies.

### Added

- **New-tab takeover** — `chrome_url_overrides.newtab` renders the bookmark homepage on
  `Ctrl`/`⌘` + `T`; the toolbar icon opens the same page in a new tab (no popup).
- **Card grid** — one card per bookmark, site icon fetched via the MV3 `favicon` API and
  falling back to a colored initial tile, so a broken icon never appears.
- **Folder tabs + breadcrumb** — tabs built from the subfolders of your bookmark-bar roots,
  drill into any nested folder, and step back through the breadcrumb.
- **Instant search** — filters the whole bookmark tree as you type, highlights the match,
  shows each hit's folder path, and falls back to a web search on Enter when nothing matches
  (Google / Bing / Baidu).
- **Page descriptions (optional)** — when enabled, the service worker fetches each bookmark
  page's description, caches it in `chrome.storage.local` for 30 days, and pushes it into the
  cards; the `<all_urls>` host permission is requested on demand and revoked when you turn it off.
- **Bilingual interface** — 简体中文 / English, with `auto` following `navigator.language`;
  switching language on the options page updates both the options page and any open new-tab page live.
- **Themes** — follow-system / light / dark, applied before first paint (no white flash) and
  cycle-able from the header button.
- **Two views** — card view (richer) and list view (denser, multi-column on wide screens),
  remembered across sessions.
- **Expand all** — flatten every subfolder in the current scope into one list, with the folder
  path shown as chips; one more click restores the hierarchical view.
- **Three card sizes** — compact / comfortable / spacious.
- **Display toggles** — site icons, URLs, and folder paths in search results.
- **Live data sync** — `chrome.bookmarks` change events reload the tree while keeping the active
  tab, folder and query; `chrome.storage.onChanged` applies setting changes from other pages instantly.
- **Manual refresh** — the header refresh button re-reads the bookmark tree and reports the count.
- **Options page** — appearance, behavior and data panels, plus a bookmark/folder count summary
  and restore-defaults.
- **Dev preview harness** — `dev-preview.html` + `dev/mock-chrome.js` run both pages in a normal
  browser tab with 50 mock bookmarks and no extension install required.

### Fixed

- Selected folder tab's drop shadow is no longer clipped: `.tabs` scrolls horizontally, which also
  made it clip vertically, so the scroll container now reserves padding (offset by negative margin)
  for the shadow to paint into.
