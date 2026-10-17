(() => {
'use strict';
let SONGS, CATS, BY, NUMS, MAX = 935;

// ---------- les recueils ----------
// Chaque recueil a son fichier de données, sa couleur et sa propre numérotation.
const BOOKS = [
  { id: '1', slug: '', name: 'Louanges à Dieu', file: 'cantiques.json', local: 'cantiques.local.js', glob: '__CANTIQUES', favKey: 'favs', lastKey: 'last' },
  { id: '2', slug: '2/', name: 'Recueil Cantiques', file: 'recueil2.json', local: 'recueil2.local.js', glob: '__RECUEIL2', favKey: 'favs2', lastKey: 'last2' }
];
const DATA = {};      // id -> { songs, cats, by, nums, max } ou null si absent
const FAVS = {};      // id -> Set
let BOOK = BOOKS[0], P = '#/';
function loadBook(b) {
  if (b.id in DATA) return Promise.resolve(DATA[b.id]);
  const get = location.protocol === 'file:'
    ? new Promise((ok, ko) => { const s = document.createElement('script'); s.src = b.local; s.onload = () => (window[b.glob] ? ok(window[b.glob]) : ko()); s.onerror = ko; document.head.appendChild(s); })
    : fetch(b.file).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  return get.then(d => {
    const songs = d.cantiques || [];
    if (!songs.length) throw new Error('vide');
    for (const s of songs) { s.nt = norm(s.t); s.nb = norm(s.s.map(x => x[1].join(' ')).join(' ')); }
    const nums = songs.map(s => s.n);
    return (DATA[b.id] = { songs, cats: d.categories || [], by: new Map(songs.map(s => [s.n, s])), nums, max: nums[nums.length - 1] });
  }).catch(() => (DATA[b.id] = null));
}
const bookAvailable = id => !!DATA[id];
function useBook(b) {
  const d = DATA[b.id];
  BOOK = b; P = '#/' + b.slug;
  SONGS = d.songs; CATS = d.cats; BY = d.by; NUMS = d.nums; MAX = d.max;
  favs = FAVS[b.id] || (FAVS[b.id] = new Set(store.get(b.favKey, [])));
  document.body.setAttribute('data-book', b.id);
}
function parseRoute() {
  const seg = (location.hash || '#/').split('/').slice(1);
  const book = seg[0] === '2' ? BOOKS[1] : BOOKS[0];
  if (seg[0] === '2') seg.shift();
  return { book, p: seg[0] || '', a: seg[1] };
}
const curNum = () => { const r = parseRoute(); return r.p === 'c' ? +r.a : NaN; };

// ---------- utilitaires ----------
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘`]/g, "'").replace(/œ/g, 'oe').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const pad = n => String(n).padStart(3, '0');
const store = {
  get(k, d) { try { const v = localStorage.getItem('cq.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cq.' + k, JSON.stringify(v)); } catch (e) {} }
};
const ICON = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  tag: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1"/>', star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>', text: '<path d="M4 20l6-16 6 16M6.5 14h7M17 12h4M19 10v4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.7 10.7l6.6-4.4M8.7 13.3l6.6 4.4"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'
};
const svg = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const titleOf = s => s.t;
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800); }

// ---------- état persistant ----------
let favs = new Set(store.get('favs', []));
FAVS['1'] = favs;
let prefs = Object.assign({ fs: 19, theme: 'auto', font: 'serif', wake: false }, store.get('prefs', {}));
const saveFavs = () => store.set(BOOK.favKey, [...favs]);
const savePrefs = () => store.set('prefs', prefs);

function applyPrefs() {
  const r = document.documentElement;
  r.style.setProperty('--fs', prefs.fs + 'px');
  r.style.setProperty('--read', prefs.font === 'sans' ? 'var(--sans)' : 'var(--serif)');
  prefs.theme === 'auto' ? r.removeAttribute('data-theme') : r.setAttribute('data-theme', prefs.theme);
  const dark = prefs.theme === 'dark' || (prefs.theme === 'auto' && matchMedia('(prefers-color-scheme:dark)').matches);
  if (prefs.theme === 'auto') r.setAttribute('data-theme', dark ? 'dark' : 'sepia');
  document.querySelector('meta[name=theme-color]').content = dark ? '#1b1b1f' : '#7a1f2b';
}
try { const mq = matchMedia('(prefers-color-scheme:dark)'); (mq.addEventListener ? mq.addEventListener('change', applyPrefs) : mq.addListener && mq.addListener(applyPrefs)); } catch (e) {}

// ---------- installation de l'application (PWA) ----------
let deferredPrompt = null;
const UA = navigator.userAgent || '';
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isSafariIOS = isIOS && /safari/i.test(UA) && !/crios|fxios|edgios|opios|gsa\/|fbios|instagram/i.test(UA);
const inAppBrowser = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|Snapchat|TikTok|Twitter|; wv\)|Telegram|GSA\//i.test(UA) || (isIOS && !/safari/i.test(UA));
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; refreshInstall(); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('Application installée ✓'); refreshInstall(); });
const isAndroid = /android/i.test(UA);
function chromeIntent() { return 'intent://' + location.host + location.pathname + '#Intent;scheme=' + location.protocol.replace(':', '') + ';package=com.android.chrome;end'; }
function installCard() {
  if (isStandalone() || store.get('hideInstall', false)) return '';
  let msg, btn = '';
  if (deferredPrompt) { msg = 'Installez l’application pour la lire hors ligne, comme un livre.'; btn = '<button class="btn" data-act="install">Installer</button>'; }
  else if (inAppBrowser && isAndroid) { msg = 'Vous êtes dans le navigateur d’une autre application : l’installation y est impossible. Ouvrez le site dans <b>Chrome</b>.'; btn = '<button class="btn" data-act="openchrome">Ouvrir dans Chrome</button>'; }
  else if (inAppBrowser) { msg = 'Vous êtes dans le navigateur d’une autre application : l’installation y est impossible. Copiez le lien et collez-le dans <b>Safari</b>.'; btn = '<button class="btn" data-act="copylink">Copier le lien</button>'; }
  else if (isSafariIOS) msg = 'Pour installer sur iPhone / iPad : touchez <b>Partager</b> (le carré avec la flèche) puis <b>« Sur l’écran d’accueil »</b>.';
  else if (isIOS) { msg = 'Sur iPhone / iPad, l’installation se fait depuis <b>Safari</b>. Copiez le lien et collez-le dans Safari.'; btn = '<button class="btn" data-act="copylink">Copier le lien</button>'; }
  else msg = 'Pour installer : menu du navigateur (⋮) → <b>« Installer l’application »</b> ou <b>« Ajouter à l’écran d’accueil »</b>.';
  return `<div class="install" id="install"><div>${msg}<br><a class="lnk" href="#/installer">Voir le guide pas à pas</a></div>${btn}<button class="x2" data-act="hideinstall" aria-label="Masquer">✕</button></div>`;
}
function refreshInstall() { const el = document.getElementById('install'); if (el) el.outerHTML = installCard(); }

function booksSwitcher() {
  if (!bookAvailable('2')) return '';
  return '<div class="books">' + BOOKS.map(b => `<a href="#/${b.slug}" class="b${b.id}${b === BOOK ? ' on' : ''}"><b>${esc(b.name)}</b><small>${DATA[b.id].songs.length} cantiques</small></a>`).join('') + '</div>';
}

// ---------- recherche ----------
function search(q) {
  const nq = norm(q);
  if (!nq) return [];
  const words = nq.split(' ');
  const out = [];
  for (const s of SONGS) {
    let score = 0;
    if (String(s.n) === q.trim() || pad(s.n) === q.trim()) score += 1000;
    let ok = true;
    for (const w of words) {
      if (s.nt.includes(w)) score += s.nt.startsWith(w) ? 30 : 20;
      else if (s.nb.includes(w)) score += 5;
      else { ok = false; break; }
    }
    if (ok && words.length > 1 && s.nb.includes(nq)) score += 40;
    if (ok && score) out.push([score, s]);
  }
  return out.sort((a, b) => b[0] - a[0] || a[1].n - b[1].n).map(x => x[1]);
}
function snippet(s, q) {
  const w = norm(q).split(' ')[0];
  for (const b of s.s) for (const l of b[1]) if (norm(l).includes(w) && !norm(s.t).includes(w)) return l;
  return '';
}
function mark(text, q) {
  const words = norm(q).split(' ').filter(Boolean);
  if (!words.length) return esc(text);
  // surligne en comparant mot par mot (sans accents)
  return text.split(/(\s+)/).map(tok => {
    const n = norm(tok);
    return n && words.some(w => n.includes(w)) ? `<mark>${esc(tok)}</mark>` : esc(tok);
  }).join('');
}

// ---------- vues ----------
const view = $('#view'), top = $('#top'), tabs = $('#tabs');
const tabsFor = () => [[P, 'Accueil', 'home'], [P + 'liste', 'Titres', 'list']].concat(CATS && CATS.length > 1 ? [[P + 'themes', 'Thèmes', 'tag']] : [], [[P + 'favoris', 'Favoris', 'star']]);

function setTabs(active) {
  tabs.innerHTML = tabsFor().map(([h, l, i]) => `<a href="${h}" class="${h === active ? 'on' : ''}">${svg(i)}${l}</a>`).join('');
}
function header(title, { back, actions = '' } = {}) {
  top.innerHTML = (back ? `<button class="ib" data-act="back" aria-label="Retour">${svg('back')}</button>` : '') +
    `<h1>${esc(title)}</h1>${actions}`;
}
function row(s, q = '') {
  const sn = q ? snippet(s, q) : '';
  return `<a href="${P}c/${s.n}"><span class="n">${pad(s.n)}</span><span class="t">${q ? mark(s.t, q) : esc(s.t)}${sn ? `<small>${mark(sn, q)}</small>` : ''}</span>${favs.has(s.n) ? '<span class="star">★</span>' : ''}</a>`;
}

function viewHome() {
  document.body.classList.remove('reading');
  header(BOOK.name, { actions: `<button class="ib" data-act="prefs" aria-label="Réglages">${svg('text')}</button>` });
  setTabs(P);
  const last = store.get(BOOK.lastKey);
  const lastS = last && BY.get(last);
  const ranges = [];
  for (let a = 1; a <= MAX; a += 100) ranges.push(`<a href="${P}serie/${a}">${pad(a)}–${Math.min(a + 99, MAX)}</a>`);
  view.innerHTML = `
    <div class="search"><input id="q" type="search" inputmode="search" placeholder="Titre, mot ou numéro…" autocomplete="off" aria-label="Recherche"><button class="x" data-act="clear" hidden aria-label="Effacer">✕</button></div>
    <div id="results"></div>
    <div id="home">
      ${booksSwitcher()}
      ${installCard()}
      ${lastS ? `<button class="resume" data-go="${lastS.n}"><small>Reprendre la lecture</small><b>${pad(lastS.n)} · ${esc(lastS.t)}</b></button>` : ''}
      <form class="goto" id="goto"><input id="gn" type="number" min="1" max="${MAX}" inputmode="numeric" placeholder="Aller au cantique n°" aria-label="Numéro"><button class="btn">Ouvrir</button></form>
      <h2 class="sec">Parcourir le recueil</h2>
      <div class="ranges">${ranges.join('')}</div>
      <h2 class="sec">Au hasard</h2>
      <button class="btn ico" data-act="random">${svg('shuffle')}Un cantique surprise</button>
      <p class="foot">${SONGS.length} cantiques · fonctionne hors ligne</p>
    </div>`;
  const q = $('#q'), res = $('#results'), home = $('#home'), x = view.querySelector('.x');
  let t;
  q.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const v = q.value.trim();
      x.hidden = !v; home.hidden = !!v;
      if (!v) { res.innerHTML = ''; return; }
      const r = search(v);
      res.innerHTML = r.length
        ? `<p class="foot" style="text-align:left">${r.length} résultat${r.length > 1 ? 's' : ''}</p><div class="list">${r.slice(0, 80).map(s => row(s, v)).join('')}</div>${r.length > 80 ? '<p class="foot">Affinez la recherche pour voir la suite…</p>' : ''}`
        : '<div class="empty">Aucun cantique trouvé.</div>';
    }, 120);
  });
  $('#goto').addEventListener('submit', e => {
    e.preventDefault();
    const n = +$('#gn').value;
    BY.has(n) ? (location.hash = P + 'c/' + n) : toast(BOOK.id === '1' && n === 666 ? 'Le n° 666 est absent du recueil' : 'Numéro introuvable dans ce recueil');
  });
}

function viewSerie(a) {
  a = +a; const b = Math.min(a + 99, MAX);
  document.body.classList.remove('reading');
  header(`${pad(a)} – ${b}`, { back: true }); setTabs(P);
  let h = '<div class="grid">';
  for (let n = a; n <= b; n++) if (BY.has(n)) h += `<a href="${P}c/${n}" class="${favs.has(n) ? 'fav' : ''}">${pad(n)}</a>`;
  view.innerHTML = h + '</div>';
  window.scrollTo(0, 0);
}

function viewListe() {
  document.body.classList.remove('reading');
  header('Index des titres'); setTabs(P + 'liste');
  const sorted = [...SONGS].sort((x, y) => x.nt.localeCompare(y.nt, 'fr'));
  let h = '<div class="list">', cur = '';
  for (const s of sorted) {
    const L = (s.nt[0] || '#').toUpperCase();
    if (L !== cur) { cur = L; h += `</div><div class="letter">${/[A-Z]/.test(L) ? L : '#'}</div><div class="list">`; }
    h += row(s);
  }
  view.innerHTML = h + '</div>';
  window.scrollTo(0, 0);
}

function viewThemes() {
  document.body.classList.remove('reading');
  header('Thèmes'); setTabs(P + 'themes');
  const cnt = CATS.map((_, i) => SONGS.filter(s => s.c === i).length);
  view.innerHTML = '<div class="themes">' + CATS.map((c, i) => cnt[i] ? `<a href="${P}theme/${i}">${esc(c)}<span>${cnt[i]}</span></a>` : '').join('') + '</div>';
  window.scrollTo(0, 0);
}
function viewTheme(i) {
  document.body.classList.remove('reading');
  header(CATS[i] || 'Thème', { back: true }); setTabs(P + 'themes');
  view.innerHTML = '<div class="list">' + SONGS.filter(s => s.c === +i).map(s => row(s)).join('') + '</div>';
  window.scrollTo(0, 0);
}

function viewFavs() {
  document.body.classList.remove('reading');
  header('Mes favoris'); setTabs(P + 'favoris');
  const l = SONGS.filter(s => favs.has(s.n));
  view.innerHTML = l.length ? '<div class="list">' + l.map(s => row(s)).join('') + '</div>'
    : '<div class="empty">Aucun favori pour l’instant.<br>Touchez l’étoile ★ en haut d’un cantique pour l’ajouter.</div>';
  window.scrollTo(0, 0);
}

async function copyLink() {
  const url = location.origin + location.pathname;
  try { await navigator.clipboard.writeText(url); toast('Lien copié : collez-le dans votre navigateur'); }
  catch (e) { const t = document.createElement('input'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast('Lien copié'); } catch (e2) { toast(url); } t.remove(); }
}
function viewInstall() {
  document.body.classList.remove('reading');
  header('Installer l’application', { back: true }); setTabs('');
  const steps = (title, list, active) => `<section class="guide${active ? ' me' : ''}"><h3>${title}${active ? ' <span class="you">votre téléphone</span>' : ''}</h3><ol>${list.map(x => `<li>${x}</li>`).join('')}</ol></section>`;
  const ios = ['Ouvrez ce site dans <b>Safari</b> (pas dans WhatsApp, Facebook ou Chrome).', 'Touchez le bouton <b>Partager</b> (un carré avec une flèche vers le haut), en bas de l’écran.', 'Faites défiler et touchez <b>« Sur l’écran d’accueil »</b>.', 'Touchez <b>Ajouter</b>. L’icône apparaît sur votre écran d’accueil.'];
  const and = ['Ouvrez ce site dans <b>Chrome</b> (pas dans WhatsApp ou Facebook).', 'Touchez le bouton <b>Installer</b> de l’accueil, ou le menu <b>⋮</b> puis <b>« Installer l’application »</b> (ou « Ajouter à l’écran d’accueil »).', 'Confirmez : l’icône apparaît parmi vos applications.'];
  const pc = ['Dans Chrome ou Edge, cliquez sur l’icône <b>Installer</b> à droite de la barre d’adresse, ou menu <b>⋮</b> → « Installer… ».'];
  const web = ['Si vous êtes dans WhatsApp, Facebook, Telegram ou Instagram : touchez <b>⋮</b> ou <b>⎋</b> puis <b>« Ouvrir dans le navigateur »</b>.', 'Sinon, touchez <b>Copier le lien</b> ci-dessous et collez-le dans Chrome (Android) ou Safari (iPhone).'];
  view.innerHTML = `<p class="foot" style="text-align:left;margin:0 0 12px">L’application s’ouvre aussi directement dans le navigateur, sans installation, et fonctionne alors hors ligne dès la première visite.</p>
    ${inAppBrowser ? steps('Vous êtes dans une autre application', web, true) : ''}
    ${steps('iPhone / iPad', ios, isIOS && !inAppBrowser)}
    ${steps('Android', and, isAndroid && !inAppBrowser)}
    ${steps('Ordinateur', pc, !isIOS && !isAndroid)}
    <div class="guide-actions"><button class="btn" data-act="copylink">Copier le lien du site</button>${isAndroid ? '<button class="btn sec" data-act="openchrome">Ouvrir dans Chrome</button>' : ''}</div>`;
  window.scrollTo(0, 0);
}

let dir = 1;
function viewSong(n) {
  const s = BY.get(+n);
  if (!s) { location.hash = P; return; }
  document.body.classList.add('reading');
  store.set(BOOK.lastKey, s.n);
  document.title = `${pad(s.n)} · ${s.t} — ${BOOK.name}`;
  const i = NUMS.indexOf(s.n), prev = NUMS[i - 1], next = NUMS[i + 1];
  const fav = favs.has(s.n);
  header(`Cantique ${pad(s.n)}`, {
    back: true,
    actions: `<button class="ib ${fav ? 'on' : ''}" data-act="fav" aria-label="Favori">${svg('star')}</button>
      <button class="ib" data-act="share" aria-label="Partager">${svg('share')}</button>
      <button class="ib" data-act="prefs" aria-label="Affichage">${svg('text')}</button>`
  });
  setTabs('');
  let v = 0;
  const body = s.s.map(([t, lines]) => {
    const txt = lines.map(l => `<p>${esc(l)}</p>`).join('');
    if (t === 'r') return `<div class="st r"><span class="lb">Refrain</span>${txt}</div>`;
    v++; return `<div class="st"><span class="lb">${v}</span><div>${txt}</div></div>`;
  }).join('');
  view.innerHTML = `<article class="book ${dir < 0 ? 'back' : ''}">
      <span class="num">${pad(s.n)}</span>
      <h2>${esc(s.t)}</h2>
      <div class="meta"><span class="bk-badge">${esc(BOOK.name)}</span> ${CATS.length > 1 ? esc(CATS[s.c] || '') : ''}${s.r ? ' · ' + esc(s.r) : ''}</div>
      ${s.v ? '<p class="check">⚠ Transcription à vérifier sur l’original : certains mots ou passages sont incertains.</p>' : ''}
      ${body}
    </article>
    <div class="pager"><button data-go="${prev || ''}" ${prev ? '' : 'disabled'}>‹ ${prev ? pad(prev) : ''}</button><span>${i + 1} / ${NUMS.length}</span><button data-go="${next || ''}" ${next ? '' : 'disabled'}>${next ? pad(next) : ''} ›</button></div>
    <p class="foot">Astuce : glissez à gauche ou à droite pour tourner la page</p>`;
  window.scrollTo(0, 0);
  dir = 1;
  keepAwake();
}

// ---------- routage ----------
function route() {
  const r = parseRoute();
  const show = () => {
    if (!bookAvailable(r.book.id)) { location.replace('#/'); return; }
    useBook(r.book);
    document.title = BOOK.name + ' — Cantiques';
    ({ '': viewHome, liste: viewListe, themes: viewThemes, favoris: viewFavs, installer: viewInstall }[r.p] ||
     ({ c: viewSong, serie: viewSerie, theme: viewTheme }[r.p]) || viewHome)(r.a);
  };
  r.book.id in DATA ? show() : loadBook(r.book).then(show);
}
addEventListener('hashchange', route);

// ---------- actions ----------
function go(n) { if (!n) return; dir = n < (curNum() || 0) ? -1 : 1; location.hash = P + 'c/' + n; }
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act],[data-go],[data-set]'); if (!el) return;
  if (el.dataset.go) return go(+el.dataset.go);
  const cur = curNum();
  switch (el.dataset.act) {
    case 'back': history.length > 1 ? history.back() : (location.hash = P); break;
    case 'fav': favs.has(cur) ? (favs.delete(cur), toast('Retiré des favoris')) : (favs.add(cur), toast('Ajouté aux favoris')); saveFavs(); el.classList.toggle('on', favs.has(cur)); break;
    case 'share': share(cur); break;
    case 'random': location.hash = P + 'c/' + NUMS[Math.random() * NUMS.length | 0]; break;
    case 'clear': { const q = $('#q'); q.value = ''; q.dispatchEvent(new Event('input')); q.focus(); } break;
    case 'prefs': openPrefs(); break;
    case 'install': if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { deferredPrompt = null; refreshInstall(); }); } break;
    case 'openchrome': location.href = chromeIntent(); setTimeout(() => toast('Si rien ne s’ouvre : menu ⋮ → Ouvrir dans le navigateur'), 1500); break;
    case 'copylink': copyLink(); break;
    case 'hideinstall': store.set('hideInstall', true); { const i = document.getElementById('install'); if (i) i.remove(); } break;
  }
});
async function share(n) {
  const s = BY.get(n); if (!s) return;
  let v = 0;
  const text = `${pad(s.n)} — ${s.t}\n\n` + s.s.map(([t, l]) => (t === 'r' ? 'Refrain :\n' : `${++v}.\n`) + l.join('\n')).join('\n\n') + '\n\n— Louanges à Dieu';
  try { if (navigator.share) { await navigator.share({ title: s.t, text }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Cantique copié'); } catch (e) { toast('Partage indisponible'); }
}

// ---------- réglages ----------
function openPrefs() {
  const sh = $('#sheet'), reading = document.body.classList.contains('reading');
  const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button data-set="${k}" data-v="${v}" class="${prefs[k] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  sh.innerHTML = `<div class="pan" role="dialog" aria-label="Réglages"><h3>Affichage</h3>
    <div class="row"><label>Taille du texte</label><input type="range" id="fs" min="14" max="34" value="${prefs.fs}" aria-label="Taille du texte"></div>
    <div class="row"><label>Thème</label>${seg('theme', [['auto', 'Auto'], ['sepia', 'Papier'], ['light', 'Clair'], ['dark', 'Sombre']])}</div>
    <div class="row"><label>Police</label>${seg('font', [['serif', 'Livre (serif)'], ['sans', 'Moderne']])}</div>
    ${reading ? `<div class="row"><label>Lecture</label>${seg('big', [[0, 'Normal'], [1, 'Grand écran (chantre)']])}</div>` : ''}
    <div class="row"><label>Écran</label>${seg('wake', [[false, 'Veille normale'], [true, 'Garder allumé']])}</div>
    <a class="lnk" href="#/installer" data-act-close style="display:block;text-align:center;margin:10px 0">Installer l’application</a><button class="btn" style="width:100%;margin-top:6px" data-act-close>Terminé</button></div>`;
  sh.hidden = false;
  sh.querySelector('#fs').oninput = e => { prefs.fs = +e.target.value; savePrefs(); applyPrefs(); };
  sh.onclick = e => {
    if (e.target === sh || e.target.hasAttribute('data-act-close')) { sh.hidden = true; return; }
    const b = e.target.closest('[data-set]'); if (!b) return;
    const k = b.dataset.set, raw = b.dataset.v, val = raw === 'true' ? true : raw === 'false' ? false : (raw === '0' || raw === '1') ? +raw : raw;
    if (k === 'big') { document.body.classList.toggle('big', !!val); }
    else { prefs[k] = val; savePrefs(); applyPrefs(); if (k === 'wake') keepAwake(); }
    b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  };
}
let lock;
async function keepAwake() {
  try {
    if (prefs.wake && 'wakeLock' in navigator && document.body.classList.contains('reading')) lock = await navigator.wakeLock.request('screen');
    else if (lock) { await lock.release(); lock = null; }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && keepAwake());

// ---------- gestes et clavier ----------
let sx, sy, st;
view.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
view.addEventListener('touchend', e => {
  if (!document.body.classList.contains('reading') || sx == null) return;
  const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
  sx = null;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && Date.now() - st < 700) {
    const cur = curNum(), i = NUMS.indexOf(cur);
    dx < 0 ? go(NUMS[i + 1]) : go(NUMS[i - 1]);
  }
}, { passive: true });
addEventListener('keydown', e => {
  if (!document.body.classList.contains('reading') || /input|textarea/i.test(e.target.tagName)) return;
  const cur = curNum(), i = NUMS.indexOf(cur);
  if (e.key === 'ArrowRight') go(NUMS[i + 1]); else if (e.key === 'ArrowLeft') go(NUMS[i - 1]);
});

// ---------- démarrage et PWA ----------
applyPrefs();
// Le premier recueil est obligatoire ; le second est facultatif (il n'apparaît que si son fichier existe).
loadBook(BOOKS[0]).then(d => {
  if (!d) { view.innerHTML = '<div class="empty">Impossible de charger les cantiques.</div>'; return; }
  loadBook(BOOKS[1]).then(() => route());
});
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  // Quand une nouvelle version du recueil est installée, on recharge la page une seule fois.
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(r => r.update && r.update()).catch(() => {}));
  navigator.serviceWorker.ready.then(() => { if (!store.get('offlineOk', false)) { store.set('offlineOk', true); setTimeout(() => toast('Disponible hors ligne ✓'), 800); } }).catch(() => {});
}
})();
