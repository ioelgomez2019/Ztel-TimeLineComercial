'use strict';

/* ═══════════════════════════════════════════════════════════
   DATOS INTEGRADOS — fallback si fetch falla (file://)
═══════════════════════════════════════════════════════════ */
const EVENTOS_FALLBACK = [
  { id:1,  fecha:"2026-01-02", activo:true, titulo:"Liquidación de Verano",  icono:"☀️",  descripcion:"Grandes descuentos en ropa y accesorios de temporada.",                        detalle:"Inicia el año con las mejores ofertas. Aprovecha descuentos en ropa de verano, artículos de playa, calzado y accesorios.", promocion:"Hasta 40% OFF en toda la tienda" },
  { id:2,  fecha:"2026-02-14", activo:true, titulo:"San Valentín",           icono:"❤️",  descripcion:"Celebra el amor con regalos especiales para tu pareja.",                        detalle:"San Valentín es la fecha perfecta para sorprender a esa persona especial. Encuentra joyería, perfumes, chocolates y regalos únicos.",         promocion:"2x1 en productos seleccionados" },
  { id:3,  fecha:"2026-03-02", activo:true, titulo:"Regreso a Clases",       icono:"📚",  descripcion:"Todo lo que necesitas para el año escolar con los mejores precios.",             detalle:"Prepárate para el nuevo año escolar con útiles, mochilas, ropa escolar y tecnología.",                                                          promocion:"30% OFF en útiles escolares y tecnología" },
  { id:4,  fecha:"2026-05-10", activo:true, titulo:"Día de la Madre",        icono:"🌹",  descripcion:"Sorprende a mamá con los mejores regalos del año.",                              detalle:"El Día de la Madre merece algo especial. Encuentra joyería, perfumes, cosméticos y artículos del hogar.",                                         promocion:"Envío gratis en pedidos sobre $25.000" },
  { id:5,  fecha:"2026-06-01", activo:true, titulo:"CyberDay",               icono:"💻",  descripcion:"El evento de compras online más grande del año con miles de ofertas.",           detalle:"CyberDay es el mayor evento de comercio electrónico del país. Durante 3 días encontrarás precios únicos en tecnología, moda y hogar.",              promocion:"Hasta 50% OFF + 12 cuotas sin interés" },
  { id:6,  fecha:"2026-06-21", activo:true, titulo:"Día del Padre",          icono:"👔",  descripcion:"Regala algo especial al hombre más importante de tu vida.",                     detalle:"El Día del Padre: electrónica, herramientas, ropa y accesorios con descuentos especiales.",                                                        promocion:"20% OFF en categorías seleccionadas" },
  { id:7,  fecha:"2026-07-01", activo:true, titulo:"Vacaciones de Invierno", icono:"❄️",  descripcion:"Descuentos especiales para disfrutar las vacaciones de invierno.",              detalle:"Las vacaciones de invierno: ropa abrigada, artículos de ski, juegos y entretenimiento de temporada.",                                               promocion:"Hasta 35% OFF en moda de invierno" },
  { id:8,  fecha:"2026-08-09", activo:true, titulo:"Día del Niño",           icono:"🎁",  descripcion:"Sorprende a los más pequeños con los mejores juguetes y regalos.",              detalle:"El Día del Niño: juguetes, videojuegos y ropa infantil con precios increíbles.",                                                                    promocion:"3x2 en juguetes seleccionados" },
  { id:9,  fecha:"2026-08-31", activo:true, titulo:"Cumpleaños de Joel",     icono:"🎂",  descripcion:"Celebración especial de nuestro colaborador Joel con cupón para clientes.",     detalle:"Celebración especial de Joel, colaborador de la empresa. Cupón de descuento para todos los clientes.",                                              promocion:"Cupón JOEL10 — 10% OFF en toda la tienda" },
  { id:10, fecha:"2026-09-18", activo:true, titulo:"Fiestas Patrias",        icono:"🇨🇱", descripcion:"Celebra las fiestas nacionales con ofertas especiales en todo el país.",        detalle:"Las Fiestas Patrias: comida, bebidas, decoración, ropa típica y artículos del hogar con descuentos.",                                               promocion:"18% de descuento en productos seleccionados" },
  { id:11, fecha:"2026-10-05", activo:true, titulo:"CyberMonday",            icono:"🚀",  descripcion:"Lunes de descuentos masivos en tecnología y más categorías.",                   detalle:"CyberMonday: tecnología, electrodomésticos, moda y más con los mejores precios.",                                                                  promocion:"Hasta 60% OFF en tecnología" },
  { id:12, fecha:"2026-10-31", activo:true, titulo:"Halloween",              icono:"🎃",  descripcion:"Disfraces, decoración y ofertas espeluznantes para Halloween.",                 detalle:"¡La noche más aterradora del año! Disfraces, decoración y dulces para celebrar.",                                                                  promocion:"Descuentos de terror: hasta 31% OFF" },
  { id:13, fecha:"2026-11-27", activo:true, titulo:"Black Friday",           icono:"🔥",  descripcion:"El evento de descuentos más esperado del año con ofertas únicas.",              detalle:"Black Friday: descuentos masivos en tecnología, moda, hogar, viajes y electrodomésticos. Ofertas por tiempo limitado.",                             promocion:"Hasta 70% OFF en todas las categorías" },
  { id:14, fecha:"2026-12-01", activo:true, titulo:"Temporada Navideña",     icono:"🎄",  descripcion:"Regalos y decoraciones navideñas con precios especiales para toda la familia.", detalle:"La Temporada Navideña: regalos para toda la familia, decoración navideña y juguetes.",                                                               promocion:"Envío gratis + hasta 30% OFF en regalos" },
  { id:15, fecha:"2026-12-26", activo:true, titulo:"Liquidación Fin de Año", icono:"🎉",  descripcion:"Cierra el año con los mejores descuentos de la temporada.",                     detalle:"Liquidación de Fin de Año: renueva tu hogar y guardarropa con los mejores precios antes del 2027.",                                                 promocion:"Hasta 50% OFF + cuotas sin interés" }
];

/* ═══════════════════════════════════════════════════════════
   ESTADO
═══════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'ztel_timeline_eventos';

let eventos      = [];
let nextEventId  = null;
let countdownInt = null;

/* ═══════════════════════════════════════════════════════════
   INICIO
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);

async function init() {
  eventos = await loadEventos();
  detectNextEvent();
  renderTimeline();
  renderSideNav();
  initIntersectionObserver();
  initScrollHandlers();
  initDetailModal();
  startCountdown();
  initNavToggle();
  setTimeout(scrollToClosestEvent, 350);
}

/* ═══════════════════════════════════════════════════════════
   CARGA DE DATOS — localStorage como caché, JSON como semilla
   Compatible con GitHub Pages y apertura directa en file://
═══════════════════════════════════════════════════════════ */
async function loadEventos() {
  // Si ya hay datos en localStorage los usa directamente
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* corrompido, recarga */ }
  }

  // Primera visita: intenta cargar el JSON del servidor
  try {
    const res = await fetch('./eventos.json');
    if (!res.ok) throw new Error();
    const data   = await res.json();
    const seeded = data.map(ev => ({ activo: true, ...ev }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    // Fallback: usa datos integrados (funciona en file:// y sin servidor)
    const seeded = EVENTOS_FALLBACK.map(ev => ({ ...ev }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

/* ═══════════════════════════════════════════════════════════
   PRÓXIMO EVENTO — solo entre los activos
═══════════════════════════════════════════════════════════ */
function detectNextEvent() {
  const today = startOfDay(new Date());
  let nearest = null, nearestDiff = Infinity;

  for (const ev of eventos) {
    if (!ev.activo) continue;
    const diff = parseDate(ev.fecha) - today;
    if (diff >= 0 && diff < nearestDiff) { nearestDiff = diff; nearest = ev; }
  }

  nextEventId = nearest ? nearest.id : null;

  const nameEl = document.getElementById('header-next-name');
  const cdWrap = document.getElementById('header-countdown');

  if (nearest) {
    if (nameEl) nameEl.textContent = `${nearest.icono} ${nearest.titulo} · ${fmtShort(nearest.fecha)}`;
    if (cdWrap) cdWrap.style.display = '';
  } else {
    if (nameEl) nameEl.textContent = 'Sin eventos próximos';
    if (cdWrap) cdWrap.style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE — solo eventos activos
═══════════════════════════════════════════════════════════ */
function renderTimeline() {
  const wrap    = document.getElementById('timeline-wrap');
  const today   = startOfDay(new Date());
  const activos = eventos.filter(ev => ev.activo);
  let lastMonth = null, sideIndex = 0;

  activos.forEach(ev => {
    const evMonth = ev.fecha.slice(0, 7);
    const isPast  = parseDate(ev.fecha) < today;
    const isNext  = ev.id === nextEventId;
    const side    = sideIndex % 2 === 0 ? 'left' : 'right';

    if (evMonth !== lastMonth) {
      wrap.appendChild(buildMonthSeparator(ev.fecha, side));
      lastMonth = evMonth;
    }
    wrap.appendChild(buildItem(ev, isPast, isNext, side));
    sideIndex++;
  });
}

function buildMonthSeparator(fecha, side) {
  const div = document.createElement('div');
  div.className = `month-separator${side === 'right' ? ' sep-right' : ''}`;
  div.dataset.separatorMonth = fecha.slice(5, 7);
  const label = document.createElement('span');
  label.className   = 'sep-label';
  label.textContent = fmtMonth(fecha);
  const line = document.createElement('span');
  line.className = 'sep-line';
  side === 'right' ? (div.appendChild(line), div.appendChild(label))
                   : (div.appendChild(label), div.appendChild(line));
  return div;
}

function buildItem(ev, isPast, isNext, side) {
  const item = document.createElement('div');
  item.className = ['timeline-item', `side-${side}`, isPast ? 'is-past' : '', isNext ? 'is-next' : ''].filter(Boolean).join(' ');
  item.dataset.eventId = ev.id;
  item.dataset.month   = ev.fecha.slice(5, 7);
  item.id              = `event-${ev.id}`;

  const dot  = document.createElement('div');
  dot.className = 'timeline-dot';
  dot.setAttribute('aria-hidden', 'true');

  const conn = document.createElement('div');
  conn.className = 'timeline-connector';
  conn.setAttribute('aria-hidden', 'true');

  item.appendChild(dot);
  item.appendChild(conn);
  item.appendChild(buildCard(ev, isPast, isNext));
  return item;
}

function buildCard(ev, isPast, isNext) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.setAttribute('role', 'article');

  let badge = '';
  if (isNext)      badge = `<div class="next-badge">✦ PRÓXIMO EVENTO</div>`;
  else if (isPast) badge = `<div class="past-badge">✓ Finalizado</div>`;

  let cdHtml = '';
  if (isNext) {
    cdHtml = `
      <div class="card-countdown" id="card-cd-${ev.id}">
        <div class="cc-block"><span class="cc-num" id="cc-d-${ev.id}">--</span><span class="cc-unit">días</span></div>
        <span class="cc-sep">:</span>
        <div class="cc-block"><span class="cc-num" id="cc-h-${ev.id}">--</span><span class="cc-unit">hrs</span></div>
        <span class="cc-sep">:</span>
        <div class="cc-block"><span class="cc-num" id="cc-m-${ev.id}">--</span><span class="cc-unit">min</span></div>
        <span class="cc-sep">:</span>
        <div class="cc-block"><span class="cc-num" id="cc-s-${ev.id}">--</span><span class="cc-unit">seg</span></div>
      </div>`;
  }

  const promoHtml = ev.promocion
    ? `<div class="card-promo">🏷️ ${escHtml(ev.promocion)}</div>` : '';

  card.innerHTML = `
    ${badge}
    <div class="card-header">
      <div class="card-icon" aria-hidden="true">${ev.icono || '📌'}</div>
      <div class="card-meta">
        <h3 class="card-title">${escHtml(ev.titulo)}</h3>
        <div class="card-date">📅 ${fmtShort(ev.fecha)}</div>
      </div>
    </div>
    <p class="card-desc">${escHtml(ev.descripcion || 'Evento especial con ofertas exclusivas.')}</p>
    ${cdHtml}
    ${promoHtml}
    <button class="card-btn" data-id="${ev.id}" aria-label="Ver detalles de ${escHtml(ev.titulo)}">
      Ver detalles →
    </button>`;
  return card;
}

/* ═══════════════════════════════════════════════════════════
   NAVEGACIÓN LATERAL — solo meses con eventos activos
═══════════════════════════════════════════════════════════ */
function renderSideNav() {
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const usedMonths = new Set(eventos.filter(ev => ev.activo).map(ev => parseInt(ev.fecha.slice(5, 7), 10)));
  const list = document.getElementById('month-list');

  MONTHS.forEach((name, i) => {
    if (!usedMonths.has(i + 1)) return;
    const monthStr = String(i + 1).padStart(2, '0');
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = '#'; a.className = 'month-link'; a.dataset.month = monthStr;
    a.setAttribute('role', 'button');
    a.innerHTML = `<span class="month-dot" aria-hidden="true"></span>${name}`;
    a.addEventListener('click', e => {
      e.preventDefault();
      scrollToMonth(monthStr);
      if (window.innerWidth <= 640) {
        document.getElementById('side-nav').classList.remove('nav-open');
        document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
      }
    });
    li.appendChild(a);
    list.appendChild(li);
  });
}

function scrollToMonth(monthStr) {
  const target = document.querySelector(`[data-month="${monthStr}"]`);
  if (!target) return;
  const headerH = document.getElementById('site-header').offsetHeight;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 20, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — scroll reveal
═══════════════════════════════════════════════════════════ */
function initIntersectionObserver() {
  const items = document.querySelectorAll('.timeline-item');
  if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('revealed')); return; }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   SCROLL — highlight central + nav activa
═══════════════════════════════════════════════════════════ */
function initScrollHandlers() {
  let rafId = null;
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateCenterHighlight();
      updateActiveNavLink();
      rafId = null;
    });
  }, { passive: true });
}

function updateCenterHighlight() {
  const center = window.innerHeight / 2;
  document.querySelectorAll('.timeline-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    item.classList.toggle('center-hi', Math.abs((rect.top + rect.height / 2) - center) < 180);
  });
}

function updateActiveNavLink() {
  const headerH = document.getElementById('site-header').offsetHeight;
  let current = null;
  document.querySelectorAll('.timeline-item[data-month]').forEach(item => {
    if (item.getBoundingClientRect().top < window.innerHeight / 2 + headerH) current = item.dataset.month;
  });
  document.querySelectorAll('.month-link').forEach(link => link.classList.toggle('active', link.dataset.month === current));
}

/* ═══════════════════════════════════════════════════════════
   MODAL DE DETALLE
═══════════════════════════════════════════════════════════ */
function initDetailModal() {
  document.getElementById('timeline-wrap').addEventListener('click', e => {
    const btn = e.target.closest('.card-btn');
    if (btn) openDetailModal(parseInt(btn.dataset.id, 10));
  });
  document.getElementById('modal-close').addEventListener('click', closeDetailModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeDetailModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDetailModal();
  });
}

function openDetailModal(id) {
  const ev = eventos.find(e => e.id === id);
  if (!ev) return;

  const isNext    = ev.id === nextEventId;
  const promoHtml = ev.promocion
    ? `<div class="modal-promo-block"><div class="promo-label">🏷️ Promoción especial</div><div class="promo-value">${escHtml(ev.promocion)}</div></div>` : '';
  const imgHtml   = ev.imagen
    ? `<img src="${escHtml(ev.imagen)}" alt="${escHtml(ev.titulo)}" class="modal-img" loading="lazy">` : '';

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-icon-wrap">
      <span class="modal-icon" aria-hidden="true">${ev.icono || '📌'}</span>
    </div>
    ${isNext ? `<div class="modal-next-badge">✦ PRÓXIMO EVENTO</div>` : ''}
    <h2 class="modal-title" id="modal-title">${escHtml(ev.titulo)}</h2>
    <div class="modal-date">📅 ${fmtLong(ev.fecha)}</div>
    <div class="modal-divider"></div>
    <p class="modal-detail">${escHtml(ev.detalle || ev.descripcion || '')}</p>
    ${promoHtml}${imgHtml}`;

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('modal-close').focus(), 50);
}

function closeDetailModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN
═══════════════════════════════════════════════════════════ */
function startCountdown() {
  if (nextEventId === null) return;
  const ev = eventos.find(e => e.id === nextEventId);
  if (!ev) return;
  const target = parseDate(ev.fecha);

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) { setCounterValues(0,0,0,0); clearInterval(countdownInt); return; }
    setCounterValues(
      Math.floor(diff / 864e5),
      Math.floor((diff % 864e5) / 36e5),
      Math.floor((diff % 36e5) / 6e4),
      Math.floor((diff % 6e4) / 1e3)
    );
  }
  tick();
  countdownInt = setInterval(tick, 1000);
}

function setCounterValues(d, h, m, s) {
  const pad = n => String(n).padStart(2, '0');
  setTextSafe('cd-days',  d);
  setTextSafe('cd-hours', pad(h));
  setTextSafe('cd-mins',  pad(m));
  setTextSafe('cd-secs',  pad(s));
  if (nextEventId !== null) {
    setTextSafe(`cc-d-${nextEventId}`, d);
    setTextSafe(`cc-h-${nextEventId}`, pad(h));
    setTextSafe(`cc-m-${nextEventId}`, pad(m));
    setTextSafe(`cc-s-${nextEventId}`, pad(s));
  }
}

/* ═══════════════════════════════════════════════════════════
   SCROLL AUTOMÁTICO AL EVENTO MÁS CERCANO
═══════════════════════════════════════════════════════════ */
function scrollToClosestEvent() {
  const targetId = nextEventId ?? findMostRecentPastId();
  if (targetId === null) return;
  const el = document.getElementById(`event-${targetId}`);
  if (!el) return;
  const headerH = document.getElementById('site-header').offsetHeight;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerH - 32, behavior: 'smooth' });
}

function findMostRecentPastId() {
  const today   = startOfDay(new Date());
  const pasados = eventos.filter(ev => ev.activo && parseDate(ev.fecha) < today);
  return pasados.length ? pasados[pasados.length - 1].id : null;
}

/* ═══════════════════════════════════════════════════════════
   NAV TOGGLE
═══════════════════════════════════════════════════════════ */
function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('side-nav');
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════════════════ */
function parseDate(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d, 0, 0, 0, 0);
}
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
function fmtShort(dateStr) {
  return parseDate(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
}
function fmtLong(dateStr) {
  return parseDate(dateStr).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtMonth(dateStr) {
  return parseDate(dateStr).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function setTextSafe(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
