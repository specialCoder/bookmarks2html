# Test Cases (manual checklist)

This project has no automated test runner. Verify each release by working through the checklist
below in a real Chrome with the extension **loaded unpacked** from the repo root.

Preparation:
1. `chrome://extensions` → Developer mode ON → **Load unpacked** → select the repo root.
2. Have a few real bookmarks with at least two top-level folders, one nested subfolder, and one
   bookmark to a site you have never visited (to exercise the icon fallback).
3. After any code change: click the ⟳ reload on the extension card, then close and reopen the
   new tab — a stale new-tab page keeps running the previous build.

Legend: ☐ = not yet checked.

---

## A. Install & first run

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| A1 | Load unpacked, then press `Ctrl`/`⌘` + `T` | New tab page is the bookmark homepage; no white flash in dark mode | ☐ |
| A2 | First install (fresh profile) | The homepage opens once automatically | ☐ |
| A3 | Click the **toolbar icon** | Opens the homepage in a new tab — **no popup** appears | ☐ |
| A4 | Profile with zero bookmarks | Empty state with the "No bookmarks yet" hint, not a broken grid | ☐ |

## B. Browsing folders

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| B1 | Click each header tab | Grid switches to that folder; the tab shows the selected style **with its drop shadow intact** (not clipped) | ☐ |
| B2 | Hover a tab | Lifts 1px, border strengthens; shadow still fully visible | ☐ |
| B3 | Many tabs so the row overflows | Row scrolls horizontally; first/last tab shadows are not cut off | ☐ |
| B4 | Click a folder card | Drills in; breadcrumb appears with **← Back** | ☐ |
| B5 | Click a breadcrumb link / **← Back** | Jumps to that level / one level up | ☐ |
| B6 | Click **Expand all**, then **Collapse** | All nested bookmarks flatten into one list with folder-path chips, then restore | ☐ |
| B7 | Click a bookmark card | Opens in a **new tab in the current window** (not a new window) | ☐ |
| B8 | `Ctrl`/`⌘` + click, and middle click, a card | Native behavior: opens in a background tab of the current window | ☐ |
| B9 | Card whose site was never visited | Shows a colored initial tile, never a broken image | ☐ |
| B10 | Very long title / URL | Truncates with ellipsis, layout intact | ☐ |

## C. Search

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| C1 | Type a query | Results filter as you type, matched substring highlighted | ☐ |
| C2 | Search by URL fragment (e.g. `github.com`) | Matches on URL as well as title | ☐ |
| C3 | Toggle "Folder path in search results" | Chips with the folder path appear/disappear | ☐ |
| C4 | Query with no bookmark match, press `Enter` | Opens the configured search engine with the query | ☐ |
| C5 | Query with a match, press `Enter` | Opens the first matching bookmark in a new tab | ☐ |
| C6 | Press `/` outside the input, then `Esc` in the input | `/` focuses search; `Esc` clears and restores the folder view | ☐ |

## D. Views, theme, size, language

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| D1 | Toggle card ⇄ list from the header | Layout switches; the icon previews the *next* view; choice persists across tabs | ☐ |
| D2 | List view on a wide window | Rows pack into multiple columns | ☐ |
| D3 | Cycle the theme button | System → light → dark, applied instantly, toast names the new theme | ☐ |
| D4 | Card size: compact / comfortable / spacious | Density changes; disabled/ignored in list view | ☐ |
| D5 | Settings → Language → **English** | Options page switches instantly; a newly opened tab is fully English | ☐ |
| D6 | With a new-tab page already open, switch language | That page re-renders in the new language **without a reload** | ☐ |
| D7 | Language = **System** with a non-Chinese browser locale | UI renders in English; with a `zh-*` locale, in Chinese | ☐ |
| D8 | Switch language, then check tooltips/placeholders/empty states | No leftover strings in the previous language | ☐ |
| D9 | Click the header **More apps** (flame) button | Opens `https://i.eatmango.cn/` in a new tab of the current window; DevTools → Network shows no request until the click | ☐ |
| D10 | Narrow the window below 720px | The button collapses to icon-only (label hidden), header does not overflow | ☐ |

## E. Settings page & sync

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| E1 | Gear icon on the homepage | Opens the options page | ☐ |
| E2 | Change any setting | Toast confirms; the open homepage reflects it immediately | ☐ |
| E3 | Bookmark/folder summary line | Counts match the real profile and follow the UI language | ☐ |
| E4 | **Restore defaults** | Every control returns to its default and the homepage follows | ☐ |
| E5 | Two Chrome windows on the same profile | Settings changed in one apply in the other without reload | ☐ |

## F. Page descriptions (opt-in permission)

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| F1 | Turn "Fetch page descriptions" on | Chrome shows the site-data permission prompt; declining keeps the switch off with a toast | ☐ |
| F2 | Accept, then open a new tab | Descriptions fill into cards progressively; cards without a description still show the URL | ☐ |
| F3 | Reopen the tab right away | Cached descriptions render immediately (no refetch within the TTL) | ☐ |
| F4 | Turn the switch off | Permission revoked and the local description cache cleared | ☐ |
| F5 | DevTools → Network while the switch is off | Zero requests initiated by the extension | ☐ |

## G. Live data sync

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| G1 | Add a bookmark (Ctrl/⌘ + D) with the homepage open in another tab | The card appears without reloading | ☐ |
| G2 | Delete / rename / move a bookmark | Grid updates to match | ☐ |
| G3 | Delete the folder backing the active tab | Falls back to the "All" view instead of an empty grid | ☐ |
| G4 | Click the header refresh button | Spinner runs, toast reports the bookmark count, current tab/folder/search preserved | ☐ |

## H. Privacy & security

| # | Steps | Expected | ☐ |
|---|-------|----------|---|
| H1 | `chrome://settings/clearBrowserData`-style audit: extension details page | Only `bookmarks`, `favicon`, `storage` granted by default; site access = "on click"/none | ☐ |
| H2 | Bookmark title containing HTML (e.g. `<img src=x onerror=alert(1)>`) | Rendered as literal text — titles/paths use `textContent`, nothing is injected as HTML | ☐ |
| H3 | Bookmark with a `javascript:` URL clicked from a card | Browser blocks execution; no inline handler in extension code | ☐ |
| H4 | Search the source for remote `<script>`/`<link>`/`fetch(` outside the description feature | Only local files are referenced; the sole network call is the opt-in description fetch | ☐ |

---

Known environment limits (not bugs): the favicon service returns nothing for sites never visited,
so icon tiles legitimately fall back to initials (B9). Description fetching is throttled and can
fail per-site (CSP/offline) — the card is designed to keep showing the URL in that case.
