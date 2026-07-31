/**
 * news.js
 * Loads posts from the _posts/ directory via the GitHub Contents API,
 * parses their markdown frontmatter, and renders news cards.
 *
 * If the repo moves to a new account, update REPO below.
 */
const REPO = 'filerruralfiredistrict/frfdwebsite';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${REPO}/contents/_posts?ref=${BRANCH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/_posts/`;

// ── Frontmatter parser ──────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
    data[key] = val;
  });
  return { data, body: match[2].trim() };
}

function formatDate(str) {
  if (!str) return '';
  // Handle both "YYYY-MM-DD" and ISO strings
  const d = new Date(str.length === 10 ? str + 'T12:00:00' : str);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Render cards into a container ──────────────────────────
function renderCards(posts, el) {
  if (!posts.length) {
    el.innerHTML = '<p style="color:#64748b">No updates yet — check back soon.</p>';
    return;
  }
  el.innerHTML = posts.map(post => `
    <article class="news-card">
      ${post.image
        ? `<img class="news-card-img" src="${post.image}" alt="${post.title}" loading="lazy">`
        : `<div class="news-card-img" style="display:flex;align-items:center;justify-content:center;background:#f4f6f8;">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="#A8B8C4"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
           </div>`
      }
      <div class="news-card-body">
        <p class="news-card-date">${formatDate(post.date)}</p>
        <h3 class="news-card-title">${post.title}</h3>
        <p class="news-card-excerpt">${post.excerpt || ''}</p>
      </div>
    </article>
  `).join('');
}

// ── Main loader ─────────────────────────────────────────────
async function loadNews(options = {}) {
  const { limit = null } = options;
  const containers = document.querySelectorAll('.news-grid');
  if (!containers.length) return;

  containers.forEach(el => {
    el.innerHTML = '<p style="color:#64748b;padding:1rem 0;">Loading updates…</p>';
  });

  try {
    // 1. List files in _posts/
    const listRes = await fetch(API_BASE);
    if (!listRes.ok) throw new Error('Could not fetch post list');
    const files = await listRes.json();

    if (!Array.isArray(files) || files.length === 0) {
      containers.forEach(el => renderCards([], el));
      return;
    }

    // 2. Fetch each markdown file in parallel
    const mdFiles = files.filter(f => f.name.endsWith('.md'));
    const fetches = mdFiles.map(f =>
      fetch(RAW_BASE + f.name).then(r => r.text()).then(raw => {
        const { data } = parseFrontmatter(raw);
        return {
          slug: f.name.replace(/\.md$/, ''),
          title: data.title || 'Untitled',
          date: data.date || '',
          excerpt: data.excerpt || '',
          image: data.image || '',
        };
      })
    );

    let posts = await Promise.all(fetches);

    // 3. Sort newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Render into each container (home page may limit to 3)
    containers.forEach(el => {
      const containerLimit = el.dataset.limit ? parseInt(el.dataset.limit) : limit;
      const slice = containerLimit ? posts.slice(0, containerLimit) : posts;
      renderCards(slice, el);
    });

  } catch (err) {
    console.error('News load error:', err);
    containers.forEach(el => {
      el.innerHTML = '<p style="color:#64748b">Unable to load updates at this time.</p>';
    });
  }
}

// ── Alert banner ────────────────────────────────────────────
async function loadAlert() {
  const banner = document.getElementById('alert-banner');
  if (!banner) return;
  try {
    const res = await fetch('/data/alert.json');
    const alert = await res.json();
    if (alert.active && alert.message) {
      banner.innerHTML = alert.message +
        (alert.link ? ` <a href="${alert.link}">${alert.link_text || 'Learn more'}</a>` : '');
      banner.style.display = 'block';
    }
  } catch {
    // No alert file or error — silently skip
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  loadAlert();
});
