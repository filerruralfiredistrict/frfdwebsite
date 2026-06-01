# Filer Rural Fire District Website — Technical Reference Guide

**For:** Future maintainers and developers taking over this project  
**Last Updated:** May 2026  
**Built By:** BeepFix.com

This document provides a comprehensive technical breakdown of the entire codebase. Read this before making changes or troubleshooting issues.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design](#architecture--design)
4. [Complete Directory Structure](#complete-directory-structure)
5. [How Each System Works](#how-each-system-works)
6. [SEO & User Experience](#seo--user-experience)
7. [Data Files & Configuration](#data-files--configuration)
8. [JavaScript Modules](#javascript-modules)
9. [Common Tasks & Workflows](#common-tasks--workflows)
10. [Deployment & Hosting](#deployment--hosting)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Important Patterns & Conventions](#important-patterns--conventions)
13. [Do's and Don'ts](#dos-and-donts)

---

## Project Overview

### What This Site Does

This is a **static website** for Filer Rural Fire District, Station 26, located in Filer, Idaho. It replaces their previous Streamline-hosted site to eliminate ongoing hosting fees.

The site serves several purposes:
- **Public Information**: Services, history, governance, contact info
- **News Feed**: Updates and announcements managed via CMS
- **Community Engagement**: Volunteer recruitment, contact forms
- **Transparency**: Board members, meeting info, public documents

### Key Constraints

- **Zero build tools** — pure HTML/CSS/JavaScript, no npm, no bundlers
- **No external dependencies** — everything is vanilla, from a CDN, or self-hosted
- **Static hosting** — Cloudflare Pages handles deployment
- **Managed content** — Decap CMS provides a browser-based editor for non-technical staff

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hosting** | Cloudflare Pages | Auto-deploys on push to main; free, fast, reliable |
| **Domain** | Namecheap (pending) | filerfireandrescue.org (will be connected to Cloudflare) |
| **Repository** | GitHub (frfdadmin/frfdwebsite) | Source control; used by Decap CMS backend |
| **CMS** | Decap CMS v3 | Browser-based editor for news, staff, board, site settings |
| **OAuth** | GitHub OAuth App | Login system for CMS editors |
| **CMS Functions** | Cloudflare Pages Functions | Serverless endpoints for OAuth flow (/api/auth, /api/callback) |
| **Forms** | Web3Forms | Contact & volunteer form submissions (free tier) |
| **Frontend** | HTML5, CSS3, Vanilla JS | No frameworks, no dependencies |
| **CSS Variables** | CSS Custom Properties | Navy, red, gray, light, dark, white color tokens |
| **Font** | System Font Stack | 'Segoe UI', system-ui, -apple-system, sans-serif (no Google Fonts) |

---

## Architecture & Design

### Static Site with Dynamic Features

This site is **fundamentally static** (HTML/CSS/JS) with three layers of dynamic behavior:

1. **Shared Components (Components.js)**
   - Header and footer are injected at runtime
   - Navigation is built once and reused
   - Reduces duplication across 10 HTML pages

2. **News Feed (News.js)**
   - Posts are markdown files in `_posts/`
   - JavaScript fetches the list from GitHub API
   - Parses frontmatter and renders cards
   - Falls back gracefully if API is unavailable

3. **Site-Wide Settings (Alert Banner, Data Files)**
   - Alert banner config in `data/alert.json`
   - Staff/board/settings managed via CMS and stored as JSON
   - JavaScript loads and applies these at runtime

### Why This Architecture?

- **Low cost**: No server to maintain, no database
- **Fast**: Static files + CDN = minimal latency
- **Offline resilient**: If API is down, static content still loads
- **Simple to maintain**: Anyone can edit HTML/CSS; CMS handles content
- **Safe**: No server-side code to exploit; no database credentials

---

## Complete Directory Structure

```
frfdwebsite/
│
├── README.md                          # Quick start guide
├── CLAUDE.md                          # Project spec (read first!)
├── TECHNICAL_GUIDE.md                 # This file — full technical reference
│
├── index.html                         # Home page
├── history.html                       # District history (est. 1928)
├── governance.html                    # Board, staff, meetings, transparency
├── services.html                      # Services, burn permits, FAQs
├── news.html                          # News listing page
├── contact.html                       # Contact form + map
├── volunteer.html                     # Volunteer recruitment + form
├── privacy.html                       # Privacy policy
├── accessibility.html                 # WCAG 2.1 AA accessibility statement
├── transparency.html                  # Financial transparency, public records
├── 404.html                           # Custom error page (replaces Cloudflare default)
├── sitemap.xml                        # XML sitemap for search engines
│
├── _redirects                         # Cloudflare Pages redirect rules
├── wrangler.jsonc                     # Cloudflare Workers config (auto-generated)
│
├── css/
│   └── style.css                      # All styles — single CSS file, ~600 lines
│                                       # CSS variables at top, organized by section
│
├── js/
│   ├── components.js                  # Header/footer injection + hamburger menu
│   ├── main.js                        # Nav, FAQs, contact form, Escape key handler
│   └── news.js                        # GitHub API loader, markdown parser, card renderer
│
├── admin/
│   ├── index.html                     # Decap CMS entry point (loads from CDN)
│   └── config.yml                     # CMS collections, fields, backend, auth
│
├── functions/
│   └── api/
│       ├── auth.js                    # Cloudflare Function: GitHub OAuth initiation
│       └── callback.js                # Cloudflare Function: OAuth token exchange
│
├── _posts/                            # News posts (managed by Decap CMS)
│   ├── 2025-06-15-ems-qru.md
│   ├── 2025-07-04-july4-tanker.md
│   ├── 2025-08-20-push-in-ceremony.md
│   ├── 2025-08-25-air-st-lukes.md
│   └── 2025-09-01-volunteers-needed.md
│
├── data/
│   ├── alert.json                     # Site-wide alert banner (active, message, link)
│   ├── board-members.json             # Board member names, roles, photos
│   ├── staff.json                     # Staff names, roles, emails, photos
│   └── meeting-years.json             # Google Drive folder links by year
│
└── assets/
    └── images/
        ├── logo.png                   # District logo (Maltese cross)
        ├── site/                      # Static images (mobile safety house, etc)
        └── uploads/                   # CMS image uploads land here
```

### File Naming Conventions

- **HTML pages**: kebab-case.html (index.html, governance.html)
- **JavaScript modules**: camelCase.js (components.js, news.js)
- **CSS**: single style.css file, no partials
- **Data files**: kebab-case.json (alert.json, board-members.json)
- **Blog posts**: YYYY-MM-DD-slug.md (2025-09-01-volunteers-needed.md)
- **Cloudflare functions**: lowercase, descriptive (auth.js, callback.js)

---

## How Each System Works

### 1. Shared Header & Footer (components.js)

**What it does**: Injects the same header and navigation into every page without duplicating HTML.

**Flow**:
1. Every HTML page has this placeholder: `<div id="site-header"></div>`
2. On page load, components.js replaces this with the full header HTML
3. Same for footer with `<div id="site-footer"></div>`

**Key Code**:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('site-header');
  if (headerPlaceholder) headerPlaceholder.outerHTML = HEADER_HTML;
});
```

**Why this pattern?**
- Keeps nav/footer in one place — if you change the menu, 10 pages update automatically
- Easier to maintain than editing header HTML in each file
- Can dynamically add year to copyright: `${new Date().getFullYear()}`

**To Update Navigation**:
1. Edit `js/components.js` lines 16–38 (the `HEADER_HTML` section)
2. Add/remove/reorder nav links
3. Push to GitHub — Cloudflare redeploys immediately

**Mobile Menu**:
- Hamburger button on screens ≤768px (defined in CSS media query)
- `main.js` handles toggle, close on escape, close on nav link click
- Mobile dropdown menus toggle with preventDefault on click

---

### 2. News Feed System (news.js)

**What it does**: Loads news posts from markdown files, parses them, and renders cards on the homepage and news page.

**Why Not a Database?**
- Posts are just markdown files in `_posts/`
- Decap CMS manages editing (through GitHub)
- Fetched at runtime via GitHub API
- No database = no server = no costs

**How It Works**:

1. **Discovery** — JavaScript fetches the list of files from GitHub API:
   ```
   GET https://api.github.com/repos/frfdadmin/frfdwebsite/contents/_posts
   ```

2. **Fetch** — For each `.md` file, fetch its raw content:
   ```
   GET https://raw.githubusercontent.com/frfdadmin/frfdwebsite/main/_posts/2025-09-01-volunteers-needed.md
   ```

3. **Parse** — Extract frontmatter (title, date, excerpt, image) using regex:
   ```javascript
   function parseFrontmatter(raw) {
     const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
     // Split on `:` to extract key-value pairs
     // Remove surrounding quotes
     return { data, body };
   }
   ```

4. **Sort** — Sort by date (newest first):
   ```javascript
   posts.sort((a, b) => new Date(b.date) - new Date(a.date));
   ```

5. **Render** — Generate HTML cards and insert into the page:
   ```javascript
   el.innerHTML = posts.map(post => `
     <article class="news-card">
       <img src="${post.image}" alt="${post.title}">
       <h3>${post.title}</h3>
       <p>${post.excerpt}</p>
     </article>
   `).join('');
   ```

**Post Format** (stored in `_posts/YYYY-MM-DD-slug.md`):
```markdown
---
title: New Equipment Arrives
date: "2025-09-01"
excerpt: We've received two new fire engines to expand our fleet capacity.
image: "/assets/images/uploads/new-engine.jpg"
---
Full post content goes here. This is optional — excerpt alone works.
```

**Container Limits**:
- Home page: `<div class="news-grid" data-limit="3">` shows only 3 newest
- News page: `<div class="news-grid">` shows all posts

**Error Handling**:
- If GitHub API is down, shows: "Unable to load updates at this time"
- Graceful fallback — site doesn't break

**Important**: If the repo ever moves (different GitHub account):
- Update `const REPO = 'newowner/newrepo'` in `js/news.js`
- Update `repo:` in `admin/config.yml` (same value)
- These must stay in sync or the news feed breaks

---

### 3. Alert Banner (news.js)

**What it does**: Displays a red banner at the top of every page with a message and optional link (e.g., "Burn ban in effect").

**Configuration** (`data/alert.json`):
```json
{
  "active": true,
  "message": "Burn ban in effect — no open burning until further notice.",
  "link": "/services.html#burn-permits",
  "link_text": "Learn more"
}
```

**To Activate/Deactivate**:
- Set `"active": true` to show, `false` to hide
- Managed via Decap CMS → Site Settings → Alert Banner

**How It Works**:
```javascript
async function loadAlert() {
  const res = await fetch('/data/alert.json');
  const alert = await res.json();
  if (alert.active && alert.message) {
    banner.innerHTML = alert.message + (alert.link ? `<a href="${alert.link}">${alert.link_text}</a>` : '');
    banner.style.display = 'block';
  }
}
```

---

### 4. Contact & Volunteer Forms (main.js)

**What it does**: Submits form data to Web3Forms for delivery via email.

**Form Handler**:
```javascript
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: data
  });
  const json = await res.json();
  if (json.success) {
    // Show success message
    contactForm.style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  }
});
```

**Setup Required**:
- Replace `YOUR_WEB3FORMS_ACCESS_KEY` in both contact.html and volunteer.html
- Get the key from the Web3Forms dashboard (frfdadmin account)
- Submissions are emailed to the address registered with Web3Forms

---

### 5. Mobile Navigation (main.js)

**Hamburger Menu**:
- Button visible on screens ≤768px
- Click to open/close drawer-style nav
- Overlay behind nav — click to close
- Escape key closes menu
- Clicking a nav link closes menu

**Code**:
```javascript
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('header nav');

hamburger.addEventListener('click', () => {
  nav.classList.contains('open') ? closeNav() : openNav();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

// Close when nav link clicked
nav.querySelectorAll('a:not(.nav-dropdown > a)').forEach(a => {
  a.addEventListener('click', closeNav);
});
```

**Mobile Dropdowns**:
- On mobile, dropdown links toggle a submenu instead of navigating
- On desktop (>768px), dropdowns work normally on hover

---

### 6. FAQ Accordion (main.js)

**How It Works**:
- Click a question button to expand/collapse the answer
- Only one can be open at a time (close all others)
- Uses `aria-expanded` for accessibility

**HTML Structure**:
```html
<div class="faq-item">
  <button class="faq-question" aria-expanded="false">
    What area does the district cover?
  </button>
  <div class="faq-answer">
    <p>The district covers the rural areas...</p>
  </div>
</div>
```

**Code**:
```javascript
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    // Close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Open this one if it was closed
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});
```

---

### 7. Active Nav Link (main.js)

**What it does**: Highlights the current page link in the navigation.

**Code**:
```javascript
const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
document.querySelectorAll('nav a').forEach(a => {
  const href = a.getAttribute('href') || '';
  if (href && (currentPath.endsWith(href) || (href !== 'index.html' && href !== '/' && currentPath.includes(href.replace('.html', ''))))) {
    a.classList.add('active');
  }
});
```

**CSS** (in style.css):
```css
nav a.active { background: rgba(255,255,255,.12); }
```

---

### 8. Decap CMS (admin/config.yml + OAuth)

**What it does**: Provides a browser-based editor for non-technical staff to manage news, staff, board members, and site settings.

**URL**: https://frfdwebsite.pages.dev/admin (or real domain when live)

**How Authentication Works**:

1. User clicks "Login with GitHub"
2. Browser redirects to `/api/auth` (Cloudflare Function)
3. `/api/auth` redirects to GitHub OAuth authorization endpoint
4. User logs in to GitHub and grants permission
5. GitHub redirects back to `/api/callback` (Cloudflare Function)
6. `/api/callback` exchanges the code for an access token
7. Token is passed back to CMS via `postMessage`
8. CMS uses token to make API calls to GitHub (read/write files)

**Environment Variables** (set in Cloudflare Pages):
- `GITHUB_CLIENT_ID` — from GitHub OAuth App
- `GITHUB_CLIENT_SECRET` — from GitHub OAuth App

**Access Control**:
- In `admin/config.yml`, the `authorize:` list restricts who can log in
- Currently: frfdadmin, revcam
- Add usernames to allow more editors
- **Critical:** The `repo:` field must be set to `frfdadmin/frfdwebsite` — if it points to a different repository, OAuth will complete but authorization will fail even if the user is in the authorize list

**Collections** (what editors can edit):
- **News & Updates** — Create/edit/delete posts in `_posts/`
- **Site Settings → Alert Banner** — Toggle red banner, set message/link
- **Site Settings → Board Members** — Names, roles, phones, photos
- **Site Settings → Staff Directory** — Names, roles, emails, photos
- **Site Settings → Meeting Year Folders** — Google Drive folder links by year

**File Format**:
- Posts are markdown with YAML frontmatter
- Everything else is JSON
- CMS reads/writes directly to the GitHub repo
- Changes committed automatically (no manual git needed)

---

## SEO & User Experience

### Custom 404 Page (404.html)

Provides a friendly error page when users hit a broken link instead of the default Cloudflare error page.

**What it does**:
- Matches site design with header/footer
- Shows a large "404" heading
- Explains the page wasn't found
- Offers navigation buttons to Home, Updates, Contact

**How it works**:
- Cloudflare Pages automatically serves 404.html for 404 errors
- No configuration needed — just having the file enables it
- Falls back to default Cloudflare error if 404.html is missing

**To Update**:
- Edit 404.html just like any other page
- Change the message, buttons, or styling as needed
- Commit and push to redeploy

---

### Open Graph Meta Tags

Improves social media sharing. When pages are shared on Facebook, Twitter, LinkedIn, etc., they display with a preview image, title, and description.

**Which pages have them**:
- index.html
- news.html
- services.html
- volunteer.html

**What they look like**:
```html
<meta property="og:title" content="Updates – Filer Rural Fire District">
<meta property="og:description" content="Latest news and updates...">
<meta property="og:type" content="website">
<meta property="og:image" content="/assets/images/logo.png">
<meta property="og:url" content="https://frfdwebsite.pages.dev/news.html">
```

**To Add to More Pages**:
1. Copy the 5 lines above into the `<head>` of any page
2. Update the values to match that page's content
3. Use absolute URLs for og:url and og:image
4. When the real domain is connected, update URLs from frfdwebsite.pages.dev to filerfireandrescue.org

**Note**: When real domain goes live, update all og:url values to use the real domain.

---

### Sitemap (sitemap.xml)

XML file listing all pages for search engines. Helps with SEO and crawl efficiency.

**Format**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://frfdwebsite.pages.dev/</loc>
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

**Fields**:
- `loc` — Full URL to the page
- `lastmod` — Last modified date (YYYY-MM-DD format)
- `changefreq` — How often it changes (always, hourly, daily, weekly, monthly, yearly, never)
- `priority` — Relative priority (0.0–1.0), where 1.0 is most important

**Current priorities**:
- 1.0 — Home page (most important)
- 0.9 — Services, News, Volunteer (high priority)
- 0.8 — Governance, History, Contact
- 0.7 — Transparency
- 0.5 — Privacy, Accessibility (least important)

**To Update**:
- Add/remove URLs as pages are added/deleted
- Update `lastmod` dates when pages change significantly
- Adjust priorities if important pages change
- Google automatically finds and reads sitemap.xml

**Note**: Cloudflare automatically serves sitemap.xml — no special config needed.

---

## Data Files & Configuration

### data/alert.json

Controls the red alert banner at the top of every page.

```json
{
  "active": true,
  "message": "Burn ban in effect — no open burning until further notice.",
  "link": "/services.html#burn-permits",
  "link_text": "Learn more"
}
```

**Fields**:
- `active` (boolean) — Show or hide banner
- `message` (string) — Banner text
- `link` (string, optional) — URL to link to
- `link_text` (string, optional) — Text for the link

**Managed by**: Decap CMS → Site Settings → Alert Banner

---

### data/board-members.json

Board member names, roles, contact info, and optional photos.

```json
{
  "items": [
    {
      "name": "Gordon Lancaster",
      "role": "Fire Commissioner — President",
      "phone": "(208) 280-2269",
      "photo": ""
    },
    {
      "name": "Richard Fillmore",
      "role": "Fire Commissioner",
      "phone": "(208) 420-0542",
      "photo": ""
    }
  ]
}
```

**Used by**: governance.html — displayed in a card grid

**Managed by**: Decap CMS → Site Settings → Board Members

---

### data/staff.json

Staff member names, roles, contact info, and optional photos.

```json
{
  "items": [
    {
      "name": "Phil Roberts",
      "role": "Fire Chief",
      "phone": "(208) 613-2988",
      "email": "chief@filerruralfire.com",
      "photo": ""
    },
    {
      "name": "",
      "role": "Assistant Chief",
      "phone": "",
      "email": "asstchief@filerfireandrescue.org",
      "photo": ""
    }
  ]
}
```

**Used by**: governance.html — displayed in a card grid

**Managed by**: Decap CMS → Site Settings → Staff Directory

---

### data/meeting-years.json

Links to Google Drive folders containing meeting agendas and minutes for each year.

```json
{
  "items": [
    {
      "year": "2026",
      "url": "https://drive.google.com/drive/folders/122EHIm6ErghRZm-Q9z9HRWwcEXza7yLV"
    },
    {
      "year": "2025",
      "url": "https://drive.google.com/drive/folders/1RTyJirc-twlPL05TYE9zjd-Eux0PhqnO"
    }
  ]
}
```

**Used by**: governance.html — displayed as links to Drive folders

**Managed by**: Decap CMS → Site Settings → Meeting Year Folders

---

### admin/config.yml

Complete Decap CMS configuration. This file defines:
- Backend (GitHub)
- Collections (News, Site Settings)
- Fields and validation
- Media upload folders
- Editor interface layout

**Key sections**:
- `backend:` — GitHub repo, branch, OAuth endpoints, authorized users
- `media_folder:` / `public_folder:` — Where uploaded images go
- `collections:` — Define what can be edited (posts, board members, etc.)

**To Add a New Editable Section**:
1. Create a JSON file in `data/`
2. Add a new entry to the `collections` → `settings` → `files` section
3. Define the fields users can edit
4. Reload the CMS

---

### wrangler.jsonc

Auto-generated Cloudflare Workers config. Don't edit manually — regenerated during build.

---

### _redirects

Cloudflare Pages redirect rules. Example:
```
/old-page /new-page 301
/api/* https://api.example.com/:splat 200
```

Not currently used but kept for future needs.

---

## JavaScript Modules

### components.js

**Size**: ~100 lines  
**Purpose**: Inject header and footer on every page  
**Dependencies**: None  

**What it exports**: Nothing — runs on load, modifies the DOM.

**How to use it**: Add `<script src="/js/components.js"></script>` to every page.

**What it needs from the HTML**:
- `<div id="site-header"></div>` — replaced with full header
- `<div id="site-footer"></div>` — replaced with full footer

---

### main.js

**Size**: ~100 lines  
**Purpose**: Hamburger menu, mobile dropdowns, FAQs, form submission, nav highlighting  
**Dependencies**: None  

**Key Functions**:
- `openNav() / closeNav()` — Toggle mobile nav drawer
- `addEventListener` on hamburger, Escape key, nav links
- FAQ accordion toggle logic
- Contact form Web3Forms submission
- Active nav link detection

**What it needs from the HTML**:
- `.hamburger` button
- `header nav` element
- `.nav-dropdown` and `.dropdown-menu` for mobile dropdowns
- `.faq-question` / `.faq-answer` for accordions
- `#contact-form` for form submission
- `#form-success` for success message placeholder

---

### news.js

**Size**: ~130 lines  
**Purpose**: Fetch posts from GitHub, parse markdown, render cards, load alert banner  
**Dependencies**: None  

**Key Functions**:
- `parseFrontmatter(raw)` — Extract YAML frontmatter from markdown
- `formatDate(str)` — Format date string to "Month D, YYYY"
- `renderCards(posts, el)` — Generate HTML cards and insert into container
- `loadNews(options)` — Main function: fetch files, parse, sort, render
- `loadAlert()` — Load and display alert banner

**What it needs from the HTML**:
- `.news-grid` container(s) for rendering cards
- `#alert-banner` div for alert message
- Optional `data-limit="N"` attribute on `.news-grid` to show only N posts

**Fallback Behavior**:
- If GitHub API unavailable: "Unable to load updates at this time"
- If no posts: "No updates yet — check back soon"
- If no image: Shows a generic gray placeholder card

**Error Handling**:
- Wraps entire `loadNews()` in try/catch
- Logs errors to browser console (does not alert user)
- Shows graceful message instead of breaking

---

## Common Tasks & Workflows

### Adding a News Post

**Method 1: Via Decap CMS (Recommended for non-technical users)**
1. Go to https://frfdwebsite.pages.dev/admin
2. Click "News & Updates"
3. Click "New Post"
4. Fill in Title, Date, Excerpt, optional Image
5. Add optional body text
6. Click "Publish"
7. Site redeploys automatically

**Method 2: Via GitHub (for developers)**
1. Create a new file: `_posts/YYYY-MM-DD-slug.md`
2. Add frontmatter:
   ```yaml
   ---
   title: Post Title Here
   date: "2025-09-15"
   excerpt: One or two sentences shown on the listing.
   image: "/assets/images/uploads/photo.jpg"
   ---
   ```
3. Add optional body content below the closing `---`
4. Commit and push to main
5. Site redeploys in ~1 minute

**Important**:
- Date format must be "YYYY-MM-DD" (e.g., "2025-09-15")
- Image path should use `/assets/images/uploads/` for CMS-uploaded images
- Filename format: `YYYY-MM-DD-slug.md` where slug is lowercase, no spaces
- The `slug` part becomes the post's filesystem name

---

### Adding a Board or Staff Member

**Via Decap CMS**:
1. Go to /admin
2. Click "Site Settings"
3. Click "Board Members" or "Staff Directory"
4. Click "Add item"
5. Fill in Name, Role, Phone/Email, optional Photo
6. Click "Add item" if adding multiple
7. Click "Publish"

**Optional Photos**:
- Upload via the CMS image picker
- Images go to `/assets/images/staff/`
- Display in card grid in governance.html

---

### Managing CMS Access (Adding/Removing Editors)

**To add a new editor**:
1. Go to https://github.com/frfdadmin/frfdwebsite/blob/main/admin/config.yml
2. Click the pencil icon (✎) to edit
3. Find the `authorize:` section (around line 7)
4. Add a new line: `  - newusername` (maintain indentation)
5. Click "Commit changes"
6. Cloudflare redeploys automatically
7. New user can now log in at /admin

**To remove an editor**:
1. Same process, but delete their line from the `authorize:` list
2. They can no longer log in

---

### Updating Navigation

1. Edit `js/components.js` (lines 16–42, the `HEADER_HTML` section)
2. Add/remove/reorder `<li><a href="...">Label</a></li>` items
3. For dropdowns, nest `<ul class="dropdown-menu">` with `<li>` items
4. Commit and push
5. Site redeploys in ~1 minute

Example:
```html
<nav>
  <ul>
    <li><a href="/index.html">Home</a></li>
    <li class="nav-dropdown">
      <a href="/services.html">Services</a>
      <ul class="dropdown-menu">
        <li><a href="/services.html#burn-permits">Burn Permits</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

---

### Updating the Alert Banner

**Via CMS** (easiest):
1. Go to /admin → Site Settings → Alert Banner
2. Toggle "Show Alert Banner"
3. Edit the message
4. Optional: add a link and link text
5. Click "Publish"

**Via GitHub** (edit JSON directly):
1. Edit `data/alert.json`
2. Set `"active": true` to show, `false` to hide
3. Commit and push

---

### Uploading Images

**For News Posts**:
1. In Decap CMS, click "Featured Image" widget
2. Upload or select from existing images
3. Image automatically goes to `/assets/images/uploads/`
4. Path in post is `/assets/images/uploads/filename.jpg`

**For Staff/Board Photos**:
1. In Decap CMS, click "Photo" in Staff or Board Members
2. Upload
3. Automatically goes to `/assets/images/staff/`

**For Static Site Images** (e.g., mobile safety house):
1. Upload via GitHub web interface to `assets/images/site/`
2. Update HTML to reference the new image

---

### Making CSS Changes

All styles are in `css/style.css`. Structure:

```css
/* ── Variables ─────────────────────────────────────────── */
:root { --navy: #1D2B3A; ... }

/* ── Reset ──────────────────────────────────────────────── */
* { ... }

/* ── Utility ────────────────────────────────────────────── */
.container { ... }

/* ── Header / Nav ──────────────────────────────────────── */
header { ... }

/* ── Sections ──────────────────────────────────────────── */
.section { ... }

/* ── Footer ────────────────────────────────────────────– */
footer { ... }

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 768px) { ... }
```

**Color System**:
```css
--navy:  #1D2B3A  /* Dark blue, headers, background */
--red:   #CC2020  /* Accent, buttons, borders */
--white: #FFFFFF  /* Page bg, cards */
--gray:  #A8B8C4  /* Subdued text */
--light: #F4F6F8  /* Alternating sections */
--dark:  #111820  /* Footer bg */
--text:  #2C3E50  /* Body text */
```

**To Change a Color**: Update the CSS variable at the top, all uses update automatically.

**To Add a New Color**: Add to `:root`, use `var(--name)` throughout.

**Responsive Breakpoint**: 768px
- Below: mobile (hamburger menu, stacked layouts)
- Above: desktop (full nav, side-by-side layouts)

---

### Running the Site Locally

For development testing:

```bash
# Start a local web server (Python 3)
python3 -m http.server 8000

# Visit in browser
open http://localhost:8000

# Static files served from current directory
```

Or use any simple HTTP server (node http-server, etc.).

**Note**: The site is fully static, so there's no build step. Just serve the files.

---

## Deployment & Hosting

### How Deployment Works

1. **Local Change**: Edit a file, commit, push to GitHub
   ```bash
   git add -A
   git commit -m "Update news post"
   git push
   ```

2. **GitHub Hook**: Cloudflare Pages watches the main branch
   - Automatically triggered on push
   - No configuration needed

3. **Build** (Instant, ~30 seconds):
   - Cloudflare clones the repo
   - Serves static files directly
   - No build step needed

4. **Live**: Changes live at https://frfdwebsite.pages.dev

### Connected Domain

When the real domain is connected (filerfireandrescue.org):
1. DNS updated to point to Cloudflare
2. SSL certificate auto-issued
3. Same deployment flow, now at https://filerfireandrescue.org
4. GitHub OAuth callback URL must be updated to match

### Environment Variables (Cloudflare)

Set in Cloudflare Pages project settings:

- `GITHUB_CLIENT_ID` — OAuth App client ID (from GitHub)
- `GITHUB_CLIENT_SECRET` — OAuth App secret (from GitHub)

**Do not commit these to the repo** — keep them secret.

### SSL/TLS

- Auto-issued by Cloudflare
- Handles HTTPS automatically
- Renewal automatic

### Performance

- Static files served from Cloudflare's global CDN
- Cached at edge locations worldwide
- Zero cold-start latency (unlike serverless functions)

### Rollback

If something breaks:
1. Revert the problematic commit on GitHub
2. Cloudflare redeploys automatically
3. Changes live in ~30 seconds

---

## Troubleshooting Guide

### News Posts Not Showing

**Symptoms**: News page shows "No updates yet" or "Unable to load updates"

**Debug Checklist**:

1. **Check GitHub API rate limit**:
   - Open browser console (F12)
   - Check for error messages
   - GitHub allows 60 requests/hour unauthenticated
   - If rate limited, wait 1 hour or use authenticated API calls

2. **Verify files exist**:
   - Go to GitHub repo → _posts/
   - Are there any `.md` files?
   - Filenames should be `YYYY-MM-DD-slug.md`

3. **Check frontmatter format**:
   - Open a post file in GitHub
   - Should start and end with `---` (three dashes)
   - YAML fields: title, date, excerpt, image
   - Date format: "YYYY-MM-DD"

4. **Verify REPO constant**:
   - Check `js/news.js` line 8: `const REPO = 'frfdadmin/frfdwebsite'`
   - If repo moved, update this and `admin/config.yml`

5. **Check browser console**:
   - Press F12, go to Console tab
   - Any red errors?
   - Look for `[news.js] Network error` messages

6. **Test API directly**:
   - Paste in browser: `https://api.github.com/repos/frfdadmin/frfdwebsite/contents/_posts`
   - Should return JSON list of files
   - If 404, repo name is wrong

---

### CMS Login Not Working

**Symptoms**: "Authorization failed" message at /api/callback

**Debug Checklist**:

1. **Check environment variables**:
   - Go to Cloudflare Pages project settings
   - Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
   - If empty or wrong, login fails

2. **Verify OAuth App**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Check "Authorized redirect URIs"
   - Should be `https://frfdwebsite.pages.dev/api/callback` (or real domain)
   - If mismatch, GitHub rejects the callback

3. **Check browser console**:
   - F12 → Console tab
   - Any errors? Look for CORS issues or fetch failures

4. **Check if user is authorized**:
   - Is your GitHub username in `admin/config.yml` under `authorize:`?
   - If not, you'll get "Authorization failed"

5. **Verify the repo field**:
   - In `admin/config.yml`, check that `repo: frfdadmin/frfdwebsite`
   - If it points to a different repo, OAuth will complete but authorization will fail
   - This is a common issue when testing or migrating repos

6. **Clear cookies/cache**:
   - Sometimes old tokens linger
   - Clear site cookies and try again

---

### Contact Form Not Submitting

**Symptoms**: Form appears to submit but no email received

**Debug Checklist**:

1. **Check Web3Forms key**:
   - Is `YOUR_WEB3FORMS_ACCESS_KEY` still in contact.html and volunteer.html?
   - It won't work — needs to be replaced with the real key
   - Get key from frfdadmin Web3Forms account dashboard

2. **Verify Web3Forms account**:
   - Go to web3forms.com, log in with frfdadmin account
   - Check that account exists and is active
   - Verify "From Email" is set to receive messages

3. **Check form fields**:
   - Form must have `name` attribute on inputs
   - Must have an input with `name="email"`
   - Must have an input with `name="message"`
   - Web3Forms requires these exact field names

4. **Check browser console**:
   - F12 → Console
   - Look for error messages after form submit
   - Network tab → click the submit request → check status code

5. **Test email delivery**:
   - Check spam folder
   - Spam filters might block the message
   - Check firewall/email settings on receiving end

---

### Site Not Updating After Push

**Symptoms**: Edited a file, pushed to GitHub, but changes don't appear

**Debug Checklist**:

1. **Wait for deploy**:
   - Cloudflare takes ~30 seconds to redeploy
   - Wait a minute and refresh (hard refresh: Cmd/Ctrl + Shift + R)

2. **Check GitHub branch**:
   - Changes must be on the `main` branch
   - If you pushed to a different branch, they won't deploy
   - Go to GitHub → check the default branch setting

3. **Clear browser cache**:
   - Hard refresh: Cmd/Ctrl + Shift + R
   - Or open in incognito/private mode
   - Or clear browser cache manually

4. **Check Cloudflare deploy status**:
   - Go to Cloudflare Pages project
   - Click "Deployments"
   - Is the latest commit shown as "Production"?
   - If "Failed", click it to see error logs

5. **Check git status locally**:
   - Run `git status` — any uncommitted changes?
   - Run `git log` — is your commit visible?
   - Run `git push` — did it succeed?

---

### Styling Issues / Layout Broken

**Symptoms**: Page looks wrong, buttons misaligned, colors off

**Debug Checklist**:

1. **Hard refresh**:
   - CSS cached by browser
   - Cmd/Ctrl + Shift + R for hard refresh
   - Or clear browser cache

2. **Check CSS file**:
   - Go to `css/style.css`
   - Is the file loading? (F12 → Network → style.css, should be 200 status)
   - Any syntax errors? (F12 → Console for CSS errors)

3. **Verify CSS variables**:
   - Check `:root` at top of style.css
   - All color variables defined?
   - Did an edit break the syntax?

4. **Check media queries**:
   - Breakpoint is 768px
   - Below 768px: mobile (hamburger, stacked)
   - Above 768px: desktop (full nav, horizontal)
   - If breakpoint is wrong, layouts won't adjust properly

5. **Inspect element**:
   - Right-click element → Inspect
   - Check computed styles
   - Are classes applied correctly?
   - Any conflicting styles?

---

### Mobile Menu Not Working

**Symptoms**: Hamburger button doesn't appear on mobile, or drawer doesn't open

**Debug Checklist**:

1. **Check viewport**:
   - Is the page using `<meta name="viewport" content="width=device-width">`?
   - Without it, mobile zoom issues occur

2. **Check breakpoint**:
   - Hamburger shows only below 768px
   - Emulate a phone in DevTools (F12 → click device icon)
   - Check that hamburger appears

3. **Check main.js**:
   - Is it loaded? (F12 → Network → main.js)
   - Any console errors?

4. **Check HTML structure**:
   - Is `.hamburger` button present in header?
   - Is `header nav` element present?
   - Do classes match what main.js expects?

5. **Check CSS**:
   - Look for `.hamburger` and mobile nav styles
   - Is `display: none` on .hamburger on desktop?
   - Is `display: block` on mobile?

---

## Important Patterns & Conventions

### No Package Manager, No Build Tools

This is a constraint, not a limitation:
- **No npm**: No `package.json`, no `node_modules/`
- **No build step**: No webpack, Vite, Parcel, etc.
- **No transpilation**: Code runs as-is in modern browsers
- **Fewer dependencies**: Less to maintain, faster to load

If you need a library:
- Load from a CDN (e.g., `<script src="https://cdn.jsdelivr.net/..."></script>`)
- Or copy the code into the project
- Avoid complex libraries that require bundlers

---

### CSS Variables for theming

Instead of hardcoded colors, use CSS variables:

**Good**:
```css
:root {
  --navy: #1D2B3A;
  --red: #CC2020;
}

.button { background: var(--red); }
```

**Bad**:
```css
.button { background: #CC2020; }
```

This makes it easy to change the entire color scheme in one place.

---

### Graceful Degradation

Systems should fail gracefully:

**Good**: News API unavailable → show "Unable to load updates" message (page still loads)
**Bad**: News API unavailable → JavaScript error breaks entire page

Always wrap async operations in try/catch and show user-friendly messages.

---

### Semantic HTML

Use meaningful HTML tags:

**Good**:
```html
<header>
<nav>
<main>
<article>
<section>
<footer>
```

**Bad**:
```html
<div id="header">
<div id="nav">
<div id="main">
```

Semantic HTML improves:
- Accessibility (screen readers understand structure)
- SEO (search engines understand content)
- Maintainability (self-documenting code)

---

### Mobile-First Responsive Design

Styles are base (mobile), then enhance for larger screens:

**Good**:
```css
.news-grid { display: block; } /* Mobile: single column */
@media (min-width: 768px) {
  .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); } /* Desktop: 3 columns */
}
```

**Bad**:
```css
.news-grid { display: grid; grid-template-columns: repeat(3, 1fr); } /* Desktop default */
@media (max-width: 768px) {
  .news-grid { display: block; } /* Override for mobile */
}
```

---

### Accessible Forms

All form fields must have associated labels:

**Good**:
```html
<label for="email">Email:</label>
<input id="email" name="email" type="email">
```

**Bad**:
```html
Email: <input name="email" type="email">
```

Use `<label>` with `for` attribute, not just text.

---

### Consistent Naming

Keep patterns consistent:

- **Classes**: kebab-case (`.news-card`, `.card-title`)
- **IDs**: kebab-case (`.site-header`, `#contact-form`)
- **Data attributes**: kebab-case (`data-limit`, `data-expanded`)
- **Variables**: camelCase in JavaScript
- **Files**: kebab-case for HTML, camelCase for JS

---

## Do's and Don'ts

### ✅ Do

- ✅ Keep the site pure HTML/CSS/JS — no frameworks
- ✅ Use CSS variables for colors — makes theming easy
- ✅ Add comments only for non-obvious "why" — not "what"
- ✅ Test changes locally before pushing
- ✅ Use semantic HTML (header, nav, main, article, footer)
- ✅ Make forms accessible (labels with `for` attribute)
- ✅ Handle errors gracefully (show user-friendly messages)
- ✅ Optimize images (compress before upload)
- ✅ Use `git commit` with clear messages (what & why)
- ✅ Test on mobile (phones ≤768px width)
- ✅ Keep it simple — one solution per problem
- ✅ Update CLAUDE.md and TECHNICAL_GUIDE.md if you change architecture
- ✅ Test the entire site after making changes (not just the changed file)

### ❌ Don't

- ❌ Add npm packages or build tools
- ❌ Add external font dependencies (use system fonts)
- ❌ Hardcode colors — use CSS variables instead
- ❌ Hardcode nav/footer in individual pages — edit components.js
- ❌ Use outdated syntax — modern browsers support ES6 (arrow functions, const/let, etc.)
- ❌ Leave console errors unhandled — wrap async in try/catch
- ❌ Create multiple CSS files — keep everything in style.css
- ❌ Use `Station 20` — it's Station 26
- ❌ Use `100 S HWY 30` — it's `100 US-30, Filer, ID 83328`
- ❌ Commit API keys or secrets — use environment variables
- ❌ Remove features without checking with the district
- ❌ Skip tests on edge cases (empty state, errors, mobile)
- ❌ Merge PRs without reviewing changes
- ❌ Skip the CLAUDE.md and TECHNICAL_GUIDE.md when changing things

---

## Summary

This site is intentionally simple:
- **No complex tooling** — just HTML, CSS, JavaScript
- **No database** — JSON files and GitHub API
- **No server** — static hosting on Cloudflare
- **Maintainable** — anyone can understand the code
- **Affordable** — zero hosting fees, minimal third-party services

The patterns used here prioritize:
1. **Simplicity** over cleverness
2. **Clarity** over brevity
3. **Resilience** over features
4. **Accessibility** over aesthetics

When making changes, ask:
- Is this the simplest solution?
- Will a future maintainer understand it?
- What happens if the API goes down?
- Is it accessible to all users?
- Does it work on mobile?

Good luck maintaining this site! Reach out to Phil Roberts (chief@filerruralfire.com) or Andrew Cameron (revcam on GitHub) with questions.
