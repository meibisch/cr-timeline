'use strict';

const COVER_BASE = 'https://i.scdn.co/image/ab67616d0000b273';
const EMBED_BASE = 'https://open.spotify.com/embed';
const SPOTIFY_OPEN = 'https://open.spotify.com';

const TYPE_LABELS = {
  'album':        'Album',
  'ep':           'EP',
  'single':       'Single',
  'single-multi': 'Single',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getYear(iso) { return parseInt(iso.slice(0, 4), 10); }

function embedUrl(release, trackId) {
  if (trackId) return `${EMBED_BASE}/track/${trackId}?utm_source=generator&theme=0`;
  if (release.spotifyId) return `${EMBED_BASE}/album/${release.spotifyId}?utm_source=generator&theme=0`;
  if (release.fallbackAlbumId) return `${EMBED_BASE}/album/${release.fallbackAlbumId}?utm_source=generator&theme=0`;
  return null;
}

function openUrl(release, trackId) {
  if (trackId) return `${SPOTIFY_OPEN}/track/${trackId}`;
  if (release.spotifyId) return `${SPOTIFY_OPEN}/album/${release.spotifyId}`;
  if (release.fallbackAlbumId) return `${SPOTIFY_OPEN}/album/${release.fallbackAlbumId}`;
  return `${SPOTIFY_OPEN}/artist/61qSGQsnPa7ojcI75q32KX`;
}

function coverSrc(slug) {
  return `covers/${slug}.jpg`;
}

function svgChevron() {
  return `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2l4 4-4 4"/></svg>`;
}

function svgSpotify() {
  return `<svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.52 17.293a.75.75 0 01-1.032.246c-2.828-1.729-6.389-2.12-10.586-1.162a.75.75 0 01-.334-1.464c4.589-1.048 8.527-.597 11.706 1.348a.75.75 0 01.246 1.032zm1.473-3.28a.937.937 0 01-1.288.308c-3.236-1.988-8.165-2.565-11.99-1.403a.937.937 0 01-.543-1.79c4.37-1.326 9.794-.684 13.513 1.597a.937.937 0 01.308 1.288zm.127-3.415C15.496 8.418 9.388 8.21 5.988 9.29a1.125 1.125 0 01-.65-2.153c3.942-1.19 10.496-.96 14.63 1.658a1.125 1.125 0 01-1.248 1.883z"/></svg>`;
}

// ── Card builder ─────────────────────────────────────────────────────────────
function buildCard(release, isMobile) {
  const isNewest = !!release.newest;
  const isMulti  = release.type === 'single-multi';
  const isAlbum  = release.type === 'album' || release.type === 'ep';
  const tracks   = release.tracks || [];

  // Primary track: albums/EPs always use track[0] to start from the beginning;
  // singles use first track with a valid id.
  const primaryTrack = isAlbum
    ? (tracks[0] || null)
    : (tracks.find(t => t.spotifyId) || tracks[0] || null);
  const primaryId    = primaryTrack?.spotifyId || null;
  const primaryEmbed = embedUrl(release, primaryId);
  const primaryOpen   = openUrl(release, primaryId);

  const coverSrcUrl = coverSrc(release.id);
  const typeLabel   = TYPE_LABELS[release.type] || 'Single';

  // Tags
  const tags = [];
  if (release.debut) tags.push({ cls: 'debut', label: 'Debut' });
  if (release.collab) tags.push({ cls: 'collab', label: `feat. ${release.collab}` });
  const coverSongTags = tracks.filter(t => t.coverSong).map(t => t.coverSong);
  // Also check top-level coverSong
  if (release.coverSong) coverSongTags.push(release.coverSong);
  coverSongTags.forEach(cs => {
    tags.push({ cls: 'cover-song', label: `Cover: ${cs.original}` });
  });

  // Track tabs HTML (multi-track)
  let tabsHtml = '';
  if (isMulti && tracks.length > 1) {
    const tabItems = tracks.map((t, i) => {
      const label = t.title.includes('–') ? t.title.split('–')[1].trim() : t.title;
      return `<button class="track-tab${i === 0 ? ' active' : ''}" data-idx="${i}" aria-selected="${i === 0}">${label}</button>`;
    }).join('');
    tabsHtml = `<div class="track-tabs" role="tablist">${tabItems}</div>`;
  }

  // Album tracklist HTML
  let tracklistHtml = '';
  if (isAlbum && tracks.length > 0) {
    const items = tracks.map((t, i) =>
      `<li><span class="track-num">${i + 1}.</span>${t.title}</li>`
    ).join('');
    tracklistHtml = `
      <button class="tracklist-toggle" aria-expanded="false">
        ${svgChevron()} ${tracks.length} tracks
      </button>
      <ul class="tracklist" aria-hidden="true">${items}</ul>
    `;
  }

  // Embed / placeholder
  let embedHtml = '';
  if (primaryEmbed) {
    embedHtml = `<div class="spotify-embed-wrap" data-src="${primaryEmbed}">
      <div class="embed-placeholder">▶ Load player</div>
    </div>`;
  }

  // Spotify open link
  const openHtml = `<a class="spotify-open-link" href="${primaryOpen}" target="_blank" rel="noopener">
    ${svgSpotify()} Open on Spotify
  </a>`;

  const tagsHtml = tags.length
    ? `<div class="card-meta">${tags.map(t => `<span class="tag ${t.cls}">${t.label}</span>`).join('')}</div>`
    : '';

  return `
    <div class="card${isNewest ? ' newest' : ''}" data-id="${release.id}" role="article" aria-label="${release.title}">
      <div class="card-cover">
        <img src="${coverSrcUrl}" alt="${release.title} cover" loading="lazy" width="340" height="340">
        <div class="card-cover-overlay"></div>
        <span class="type-badge">${typeLabel}</span>
        <span class="newest-badge">Latest</span>
      </div>
      <div class="card-body">
        <div class="card-date">${fmtDate(release.date)}</div>
        <h2 class="card-title">${release.title}</h2>
        ${tagsHtml}
        ${tabsHtml}
        ${embedHtml}
        ${tracklistHtml}
        ${openHtml}
      </div>
    </div>
  `;
}

// ── Item builder (marker + connector + card) ─────────────────────────────────
function buildItem(release, side) {
  const isNewest = !!release.newest;
  const coverSrcUrl = coverSrc(release.id);
  const cardHtml = buildCard(release, false);

  return `
    <div class="timeline-item ${side}" data-id="${release.id}">
      <button class="marker${isNewest ? ' newest' : ''}" aria-label="Open ${release.title}" tabindex="0">
        <img src="${coverSrcUrl}" alt="${release.title}" loading="lazy" width="48" height="48">
      </button>
      ${cardHtml}
    </div>
  `;
}

// ── Render timeline ───────────────────────────────────────────────────────────
function renderTimeline(releases) {
  const container = document.querySelector('.timeline');
  if (!container) return;

  // Group by year (newest first)
  const byYear = {};
  for (const r of releases) {
    const y = getYear(r.date);
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(r);
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  let html = '';
  for (const year of years) {
    // Odd years: left; Even years: right
    const side = year % 2 !== 0 ? 'left' : 'right';
    html += `<div class="year-label"><span>${year}</span></div>`;
    let prevMonth = null;
    for (const release of byYear[year]) {
      const month = release.date.slice(0, 7); // "YYYY-MM"
      if (prevMonth !== null && month !== prevMonth) {
        const d = new Date(release.date + 'T12:00:00Z');
        const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        html += `<div class="month-divider"><span class="month-divider-label">${label}</span></div>`;
      }
      prevMonth = month;
      html += buildItem(release, side);
    }
  }

  container.innerHTML = html;
}

// ── Embed lazy-load ───────────────────────────────────────────────────────────
function initEmbedLoading() {
  document.addEventListener('click', e => {
    const placeholder = e.target.closest('.embed-placeholder');
    if (!placeholder) return;
    const wrap = placeholder.closest('.spotify-embed-wrap');
    if (!wrap) return;
    const src = wrap.dataset.src;
    if (!src) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.loading = 'lazy';
    wrap.replaceChildren(iframe);
  });
}

// ── Track tab switching ───────────────────────────────────────────────────────
function initTrackTabs(releases) {
  document.addEventListener('click', e => {
    const tab = e.target.closest('.track-tab');
    if (!tab) return;
    const tabRow = tab.closest('.track-tabs');
    const card   = tab.closest('.card');
    if (!tabRow || !card) return;

    const releaseId = card.dataset.id;
    const release   = releases.find(r => r.id === releaseId);
    if (!release) return;

    const idx = parseInt(tab.dataset.idx, 10);
    const track = release.tracks[idx];

    // Update active tab
    tabRow.querySelectorAll('.track-tab').forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });

    // Update embed
    const wrap = card.querySelector('.spotify-embed-wrap');
    if (!wrap) return;

    const newSrc = embedUrl(release, track?.spotifyId || null);
    if (!newSrc) return;

    wrap.dataset.src = newSrc;
    const existingIframe = wrap.querySelector('iframe');
    if (existingIframe) {
      existingIframe.src = newSrc;
    } else {
      // Reset to placeholder so user loads manually
      wrap.innerHTML = `<div class="embed-placeholder">▶ Load player</div>`;
    }
  });
}

// ── Album tracklist toggle ────────────────────────────────────────────────────
function initTracklistToggle() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.tracklist-toggle');
    if (!btn) return;
    const isOpen = btn.classList.toggle('open');
    const list   = btn.nextElementSibling;
    if (list) {
      list.classList.toggle('open', isOpen);
      list.setAttribute('aria-hidden', !isOpen);
    }
    btn.setAttribute('aria-expanded', isOpen);
  });
}

// ── Mobile bottom-sheet ───────────────────────────────────────────────────────
let bottomSheetRelease = null;

function openBottomSheet(release, releases) {
  bottomSheetRelease = release;
  const sheet  = document.getElementById('bottom-sheet');
  const overlay = document.getElementById('overlay');
  sheet.innerHTML = `
    <div class="bottom-sheet-handle"></div>
    <button class="bottom-sheet-close" aria-label="Close">✕</button>
    ${buildCard(release, true)}
  `;
  sheet.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  initTrackTabs(releases); // re-bind tabs inside sheet
}

function closeBottomSheet() {
  document.getElementById('bottom-sheet').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
  bottomSheetRelease = null;
}

function initBottomSheet(releases) {
  const overlay = document.getElementById('overlay');
  const sheet   = document.getElementById('bottom-sheet');

  overlay.addEventListener('click', closeBottomSheet);
  sheet.addEventListener('click', e => {
    if (e.target.closest('.bottom-sheet-close')) closeBottomSheet();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeBottomSheet();
  });
}

// ── IntersectionObserver for fade-in ─────────────────────────────────────────
function initScrollReveal() {
  const items = document.querySelectorAll('.timeline-item');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => obs.observe(el));
}

// ── Scroll-to-top button ──────────────────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Mobile breakpoint detection ───────────────────────────────────────────────
function isMobile() {
  return window.innerWidth <= 760;
}

// ── Click dispatcher: marker or card ─────────────────────────────────────────
function initClickHandlers(releases) {
  document.querySelector('.timeline').addEventListener('click', e => {
    if (!isMobile()) return; // desktop: cards are always visible

    const marker = e.target.closest('.marker');
    const card   = e.target.closest('.card');

    // On mobile, clicking marker or card body opens bottom-sheet
    // But let link/button clicks within card body pass through
    if (marker || card) {
      const item = (marker || card).closest('.timeline-item') || (marker || card);
      const id   = item.dataset.id || card?.dataset.id;
      if (!id) return;

      // If clicking a link, tab, or tracklist button inside card → let it go
      if (e.target.closest('a, .track-tab, .tracklist-toggle, .embed-placeholder, .bottom-sheet-close')) return;

      const release = releases.find(r => r.id === id);
      if (release) {
        e.preventDefault();
        openBottomSheet(release, releases);
      }
    }
  });
}

// ── Keyboard on markers ───────────────────────────────────────────────────────
function initKeyboard(releases) {
  document.querySelector('.timeline').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const marker = e.target.closest('.marker');
    if (!marker) return;
    e.preventDefault();
    const item = marker.closest('.timeline-item');
    if (!item) return;
    const release = releases.find(r => r.id === item.dataset.id);
    if (release && isMobile()) openBottomSheet(release, releases);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  const { releases } = RELEASES_DATA;

  renderTimeline(releases);
  initScrollReveal();
  initEmbedLoading();
  initTrackTabs(releases);
  initTracklistToggle();
  initBottomSheet(releases);
  initClickHandlers(releases);
  initKeyboard(releases);
  initScrollTop();
}

document.addEventListener('DOMContentLoaded', init);
