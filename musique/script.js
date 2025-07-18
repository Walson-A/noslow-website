/* =========================================================
 * script.js – Catalogue Musique (Noslow) v1.4
 * =========================================================
 * Features:
 *  - Filters / Sort / Search
 *  - Hero auto (latest) + conditional NEW badge
 *  - NEW badge (cards < NEW_DAYS days old)
 *  - Blur-up + fallback covers
 *  - Produced filter + prod tooltip
 *  - Results counter (#results-count)
 *  - Keyboard shortcut '/' focuses search
 *  - Scroll state (condensed hero + scrolled nav)
 * ======================================================= */

/* ========= CONFIG ========= */
const NEW_DAYS          = 14;      // Fenêtre pastille NEW
const ANIM_CARD_DELAY   = 35;      // ms entre chaque carte (stagger)
const HERO_SCROLL_OFFSET = 60;     // Décalage scroll bouton "Parcourir tout"

/* ========= DATA =========
   Chaque objet: { title, artist, type, date(YYYY-MM-DD), cover, link, produced_by_me }
   Types autorisés: 'projet' | 'single' | 'feat' | 'clip' | 'prod'
*/
const songs = [
  { title: "Afrodisiaque", artist: "Noslow", cover: "img/.jpg", type: "projet", date: "2025-07-15", link: "afrodisiaque/index.html" },
  { title: "Sexy Gyal", artist: "Noslow", cover: "img/.jpg", type: "single", date: "2025-07-19", link: "single/shawty.html", produced_by_me: true },
  { title: "Together", artist: "Melda", cover: "img/together.jpg", type: "feat", date: "2025-04-10", link: "single/together.html" },
  { title: "Zombie", artist: "Noslow", cover: "img/zombie.jpg", type: "single", date: "2024-01-05", link: "single/zombie.html" },
  { title: "Salimah", artist: "Noslow", cover: "img/salimah.png", type: "single", date: "2025-01-24", link: "single/salimah.html", produced_by_me: true },
  { title: "Shawty", artist: "Noslow", cover: "img/shawty.jpg", type: "single", date: "2024-05-17", link: "single/shawty.html", produced_by_me: true },
  { title: "Insomniaque", artist: "Noslow ft. Melda", cover: "img/insomniaque.jpg", type: "single", date: "2025-05-21", link: "single/insomniaque.html", produced_by_me: true },
  { title: "Valentine", artist: "Noslow", cover: "img/valentine.jpg", type: "single", date: "2024-02-14", link: "single/valentine.html" },
  { title: "Gangsta Activity", artist: "Noslow", cover: "img/gangsta_actvity.jpg", type: "single", date: "2024-04-12", link: "single/gangsta_activity.html" },
  { title: "ON VA LEUR MONTRER", artist: "Noslow", cover: "img/ovlm.jpg", type: "single", date: "2024-11-10", link: "single/ovlm.html", produced_by_me: true },
  { title: "Une dernière fois", artist: "Mayefa", cover: "img/udf.jpg", type: "feat", date: "2025-01-01", link: "single/udf.html" },
  { title: "Night", artist: "Noslow", cover: "img/night.jpg", type: "single", date: "2023-11-24", link: "single/night.html", produced_by_me: true },
  { title: "Echange", artist: "Melda", cover: "img/echange.jpg", type: "feat", date: "2024-05-10", link: "single/echange.html", produced_by_me: true },
  { title: "Son pas de moi", artist: "Rappeur", cover: "img/.jpg", type: "prod", date: "2024-05-10", link: "single/echange.html", produced_by_me: true },
  { title: "Feelings", artist: "Noslow", cover: "img/feelings.jpg", type: "single", date: "2024-04-19", link: "single/feelings.html", produced_by_me: true }
];
window.__songs = songs; // Debug global si besoin

/* ========= STATE ========= */
let currentFilter = 'all';
let currentSort   = 'date';
let currentSearch = '';

/* ========= DOM ========= */
const musicGrid    = document.getElementById('music-grid');
const sortSelect   = document.getElementById('sort-select');
const searchInput  = document.getElementById('search-input');
const resultsCount = document.getElementById('results-count');

const heroCover   = document.getElementById('hero-cover');
const heroTitle   = document.getElementById('hero-title');
const heroArtist  = document.getElementById('hero-artist');
const heroActions = document.getElementById('hero-actions');
const heroBadge   = document.querySelector('.hero-badge');
const browseBtn   = document.getElementById('btn-browse-all');

/* ========= UTILS ========= */
function escapeHtml(str=''){
  return str.replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c
  ));
}
function isNew(song){
  const diff = Date.now() - new Date(song.date).getTime();
  return diff < NEW_DAYS * 86400000;
}
function safeCover(path){
  if(!path || path.endsWith('/.jpg') || path.endsWith('/.png')){
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
        <rect width="100%" height="100%" fill="#E3E0DB"/>
        <text x="50%" y="50%" font-family="Inter,Arial" font-size="42" text-anchor="middle" fill="#8A867F">No Cover</text>
      </svg>
    `);
  }
  return path;
}
function formatFilterName(code){
  switch(code){
    case 'projet': return 'Projets';
    case 'single': return 'Singles';
    case 'feat': return 'Featuring';
    case 'clip': return 'Clips';
    case 'produced':
    case 'prod': return 'Prod';
    case 'all':
    default: return 'Tous';
  }
}

/* ========= FILTER / SEARCH / SORT LOGIC ========= */
function passesFilter(song){
  if (currentFilter === 'produced') {
    if (!song.produced_by_me) return false;
  } else if (currentFilter !== 'all') {
    if (song.type !== currentFilter) return false;
  }
  if (currentSearch){
    const q = currentSearch.toLowerCase();
    const hay = (song.title + ' ' + song.artist).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function sortSongs(a,b){
  if (currentSort === 'alpha'){
    const t = a.title.localeCompare(b.title, 'fr', {sensitivity:'base'});
    return t !== 0 ? t : new Date(b.date) - new Date(a.date);
  }
  if (currentSort === 'type'){
    const t = a.type.localeCompare(b.type);
    if (t !== 0) return t;
    return new Date(b.date) - new Date(a.date);
  }
  // default: date desc
  const d = new Date(b.date) - new Date(a.date);
  if (d !== 0) return d;
  return a.title.localeCompare(b.title, 'fr', {sensitivity:'base'});
}

/* ========= CARD RENDER ========= */
function createCard(song, index){
  const recent    = isNew(song);
  const coverSrc  = safeCover(song.cover);
  const prodStamp = song.produced_by_me
    ? `<img class="prod-stamp" src="../img/prod-ns.svg" alt="Prod by Noslow" data-tip="Produit par Noslow">`
    : '';

  return `
    <div class="card${recent ? ' card--new' : ''}"
         data-type="${song.type}"
         ${recent ? 'data-new="true"' : ''}
         style="animation-delay:${index * ANIM_CARD_DELAY}ms"
         onclick="window.location='${song.link || '#'}'">
      <img class="cover"
           src="${coverSrc}"
           alt="${escapeHtml(song.title)}"
           loading="lazy"
           data-loading="true">
      ${prodStamp}
      <div class="card-body">
        <h3 class="title">${escapeHtml(song.title)}</h3>
        <p class="artist">${escapeHtml(song.artist)}</p>
      </div>
    </div>`;
}

/* ========= ENHANCE COVERS (blur-up + fallback) ========= */
function enhanceCovers(){
  document.querySelectorAll('.cover[data-loading="true"]').forEach(img=>{
    if (img.complete){
      markLoaded(img);
    } else {
      img.addEventListener('load', ()=> markLoaded(img), { once:true });
      img.addEventListener('error', ()=> fallbackCover(img), { once:true });
    }
  });
}
function markLoaded(img){
  img.dataset.loading = 'false';
  img.dataset.loaded  = 'true';
}
function fallbackCover(img){
  const placeholder = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="100%" height="100%" fill="#E3E0DB"/>
      <text x="50%" y="50%" font-family="Inter,Arial" font-size="42" text-anchor="middle" fill="#8A867F">Image</text>
    </svg>`;
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(placeholder);
  markLoaded(img);
}

/* ========= RESULTS COUNTER ========= */
function updateResultsCounter(count){
  if (!resultsCount) return;
  const label = formatFilterName(currentFilter);
  resultsCount.innerHTML =
    `<span class="count-accent">${count}</span> ${count>1?'morceaux':'morceau'} — ${label}`;
}

/* ========= DISPLAY ========= */
function displaySongs(){
  if (!musicGrid) return;
  const filtered = songs.filter(passesFilter).sort(sortSongs);
  musicGrid.innerHTML = filtered.map((s,i)=> createCard(s,i)).join('');
  if (!filtered.length){
    musicGrid.innerHTML = '<p class="empty">Aucun résultat.</p>';
  }
  updateResultsCounter(filtered.length);
  enhanceCovers();
}

/* ========= FILTER BUTTONS ========= */
function bindFilterButtons(){
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const v = btn.dataset.filter;
      if (v === currentFilter) return;
      currentFilter = v;
      filterButtons.forEach(b=>{
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active);
      });
      displaySongs();
    });
  });
}

/* ========= SORT / SEARCH BIND ========= */
if (sortSelect){
  sortSelect.addEventListener('change', ()=>{
    currentSort = sortSelect.value;
    displaySongs();
  });
}
if (searchInput){
  searchInput.addEventListener('input', ()=>{
    currentSearch = searchInput.value.trim();
    displaySongs();
  });
}

/* ========= HERO ========= */
function buildHero(){
  if (!songs.length || !heroCover) return;
  const latest = [...songs].sort((a,b)=> new Date(b.date)-new Date(a.date))[0];
  if(!latest) return;
  heroCover.src       = safeCover(latest.cover);
  heroCover.alt       = latest.title;
  heroTitle.textContent  = latest.title;
  heroArtist.textContent = latest.artist;
  heroActions.innerHTML = '';

  if (latest.link && latest.link !== '#'){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-primary';
    btn.textContent = 'Voir la page';
    btn.addEventListener('click', ()=> window.location = latest.link);
    heroActions.appendChild(btn);
  }
  if (heroBadge){
    heroBadge.style.display = isNew(latest) ? 'inline-block' : 'none';
  }
}

/* ========= SCROLL STATE ========= */
let ticking = false;
function onScroll(){
  if (!ticking){
    requestAnimationFrame(()=>{
      const y = window.scrollY;
      const threshold = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--collapse-threshold')) || 100;
      document.body.classList.toggle('condensed', y > threshold);
      document.body.classList.toggle('scrolled', y > 4);
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive:true });

/* ========= SCROLL TO GRID ========= */
function scrollToGrid(){
  if (!musicGrid) return;
  const rect = musicGrid.getBoundingClientRect();
  const offsetTop = window.scrollY + rect.top - HERO_SCROLL_OFFSET;
  window.scrollTo({ top: offsetTop, behavior: 'smooth' });
}
browseBtn && browseBtn.addEventListener('click', scrollToGrid);

/* ========= SHORTCUTS ========= */
window.addEventListener('keydown', e=>{
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && !e.metaKey && !e.ctrlKey){
    e.preventDefault();
    searchInput && searchInput.focus();
  }
});

/* ========= INIT ========= */
(function init(){
  bindFilterButtons();
  buildHero();
  displaySongs();
})();
