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
| GitHub | frfdadmin/frfdwebsite | Source code repository |
| Cloudflare Pages | frfdadmin account | Hosting & deployment (auto-deploys on push to main) |
| Web3Forms | frfdadmin account | Contact & volunteer form submissions |
| Decap CMS | `/admin` on live site | Browser-based news editor for district staff |

**Dev repo (Andrew Cameron):** revcam/frfd — kept as backup/working copy  
**Live URL:** frfdwebsite.pages.dev (temporary — real domain TBD)  
**Real domain:** filerfireandrescue.org (registered on Namecheap, domain ownership to be confirmed with district)

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
- Login: GitHub OAuth (frfdadmin account)
- OAuth flow: `/api/auth` → GitHub → `/api/callback` → token → CMS

**Environment variables required in Cloudflare Pages:**
- `GITHUB_CLIENT_ID` — from GitHub OAuth App (frfdadmin account → Settings → Developer settings → OAuth Apps)
- `GITHUB_CLIENT_SECRET` — same OAuth App

**GitHub OAuth App callback URL must match the live domain.** When the real domain is connected, update the OAuth App's callback URL to `https://REALDOMAIN.org/api/callback`.

---

## Shared Header & Footer

Every page has `<div id="site-header"></div>` and `<div id="site-footer"></div>` which are replaced at runtime by `js/components.js`. 

**To update navigation or footer content, edit `js/components.js` only** — do not add nav/footer HTML to individual pages.

---

## Contact & Volunteer Forms

Both forms use **Web3Forms** (`https://api.web3forms.com/submit`).

Replace `YOUR_WEB3FORMS_ACCESS_KEY` in these files with the real key from the frfdadmin Web3Forms account:
- `contact.html` (line ~40)
- `volunteer.html` (line ~40)

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

## Pending Items (as of May 2026)

### Needs district confirmation:
- [ ] **EMS/EMT content** — verify if FRFD operates EMS or if it's a separate unit. If separate, remove EMS references from services.html, index.html hero cards, and history.html
- [ ] **Board meeting schedule** — governance.html has `[day of month]` and `[time]` placeholders
- [ ] **Assistant Chief name** — governance.html staff section shows "Assistant Chief" with no name
- [ ] **Web3Forms email** — confirm destination email (district Gmail vs chief@filerruralfire.com)

### Technical:
- [ ] **Web3Forms access key** — replace `YOUR_WEB3FORMS_ACCESS_KEY` in contact.html and volunteer.html
- [ ] **Real domain** — confirm district controls filerfireandrescue.org on Namecheap, then connect to Cloudflare Pages and update GitHub OAuth App callback URL
- [ ] **Google Maps embed** — currently uses simple query URL; consider replacing with proper Maps Embed API key for better reliability
- [ ] **`data/posts.json`** — deprecated file, safe to delete once confirmed news.js GitHub API approach is working in production

### ⚠️ URGENT — Before cancelling Streamline:
- [ ] **Download ALL existing documents** from filerfireandrescue.org — hosted on Streamline's CloudFront CDN, will disappear when account closes (~71 files total, see inventory below)
- [ ] **Locate the original District Certificate PDF** — currently only shown as a rendered image on Streamline, make sure the actual PDF file is saved somewhere
- [ ] Upload saved documents to a shared Google Drive folder organized by year
- [ ] Set the Google Drive folder to "Anyone with the link can view"
- [ ] Build out the documents section on governance.html and transparency.html with links to Drive files

### Document Inventory (from filerfireandrescue.org — must download before cancelling)

**Board Meeting Documents (~66 files)**

| Year | Files | Notes |
|---|---|---|
| 2026 | 5 agendas (Jan–May) | Mostly .docx format |
| 2025 | 14 files — 8 agendas + 6 minutes | Mix of .docx and .pdf; includes Feb 21 special meeting and Feb 28 special meeting |
| 2024 | 21 files — agendas + minutes most months | Mostly .pdf; Oct 2024 agenda URL is mislabeled as "OCTOBER+2023" |
| 2023 | 26 files — agendas + minutes all months | All .pdf; includes a May 2023 DIFAC notice |

⚠️ **2025 minutes are incomplete** — only January has minutes posted; rest of year is missing from the site  
⚠️ **Mixed formats** — newer docs (2025–2026) are Word .docx, older ones are PDF  
⚠️ **No documents older than January 2023** on the current site

**Transparency / Financial Documents (5 files)**
- `2022-2023 BUDGET SEPT1 UPDATE FINAL.pdf`
- `2023-2024 BUDGET.pdf`
- `2024-2025 Budget Paper.pdf`
- `Filer Rural Fire Protection District - Audit FYE 09 30 2022.pdf`
- District Certificate — **get original PDF, not the Streamline image version**

### Documents plan (Google Drive):
The current site hosts documents on Streamline/CloudFront. Replacement plan:
- District uses their **existing Google account** (may be paid/Workspace) as the owner and storage for all documents
- Share the folder with `frfdadmin@gmail.com` as **Viewer only** — provides backup access without risk of accidental deletion
- Set folder to "Anyone with the link can view" so website visitors can open files without a Google login
- Suggested Google Drive folder structure:
  ```
  FRFD Documents/
  ├── Board Meetings/
  │   ├── 2023/ (agendas + minutes)
  │   ├── 2024/ (agendas + minutes)
  │   ├── 2025/ (agendas + minutes)
  │   └── 2026/ (agendas + minutes)
  ├── Financial/
  │   ├── Budgets/
  │   └── Audits/
  └── Legal/
      └── District Certificate
  ```
- Each document is a shared Google Drive link opening in a new tab
- Documents section to be added to governance.html (Board Meetings section) and transparency.html
- Consider adding a Documents collection to Decap CMS so staff can add new links without touching code

### Questions to ask district:
- Do you have an existing Google account / Google Workspace with storage?
- Can you share the documents folder with frfdadmin@gmail.com as Viewer?
- Do you have the original District Certificate PDF saved locally?
- Where are the missing 2025 meeting minutes (Feb–Nov)?

### Nice to have:
- [ ] Real photos for news posts
- [ ] Consider adding staff/board management to Decap CMS if district wants self-service updates

---

## Board Members (current)

| Name | Role | Phone | Address |
|---|---|---|---|
| Gordon Lancaster | Fire Commissioner — President | (208) 326-4111 | PO Box 227, Filer, ID 83328 |
| Richard Fillmore | Fire Commissioner | (208) 326-4111 | PO Box 227, Filer, ID 83328 |
| Blaine Wright | Fire Commissioner | (208) 326-4111 | PO Box 227, Filer, ID 83328 |

## Staff (current)

| Name | Role | Phone | Email |
|---|---|---|---|
| Phil Roberts | Fire Chief | (208) 613-2988 | chief@filerruralfire.com |
| TBD | Assistant Chief | — | asstchief@filerfireandrescue.org |

---

## Do Not Do

- Do not add build tools, npm, or any package manager
- Do not add external font dependencies (use system font stack)
- Do not hardcode nav or footer HTML in individual pages — use components.js
- Do not commit `.env` files, API keys, or secrets — use Cloudflare environment variables
- Do not change `const REPO` in news.js without also updating `repo:` in admin/config.yml
- Do not use `Station 20` — it is Station 26
- Do not use `100 S HWY 30` — the correct address is `100 US-30, Filer, ID 83328`
