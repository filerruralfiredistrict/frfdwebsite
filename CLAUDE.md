# Filer Rural Fire District — Project Specification

This file documents the complete site build for any AI model or developer continuing work on this project. Read this before making any changes.

---

## Project Overview

A static website for **Filer Rural Fire District, Station 26**, located in Filer, Idaho. Built to replace their previous Streamline-hosted site to eliminate ongoing hosting fees.

**Built by:** BeepFix.com  
**Primary contact:** Phil Roberts, Fire Chief — (208) 613-2988 — chief@filerruralfire.com  
**District phone:** (208) 326-4111  
**Address:** 100 US-30, Filer, ID 83328 (also: PO Box 227, Filer, ID 83328)  
**Station number:** Station 26 (NOT Station 20 — common mistake)

---

## Hosting & Infrastructure

| Service | Account | Purpose |
|---|---|---|
| GitHub | filerruralfiredistrict/frfdwebsite | Source code repository |
| Cloudflare Pages | filerruralfiredistrict@gmail.com | Hosting & deployment (auto-deploys on push to main) |
| Web3Forms | filerruralfiredistrict@gmail.com | Contact & volunteer form submissions |
| Decap CMS | `/admin` on live site | Browser-based news editor for district staff |

**Dev access (Andrew Cameron / BeepFix):** `revcam` added as collaborator on `filerruralfiredistrict/frfdwebsite`  
**Note:** A BeepFix GitHub account may replace `revcam` as the official developer account in future — add as collaborator + update `admin/config.yml` authorize list when ready.  
**Staging URL:** https://frfdwebsite.pages.dev (live and working)  
**Primary domain:** filerfd.org (DNS transferred to Cloudflare — pending propagation)  
**Secondary domain:** filerfireandrescue.org (pending transfer to Namecheap — connect to Cloudflare Pages once available)

---

## Tech Stack

- **Pure HTML/CSS/JavaScript** — no build tools, no npm, no frameworks
- **No dependencies** — everything is vanilla. Do not introduce npm packages or build steps.
- **Cloudflare Pages Functions** — used only for GitHub OAuth (`functions/api/auth.js` and `functions/api/callback.js`)
- **Decap CMS v3** — loaded from CDN in `admin/index.html`
- **Web3Forms** — contact form backend (free, unlimited submissions)

---

## Brand Guidelines

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#1D2B3A` | Primary background, header, footer |
| `--red` | `#CC2020` | Accent, buttons, borders, highlights |
| `--white` | `#FFFFFF` | Page background, card backgrounds |
| `--gray` | `#A8B8C4` | Subdued text, secondary info |
| `--light` | `#F4F6F8` | Alternating section backgrounds |
| `--dark` | `#111820` | Footer background, dark bar |
| `--text` | `#2C3E50` | Body text |

**Font:** System font stack — `'Segoe UI', system-ui, -apple-system, sans-serif`. No Google Fonts. Do not add external font dependencies.

**Logo:** `assets/images/logo.png` — Maltese cross emblem, navy/red/white/gray. Station 26.

---

## File Structure

```
/
├── index.html              # Home page
├── history.html            # District history (est. 1928)
├── governance.html         # Board members, meetings, staff, transparency
├── services.html           # Services list, burn permits, FAQs
├── news.html               # News/updates feed
├── contact.html            # Contact form + map
├── volunteer.html          # Volunteer recruitment + interest form
├── privacy.html            # Privacy policy
├── accessibility.html      # WCAG 2.1 AA accessibility statement
├── transparency.html       # Financial transparency / public records
├── 404.html                # Custom error page (friendly 404, replaces Cloudflare default)
├── sitemap.xml             # XML sitemap for search engines
├── _redirects              # Cloudflare Pages redirect rules
├── wrangler.jsonc          # Cloudflare Workers config (auto-generated)
│
├── css/
│   └── style.css           # All styles — single file, CSS variables at top
│
├── js/
│   ├── components.js       # Shared header + footer injected into every page
│   ├── main.js             # Nav toggle, FAQ accordion, contact form handler
│   └── news.js             # Fetches posts from GitHub API, renders news cards
│
├── admin/
│   ├── index.html          # Decap CMS entry point (loads from CDN)
│   └── config.yml          # CMS configuration — collections, fields, backend
│
├── functions/
│   └── api/
│       ├── auth.js         # Cloudflare Pages Function: GitHub OAuth initiation
│       └── callback.js     # Cloudflare Pages Function: OAuth token exchange
│
├── _posts/                 # News posts as markdown files (managed by Decap CMS)
│   └── YYYY-MM-DD-slug.md  # Frontmatter: title, date, excerpt, image, body
│
├── data/
│   ├── alert.json          # Site-wide alert banner config (active, message, link)
│   └── posts.json          # DEPRECATED — replaced by GitHub API in news.js
│
└── assets/
    └── images/
        ├── logo.png                # District logo
        └── uploads/                # CMS image uploads land here
```

---

## How the News System Works

News posts are **markdown files** in `_posts/` with YAML frontmatter:

```markdown
---
title: Post Title Here
date: "2025-08-20"
excerpt: Short summary shown on the listing page.
image: ""
---
Full body content here (optional).
```

`js/news.js` loads posts by:
1. Fetching `https://api.github.com/repos/frfdadmin/frfdwebsite/contents/_posts` to list files
2. Fetching each `.md` file from `raw.githubusercontent.com`
3. Parsing frontmatter with a built-in regex parser
4. Sorting by date (newest first) and rendering into `.news-grid` elements

The home page uses `<div class="news-grid" data-limit="3">` to show only the 3 latest posts.

**If the repo is ever moved:** Update `const REPO` at the top of `js/news.js` and `repo:` in `admin/config.yml`.

**Current repo:** `filerruralfiredistrict/frfdwebsite` (transferred from `frfdadmin` on 2026-07-31)

---

## How the Alert Banner Works

`data/alert.json` controls a red banner at the top of every page:

```json
{
  "active": true,
  "message": "Burn ban in effect — no open burning until further notice.",
  "link": "/services.html#burn-permits",
  "link_text": "Learn more"
}
```

Set `"active": false` to hide it. Managed via Decap CMS → Site Settings → Alert Banner.

---

## How Decap CMS Works

- URL: `https://frfdwebsite.pages.dev/admin`
- Login: GitHub OAuth via Decap CMS
- OAuth flow: Click "Login with GitHub" → `/api/auth` → GitHub → `/api/callback` → token → CMS

**Environment variables required in Cloudflare Pages:**
- `GITHUB_CLIENT_ID` — from GitHub OAuth App (Settings → Developer settings → OAuth Apps)
- `GITHUB_CLIENT_SECRET` — same OAuth App

These must be set for the OAuth flow to work. Without them, login will fail.

**GitHub OAuth App callback URL must match.** Currently set to `https://frfdwebsite.pages.dev/api/callback` under the `filerruralfiredistrict` GitHub account. When `filerfd.org` is live, update to `https://filerfd.org/api/callback`.

### How the OAuth Flow Works

1. User visits `/admin` and clicks "Login with GitHub"
2. Decap CMS redirects to `/api/auth` (GitHub OAuth initiation)
3. `/api/auth` redirects to GitHub's OAuth authorization page
4. User authorizes the app on GitHub
5. GitHub redirects back to `/api/callback` with an authorization code
6. `/api/callback` exchanges the code for a token via GitHub API
7. Callback returns an HTML page that uses `postMessage` to send the token back to the parent Decap CMS window
8. Decap CMS receives the token and completes the login handshake

**Critical:** The callback window communicates with the parent via `postMessage` using the format `'authorization:github:success:{token, provider}'`. This is the standard Decap CMS v3 OAuth pattern.

### Managing CMS Access

CMS access is restricted to authorized GitHub users in `admin/config.yml`. Currently authorized:
- `filerruralfiredistrict`
- `revcam`

**Important:** The config must point to the correct repo (`repo: frfdadmin/frfdwebsite`). If it points to a wrong repo, the OAuth flow will authenticate but authorization will fail, even if the user is in the authorize list.

**To add a new user:**
1. Go to https://github.com/frfdadmin/frfdwebsite/blob/main/admin/config.yml
2. Click the pencil icon (✎) to edit
3. Find the `authorize:` section and add a new line with the GitHub username, e.g.:
   ```yaml
   authorize:
     - frfdadmin
     - revcam
     - newusername
   ```
4. Click "Commit changes" and confirm
5. The site automatically redeploys — the new user can now log in

**To remove a user:** Follow the same steps, but delete their line from the `authorize:` list.

Only users in this list can access the CMS. Anyone else attempting to log in will be denied.

---

## Shared Header & Footer

Every page has `<div id="site-header"></div>` and `<div id="site-footer"></div>` which are replaced at runtime by `js/components.js`. 

**To update navigation or footer content, edit `js/components.js` only** — do not add nav/footer HTML to individual pages.

---

## Contact & Volunteer Forms

Both forms use **Web3Forms** (`https://api.web3forms.com/submit`).

Web3Forms access key is live — registered to `filerruralfiredistrict@gmail.com`. Both forms are wired up and active.

Form submissions are sent to whatever email was registered with Web3Forms.

---

## CSS Patterns

All styles are in `css/style.css`. Key patterns:

- **Section alternation:** `.section` (white) and `.section.bg-light` (light gray) alternate for visual separation
- **Staff/board cards:** `.staff-grid` + `.staff-card` — used in governance.html
- **News cards:** `.news-grid` + `.news-card` — populated by news.js
- **Page hero:** `.page-hero` — dark navy banner used on all inner pages
- **Buttons:** `.btn.btn-primary` (red) and `.btn.btn-outline` (white outline on dark bg)
- **Responsive breakpoint:** 768px — hamburger menu activates, layouts stack

---

## SEO & Social Media Sharing

**Open Graph Meta Tags**: Key pages (index, news, services, volunteer) include Open Graph meta tags in the `<head>`. When these pages are shared on social media, they display with a proper title, description, and logo image instead of a blank preview.

**Sitemap**: `sitemap.xml` lists all pages with priorities and change frequency. Helps search engines crawl and index the site efficiently. Update priorities and last-modified dates when making significant changes.

**Custom 404 Page**: `404.html` provides a friendly error page with navigation links instead of the default Cloudflare error page. Helps users find what they're looking for when they hit a broken link.

---

## Pending Items (as of July 31, 2026)

### Waiting on domain:
- [ ] **filerfd.org DNS propagation** — nameservers pointed to Cloudflare, waiting on propagation (usually a few hours)
- [ ] **Update base_url in admin/config.yml** — change from `https://frfdwebsite.pages.dev` to `https://filerfd.org` once live
- [ ] **Update GitHub OAuth App callback URL** — change to `https://filerfd.org/api/callback` under `filerruralfiredistrict` GitHub account
- [ ] **filerfireandrescue.org** — pending transfer to Namecheap; connect to Cloudflare Pages as an alias domain once available

### ✅ Completed July 31, 2026:
- [x] **Web3Forms key** — live in contact.html and volunteer.html (key: cf2f5e66-3b77-4ffa-83be-226465fe4572)
- [x] **GitHub repo transferred** — `frfdadmin/frfdwebsite` → `filerruralfiredistrict/frfdwebsite`
- [x] **Cloudflare Pages** — set up under `filerruralfiredistrict@gmail.com`
- [x] **filerfd.org** — live and active as primary domain
- [x] **Services page photo strip** — landscape grid with lightbox image viewer
- [x] **Facebook link** — icon in header nav + link in footer (page: facebook.com/people/Filer-Rural-Fire/61581663036692)
- [x] **Updates page** — Facebook CTA banner + subtle admin link for district staff
- [x] **Staff placeholder icon** — changed to firefighter emoji (🧑‍🚒)

### Pending / future:
- [ ] **Facebook Page Plugin embed** — requires Facebook Developer App with filerfd.org as allowed domain; currently replaced with a CTA button linking to their page
- [ ] **Google Drive folders** — may need to transfer ownership to district Google account; URLs are CMS-managed (update via /admin → Site Settings → Meeting Year Folders, no code change needed)
- [ ] **BeepFix GitHub account** — when created, add as collaborator on `filerruralfiredistrict/frfdwebsite` and add to `authorize:` list in admin/config.yml

### Waiting on district:
- [ ] **Assistant Chief name** — data/staff.json has empty name field, update via /admin when confirmed
- [ ] **Upload documents to Google Drive** — download-docs.sh saves files to ~/FRFD-Documents, needs uploading to the shared Drive folders
- [ ] **Budget document** — district advised budget posted after September FY approval; link at governance.html financial section already points to Drive folder

### Nice to have:
- [ ] **Google Maps embed** — contact page uses basic query URL, could use proper Embed API
- [ ] **Volunteer staff section** — data/staff.json pattern is ready, add volunteers collection when district is ready
- [ ] **Staff/board photos** — CMS supports optional photos, district just needs to upload headshots via /admin

### ✅ Confirmed by district:
- District DOES operate their own EMS — keep all EMS content
- Meeting minutes are NOT required to be published — available on request only
- Budget is NOT required to be published — will post after September approval
- Board meetings: second Monday of each month, 7:00 PM, Commissioner's Room

---

## CMS-Managed Content (via /admin)

All of the following update automatically when changed in the CMS — no code edits needed:

| Section | CMS Location | File |
|---|---|---|
| News posts | News & Updates | `_posts/*.md` |
| Alert banner | Site Settings → Alert Banner | `data/alert.json` |
| Board members | Site Settings → Board Members | `data/board-members.json` |
| Staff directory | Site Settings → Staff Directory | `data/staff.json` |
| Meeting year folders | Site Settings → Meeting Year Folders | `data/meeting-years.json` |

**To add 2027 meeting agendas:** Create Drive folder → /admin → Site Settings → Meeting Year Folders → Add entry → Save.

---

## Google Drive Document Folders

| Folder | Link |
|---|---|
| 2026 Meeting Agendas | https://drive.google.com/drive/folders/122EHIm6ErghRZm-Q9z9HRWwcEXza7yLV |
| 2025 Meeting Agendas | https://drive.google.com/drive/folders/1RTyJirc-twlPL05TYE9zjd-Eux0PhqnO |
| 2024 Meeting Agendas | https://drive.google.com/drive/folders/1OAlqxRkSJSubfT8Egf9uWGKg1nf6s_K2 |
| 2023 Meeting Agendas | https://drive.google.com/drive/folders/1aaZFcTeBdyktoZs4rFr3CvEJfCnC4Pq0 |
| Financial Documents | https://drive.google.com/drive/folders/1c5FJw5QqRctPX-mh5wNPNDAONZbSQmrH |

Download script for old Streamline docs: `~/frfdwebsite/download-docs.sh` → saves to `~/FRFD-Documents/`

---

## Board Members (current)

| Name | Role | Phone |
|---|---|---|
| Gordon Lancaster | Fire Commissioner — President | (208) 280-2269 |
| Richard Fillmore | Fire Commissioner | (208) 420-0542 |
| Blayne Wright | Fire Commissioner | (208) 731-5152 |

## Staff (current)

| Name | Role | Phone | Email |
|---|---|---|---|
| Phil Roberts | Fire Chief | (208) 613-2988 | chief@filerruralfire.com |
| TBD | Assistant Chief | — | asstchief@filerfireandrescue.org |

---

## Accessibility (WCAG 2.1 AA — Required)

As a special district government, this site falls under **ADA Title II** (compliance deadline April 26, 2028). All new code must target WCAG 2.1 Level AA by default.

**Standing rules:**
- Decorative icons/emoji must have `aria-hidden="true"` on their wrapper — the adjacent heading conveys meaning
- Every `<input>`, `<select>`, and `<textarea>` must have a linked `<label for="id">` or `aria-label`
- Form success/error messages must have `role="alert" aria-live="polite"` so screen readers announce them
- Every `<iframe>` must have a descriptive `title` attribute
- Use real `<button>` and `<a>` tags for all interactive elements — no `<div>`/`<span>` click handlers
- All images must have meaningful `alt` text (or `alt=""` if purely decorative)
- Heading hierarchy must not skip levels (h1 → h2 → h3, never h1 → h3)
- Maintain color contrast: 4.5:1 for normal text, 3:1 for large text

**Audit completed July 31, 2026:**
- ✅ Form labels properly linked (contact.html, volunteer.html)
- ✅ Maps iframe has title attribute
- ✅ Heading hierarchy clean across all pages
- ✅ Emoji card icons marked aria-hidden (index.html, services.html)
- ✅ Form success messages have role="alert" aria-live="polite"

---

## Do Not Do

- Do not add build tools, npm, or any package manager
- Do not add external font dependencies (use system font stack)
- Do not hardcode nav or footer HTML in individual pages — use components.js
- Do not commit `.env` files, API keys, or secrets — use Cloudflare environment variables
- Do not change `const REPO` in news.js without also updating `repo:` in admin/config.yml
- Do not use `Station 20` — it is Station 26
- Do not use `100 S HWY 30` — the correct address is `100 US-30, Filer, ID 83328`
- Do not add interactive elements using `<div>`/`<span>` — always use `<button>` or `<a>`
- Do not add emoji icons without `aria-hidden="true"` on the wrapper
