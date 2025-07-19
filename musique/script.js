/* =========================================================
 * Noslow – Musique (clean script)
 * ======================================================= */

/* ---------- Config ---------- */
const NEW_DAYS = 14;
const ANIM_CARD_DELAY = 35;
const HERO_SCROLL_OFFSET = 60;

/* ---------- Data ---------- */
const songs = [
  { title:"Afrodisiaque", artist:"Noslow", cover:"img/.jpg", type:"projet", date:"2025-07-15", link:"afrodisiaque/index.html" },
  { title:"Sexy Gyal", artist:"Noslow", cover:"img/.jpg", type:"single", date:"2025-07-19", link:"single/shawty.html", produced_by_me:true },
  { title:"Together", artist:"Melda", cover:"img/together.jpg", type:"feat", date:"2025-04-10", link:"single/together.html" },
  { title:"Zombie", artist:"Noslow", cover:"img/zombie.jpg", type:"single", date:"2024-01-05", link:"single/zombie.html" },
  { title:"Salimah", artist:"Noslow", cover:"img/salimah.png", type:"single", date:"2025-01-24", link:"single/salimah.html", produced_by_me:true },
  { title:"Shawty", artist:"Noslow", cover:"img/shawty.jpg", type:"single", date:"2024-05-17", link:"single/shawty.html", produced_by_me:true },
  { title:"Insomniaque", artist:"Noslow ft. Melda", cover:"img/insomniaque.jpg", type:"single", date:"2025-05-21", link:"single/insomniaque.html", produced_by_me:true },
  { title:"Valentine", artist:"Noslow", cover:"img/valentine.jpg", type:"single", date:"2024-02-14", link:"single/valentine.html" },
  { title:"Gangsta Activity", artist:"Noslow", cover:"img/gangsta_actvity.jpg", type:"single", date:"2024-04-12", link:"single/gangsta_activity.html" },
  { title:"ON VA LEUR MONTRER", artist:"Noslow", cover:"img/ovlm.jpg", type:"single", date:"2024-11-10", link:"single/ovlm.html", produced_by_me:true },
  { title:"Une dernière fois", artist:"Mayefa", cover:"img/udf.jpg", type:"feat", date:"2025-01-01", link:"single/udf.html" },
  { title:"Night", artist:"Noslow", cover:"img/night.jpg", type:"single", date:"2023-11-24", link:"single/night.html", produced_by_me:true },
  { title:"Echange", artist:"Melda", cover:"img/echange.jpg", type:"feat", date:"2024-05-10", link:"single/echange.html", produced_by_me:true },
  { title:"Son pas de moi", artist:"Rappeur", cover:"img/.jpg", type:"prod", date:"2024-05-10", link:"single/echange.html", produced_by_me:true },
  { title:"Feelings", artist:"Noslow", cover:"img/feelings.jpg", type:"single", date:"2024-04-19", link:"single/feelings.html", produced_by_me:true }
];
window.__songs = songs;

/* ---------- State & DOM ---------- */
let currentFilter = 'all';
let currentSort   = 'date';
let currentSearch = '';

const gridEl       = document.getElementById('music-grid');
const sortSelect   = document.getElementById('sort-select');
const searchInput  = document.getElementById('search-input');
const resultsCount = document.getElementById('results-count');

const heroCover   = document.getElementById('hero-cover');
const heroTitle   = document.getElementById('hero-title');
const heroArtist  = document.getElementById('hero-artist');
const heroBadge   = document.getElementById('hero-badge');
const heroActions = document.getElementById('hero-actions');
const browseBtn   = document.getElementById('btn-browse-all');

/* ---------- Utils ---------- */
function escapeHtml(str=''){
  return str.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function isNew(song){
  return (Date.now() - new Date(song.date).getTime()) < NEW_DAYS*86400000;
}
function safeCover(path){
  if(!path || path.endsWith('/.jpg') || path.endsWith('/.png')){
    return 'data:image/svg+xml;utf8,'+encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
         <rect width="100%" height="100%" fill="#E3E0DB"/>
         <text x="50%" y="50%" font-family="Inter,Arial" font-size="42" text-anchor="middle" fill="#8A867F">No Cover</text>
       </svg>`
    );
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
    default: return 'Tous';
  }
}

/* ---------- Filter / Sort / Search Logic ---------- */
function passesFilter(song){
  if(currentFilter === 'produced' && !song.produced_by_me) return false;
  if(currentFilter !== 'all' && currentFilter !== 'produced' && song.type !== currentFilter) return false;
  if(currentSearch){
    const q = currentSearch.toLowerCase();
    if(!(song.title + ' ' + song.artist).toLowerCase().includes(q)) return false;
  }
  return true;
}
function sortSongs(a,b){
  if(currentSort === 'alpha'){
    const t = a.title.localeCompare(b.title,'fr',{sensitivity:'base'});
    return t !== 0 ? t : new Date(b.date)-new Date(a.date);
  }
  if(currentSort === 'type'){
    const t = a.type.localeCompare(b.type);
    if(t !== 0) return t;
    return new Date(b.date)-new Date(a.date);
  }
  const d = new Date(b.date)-new Date(a.date);
  return d !== 0 ? d : a.title.localeCompare(b.title,'fr',{sensitivity:'base'});
}

/* ---------- Card Rendering ---------- */
function createCard(song,i){
  const recent = isNew(song);
  const cover  = safeCover(song.cover);
  const prod   = song.produced_by_me
    ? `<img class="prod-stamp" src="../img/prod-ns.svg" alt="Prod by Noslow" data-tip="Produit par Noslow">`
    : '';
  return `
    <div class="card${recent?' card--new':''}" data-type="${song.type}" ${recent?'data-new="true"':''}
         style="animation-delay:${i*ANIM_CARD_DELAY}ms" onclick="window.location='${song.link || '#'}'">
      <img class="cover" src="${cover}" alt="${escapeHtml(song.title)}" loading="lazy" data-loading="true">
      ${prod}
      <div class="card-body">
        <h3 class="title">${escapeHtml(song.title)}</h3>
        <p class="artist">${escapeHtml(song.artist)}</p>
      </div>
    </div>`;
}

/* ---------- Image Enhance (blur-up) ---------- */
function enhanceCovers(){
  document.querySelectorAll('.cover[data-loading="true"]').forEach(img=>{
    if(img.complete){
      markLoaded(img);
    } else {
      img.addEventListener('load',()=>markLoaded(img),{once:true});
      img.addEventListener('error',()=>fallbackCover(img),{once:true});
    }
  });
}
function markLoaded(img){
  img.dataset.loading='false';
  img.dataset.loaded='true';
}
function fallbackCover(img){
  const ph = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
    <rect width="100%" height="100%" fill="#E3E0DB"/>
    <text x="50%" y="50%" font-family="Inter,Arial" font-size="42" text-anchor="middle" fill="#8A867F">Image</text>
  </svg>`;
  img.src='data:image/svg+xml;utf8,'+encodeURIComponent(ph);
  markLoaded(img);
}

/* ---------- Results Counter ---------- */
function updateResultsCounter(count){
  if(!resultsCount) return;
  const label = formatFilterName(currentFilter);
  resultsCount.innerHTML = `<span class="count-accent">${count}</span> ${count>1?'morceaux':'morceau'} — ${label}`;
}

/* ---------- Display ---------- */
function displaySongs(){
  const list = songs.filter(passesFilter).sort(sortSongs);
  gridEl.innerHTML = list.length ? list.map((s,i)=>createCard(s,i)).join('') : '<p class="empty">Aucun résultat.</p>';
  updateResultsCounter(list.length);
  enhanceCovers();
}

/* ---------- Bind Filters ---------- */
function bindFilters(){
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const v = btn.dataset.filter;
      if(v === currentFilter) return;
      currentFilter = v;
      document.querySelectorAll('.filter-btn').forEach(b=>{
        const active = b === btn;
        b.classList.toggle('active',active);
        b.setAttribute('aria-pressed',active);
      });
      displaySongs();
    });
  });
}

/* ---------- Sort & Search ---------- */
sortSelect && sortSelect.addEventListener('change',()=>{
  currentSort = sortSelect.value;
  displaySongs();
});
searchInput && searchInput.addEventListener('input',()=>{
  currentSearch = searchInput.value.trim();
  displaySongs();
});

/* ---------- Hero ---------- */
function buildHero(){
  if(!songs.length || !heroCover) return;
  const latest = [...songs].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  if(!latest) return;
  heroCover.src = safeCover(latest.cover);
  heroCover.alt = latest.title;
  heroTitle.textContent = latest.title;
  heroArtist.textContent = latest.artist;
  heroActions.innerHTML = '';
  if(latest.link && latest.link !== '#'){
    const btn = document.createElement('button');
    btn.type='button';
    btn.className='btn-primary';
    btn.textContent='Voir la page';
    btn.addEventListener('click',()=>window.location=latest.link);
    heroActions.appendChild(btn);
  }
  if(heroBadge) heroBadge.style.display = isNew(latest)?'inline-block':'none';
}

/* ---------- Scroll State (condense + scrolled) ---------- */
let ticking = false;
function onScroll(){
  if(!ticking){
    requestAnimationFrame(()=>{
      const y = window.scrollY;
      document.body.classList.toggle('condensed', y > parseInt(getComputedStyle(document.documentElement).getPropertyValue('--collapse-threshold')));
      document.body.classList.toggle('scrolled', y > 4);
      ticking=false;
    });
    ticking=true;
  }
}
window.addEventListener('scroll',onScroll,{passive:true});

/* ---------- Browse Button ---------- */
function scrollToGrid(){
  const rect = gridEl.getBoundingClientRect();
  const top = window.scrollY + rect.top - HERO_SCROLL_OFFSET;
  window.scrollTo({top,behavior:'smooth'});
}
browseBtn && browseBtn.addEventListener('click',scrollToGrid);

/* ---------- Shortcut '/' focus search ---------- */
window.addEventListener('keydown',e=>{
  if(e.key==='/' && document.activeElement.tagName!=='INPUT' && !e.metaKey && !e.ctrlKey){
    e.preventDefault();
    searchInput && searchInput.focus();
  }
});

/* ---------- Mobile Navigation ---------- */
(function mobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.getElementById('main-nav');
  const close  = nav ? nav.querySelector('.nav-close') : null;
  if(!toggle || !nav) return;

  function open(){
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded','true');
    setTimeout(()=>{
      const first = nav.querySelector('.nav-link');
      first && first.focus();
    },250);
  }
  function closeNav(){
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.focus();
  }
  toggle.addEventListener('click',()=>document.body.classList.contains('nav-open')?closeNav():open());
  close && close.addEventListener('click',closeNav);
  nav.addEventListener('click',e=>{
    if(e.target.classList.contains('nav-link')) closeNav();
  });
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape' && document.body.classList.contains('nav-open')) closeNav();
  });
})();

/* ---------- Init ---------- */
(function init(){
  bindFilters();
  buildHero();
  displaySongs();
})();
