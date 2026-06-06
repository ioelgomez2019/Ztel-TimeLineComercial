'use strict';

/* ═══════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════ */
const EVENTOS_KEY       = 'ztel_timeline_eventos';
const USERS_KEY         = 'ztel_usuarios';
const SESSION_KEY       = 'ztel_admin_session';
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 horas

const ROLES = {
  superadmin: { label: 'Super Admin',    badge: 'badge-superadmin', userBadge: 'role-superadmin' },
  admin:      { label: 'Administrador',  badge: 'badge-admin',      userBadge: 'role-admin'      },
  usuario:    { label: 'Usuario',        badge: 'badge-usuario',    userBadge: 'role-usuario'    }
};

/* ═══════════════════════════════════════════════════════════
   DATOS SEMILLA (primera carga si no hay localStorage)
═══════════════════════════════════════════════════════════ */
const EVENTOS_SEED = [
  { id:1,  fecha:"2026-01-02", activo:true, titulo:"Liquidación de Verano",  icono:"☀️",  descripcion:"Grandes descuentos en ropa y accesorios de temporada.", detalle:"Inicia el año con las mejores ofertas de verano.",  promocion:"Hasta 40% OFF en toda la tienda" },
  { id:2,  fecha:"2026-02-14", activo:true, titulo:"San Valentín",           icono:"❤️",  descripcion:"Celebra el amor con regalos especiales.",                detalle:"San Valentín: joyería, perfumes y regalos únicos.",  promocion:"2x1 en productos seleccionados" },
  { id:3,  fecha:"2026-03-02", activo:true, titulo:"Regreso a Clases",       icono:"📚",  descripcion:"Todo para el año escolar con los mejores precios.",       detalle:"Útiles, mochilas, tecnología y ropa escolar.",       promocion:"30% OFF en útiles y tecnología" },
  { id:4,  fecha:"2026-05-10", activo:true, titulo:"Día de la Madre",        icono:"🌹",  descripcion:"Sorprende a mamá con los mejores regalos del año.",        detalle:"Joyería, perfumes, cosméticos y artículos del hogar.",promocion:"Envío gratis en pedidos sobre $25.000" },
  { id:5,  fecha:"2026-06-01", activo:true, titulo:"CyberDay",               icono:"💻",  descripcion:"El evento de compras online más grande del año.",          detalle:"Precios únicos en tecnología, moda, hogar y viajes.", promocion:"Hasta 50% OFF + 12 cuotas sin interés" },
  { id:6,  fecha:"2026-06-21", activo:true, titulo:"Día del Padre",          icono:"👔",  descripcion:"Regala algo especial al hombre más importante.",           detalle:"Electrónica, herramientas, ropa y accesorios.",       promocion:"20% OFF en categorías seleccionadas" },
  { id:7,  fecha:"2026-07-01", activo:true, titulo:"Vacaciones de Invierno", icono:"❄️",  descripcion:"Descuentos para las vacaciones de invierno.",              detalle:"Ropa abrigada, artículos de ski y entretenimiento.",  promocion:"Hasta 35% OFF en moda de invierno" },
  { id:8,  fecha:"2026-08-09", activo:true, titulo:"Día del Niño",           icono:"🎁",  descripcion:"Los mejores juguetes y regalos para los pequeños.",        detalle:"Juguetes, videojuegos y ropa infantil.",              promocion:"3x2 en juguetes seleccionados" },
  { id:9,  fecha:"2026-08-31", activo:true, titulo:"Cumpleaños de Joel",     icono:"🎂",  descripcion:"Celebración especial de Joel con cupón para clientes.",    detalle:"Cupón de descuento especial para todos los clientes.", promocion:"Cupón JOEL10 — 10% OFF" },
  { id:10, fecha:"2026-09-18", activo:true, titulo:"Fiestas Patrias",        icono:"🇨🇱", descripcion:"Ofertas especiales para las fiestas nacionales.",          detalle:"Comida, decoración, ropa típica y artículos del hogar.",promocion:"18% de descuento en seleccionados" },
  { id:11, fecha:"2026-10-05", activo:true, titulo:"CyberMonday",            icono:"🚀",  descripcion:"Descuentos masivos en tecnología y más.",                  detalle:"Tecnología, electrodomésticos, moda y más.",          promocion:"Hasta 60% OFF en tecnología" },
  { id:12, fecha:"2026-10-31", activo:true, titulo:"Halloween",              icono:"🎃",  descripcion:"Disfraces, decoración y ofertas de Halloween.",             detalle:"Disfraces, decoración y dulces para Halloween.",      promocion:"Hasta 31% OFF" },
  { id:13, fecha:"2026-11-27", activo:true, titulo:"Black Friday",           icono:"🔥",  descripcion:"El mayor evento de descuentos del año.",                   detalle:"Descuentos masivos en todas las categorías.",         promocion:"Hasta 70% OFF en todas las categorías" },
  { id:14, fecha:"2026-12-01", activo:true, titulo:"Temporada Navideña",     icono:"🎄",  descripcion:"Regalos y decoración navideña con precios especiales.",     detalle:"Regalos, decoración navideña y juguetes.",            promocion:"Envío gratis + hasta 30% OFF" },
  { id:15, fecha:"2026-12-26", activo:true, titulo:"Liquidación Fin de Año", icono:"🎉",  descripcion:"Los mejores descuentos para cerrar el año.",               detalle:"Renueva tu hogar y guardarropa para el 2027.",        promocion:"Hasta 50% OFF + cuotas sin interés" }
];

/* ═══════════════════════════════════════════════════════════
   ESTADO GLOBAL
═══════════════════════════════════════════════════════════ */
let session         = null;
let eventos         = [];
let usuarios        = [];
let currentSection  = 'eventos';
let confirmCb       = null;
let evFilter        = { search: '', status: 'all' };
let usrFilter       = { search: '', role: 'all' };

/* ═══════════════════════════════════════════════════════════
   INICIO
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initData();
  checkSession();
  initLoginForm();
  initModals();
  initSidebar();
});

/* ═══════════════════════════════════════════════════════════
   DATOS
═══════════════════════════════════════════════════════════ */
function initData() {
  // Eventos: carga desde localStorage (compartido con index.html)
  try { eventos = JSON.parse(localStorage.getItem(EVENTOS_KEY) || '') || []; } catch { eventos = []; }
  if (!eventos.length) { eventos = EVENTOS_SEED.map(e => ({ ...e })); saveEventos(); }

  // Usuarios: carga o siembra usuario por defecto
  try { usuarios = JSON.parse(localStorage.getItem(USERS_KEY) || '') || []; } catch { usuarios = []; }
  if (!usuarios.length) {
    usuarios = [{ id:1, username:'admin', password:'Calidad.123', nombre:'Administrador Principal', role:'superadmin', activo:true }];
    saveUsuarios();
  }
}

function saveEventos()  { localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos)); }
function saveUsuarios() { localStorage.setItem(USERS_KEY,   JSON.stringify(usuarios)); }

/* ═══════════════════════════════════════════════════════════
   SESIÓN
═══════════════════════════════════════════════════════════ */
function checkSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (s && (Date.now() - s.loginTime) < SESSION_EXPIRY_MS) {
      session = s;
      showDashboard();
      return;
    }
  } catch {}
  showLogin();
}

function createSession(user) {
  session = { userId: user.id, username: user.username, nombre: user.nombre, role: user.role, loginTime: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function destroySession() {
  session = null;
  localStorage.removeItem(SESSION_KEY);
}

/* ═══════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════ */
function initLoginForm() {
  document.getElementById('form-login').addEventListener('submit', e => { e.preventDefault(); handleLogin(); });
  document.getElementById('pass-eye').addEventListener('click', () => {
    const inp = document.getElementById('l-pass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

function handleLogin() {
  const username = document.getElementById('l-user').value.trim();
  const password = document.getElementById('l-pass').value;
  const errEl    = document.getElementById('login-error');

  if (!username || !password) { errEl.textContent = 'Ingresa usuario y contraseña.'; return; }

  const user = usuarios.find(u => u.username === username && u.password === password && u.activo);
  if (!user) {
    errEl.textContent = 'Usuario o contraseña incorrectos.';
    document.getElementById('l-pass').value = '';
    document.getElementById('l-user').select();
    return;
  }

  errEl.textContent = '';
  createSession(user);
  showDashboard();
}

function showLogin() {
  document.getElementById('screen-login').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
  document.getElementById('login-error').textContent = '';
  setTimeout(() => document.getElementById('l-user').focus(), 100);
}

function showDashboard() {
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  setupSidebarUser();
  setupRoleNav();
  loadSection('eventos');
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR & NAVEGACIÓN
═══════════════════════════════════════════════════════════ */
function initSidebar() {
  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    destroySession();
    closeSidebarMobile();
    showLogin();
  });

  // Nav links
  document.getElementById('sidebar-nav').addEventListener('click', e => {
    const link = e.target.closest('[data-section]');
    if (!link) return;
    e.preventDefault();
    loadSection(link.dataset.section);
    closeSidebarMobile();
  });

  // Mobile toggle
  document.getElementById('topbar-toggle').addEventListener('click', openSidebarMobile);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebarMobile);
}

function openSidebarMobile() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}
function closeSidebarMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

function setupSidebarUser() {
  if (!session) return;
  const initial = (session.nombre || session.username)[0].toUpperCase();
  document.getElementById('user-avatar').textContent = initial;
  document.getElementById('user-name').textContent   = session.nombre || session.username;
  const badge = document.getElementById('user-badge');
  badge.textContent  = ROLES[session.role]?.label || session.role;
  badge.className    = `user-badge ${ROLES[session.role]?.userBadge || ''}`;
}

function setupRoleNav() {
  // El enlace de usuarios solo visible para admin y superadmin
  const navUsr = document.getElementById('nav-usuarios');
  if (navUsr) navUsr.style.display = canManageUsers() ? '' : 'none';
}

function loadSection(section) {
  currentSection = section;
  // Actualiza nav activo
  document.querySelectorAll('[data-section]').forEach(l => l.classList.toggle('active', l.dataset.section === section));
  document.getElementById('topbar-title').textContent = section === 'eventos' ? 'Eventos' : 'Usuarios';
  evFilter  = { search: '', status: 'all' };
  usrFilter = { search: '', role: 'all' };

  if (section === 'eventos') renderEventos();
  if (section === 'usuarios') {
    if (canManageUsers()) renderUsuarios();
    else { document.getElementById('content-area').innerHTML = `<div style="text-align:center;padding:60px;color:var(--dim)">No tienes permisos para ver esta sección.</div>`; }
  }
}

/* ═══════════════════════════════════════════════════════════
   PERMISOS
═══════════════════════════════════════════════════════════ */
function can(action) {
  if (!session) return false;
  const map = { superadmin: ['view','create','edit','delete'], admin: ['view','create','edit','delete'], usuario: ['view'] };
  return (map[session.role] || []).includes(action);
}
function canManageUsers() { return session && (session.role === 'superadmin' || session.role === 'admin'); }
function canDeleteUser(u)  { return session?.role === 'superadmin' || (session?.role === 'admin' && u.role !== 'superadmin'); }
function canEditUser(u)    { return session?.role === 'superadmin' || (session?.role === 'admin' && u.role !== 'superadmin'); }
function canSetRole(role)  { return session?.role === 'superadmin' || (session?.role === 'admin' && role !== 'superadmin'); }

/* ═══════════════════════════════════════════════════════════
   SECCIÓN: EVENTOS
═══════════════════════════════════════════════════════════ */
function renderEventos() {
  const total    = eventos.length;
  const activos  = eventos.filter(e => e.activo).length;

  // Topbar action
  const tr = document.getElementById('topbar-right');
  tr.innerHTML = can('create') ? `<button class="btn-primary" id="btn-new-ev">＋ Nuevo Evento</button>` : '';
  if (can('create')) document.getElementById('btn-new-ev').addEventListener('click', () => openEventModal(null));

  document.getElementById('content-area').innerHTML = `
    <div class="stats-row">
      <div class="stat-card">      <div class="stat-num">${total}</div>   <div class="stat-label">Total</div></div>
      <div class="stat-card green"><div class="stat-num">${activos}</div>  <div class="stat-label">Activos</div></div>
      <div class="stat-card red">  <div class="stat-num">${total-activos}</div><div class="stat-label">Inactivos</div></div>
    </div>
    <div class="section-filters">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input class="filter-input" id="ev-search" type="text" placeholder="Buscar evento...">
      </div>
      <div class="filter-tabs">
        <button class="ftab active" data-ev="all">Todos</button>
        <button class="ftab" data-ev="active">Activos</button>
        <button class="ftab" data-ev="inactive">Inactivos</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th>Evento</th><th>Fecha</th><th>Estado</th>
          ${can('edit')   ? '<th style="width:60px">Visible</th>' : ''}
          ${can('edit') || can('delete') ? '<th style="width:100px">Acciones</th>' : ''}
        </tr></thead>
        <tbody id="ev-tbody"></tbody>
      </table>
    </div>`;

  renderEvRows(getFilteredEventos());

  document.getElementById('ev-search').addEventListener('input', e => { evFilter.search = e.target.value.toLowerCase(); renderEvRows(getFilteredEventos()); });
  document.querySelectorAll('[data-ev]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-ev]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    evFilter.status = btn.dataset.ev;
    renderEvRows(getFilteredEventos());
  }));

  document.getElementById('ev-tbody').addEventListener('change', e => {
    if (e.target.classList.contains('ev-tog')) toggleEvActivo(+e.target.dataset.id);
  });
  document.getElementById('ev-tbody').addEventListener('click', e => {
    const edit = e.target.closest('.btn-edit-row');
    const del  = e.target.closest('.btn-delete-row');
    if (edit) openEventModal(+edit.dataset.id);
    if (del)  confirmAction(
      '¿Eliminar evento?',
      `Se eliminará permanentemente <strong>${escHtml(eventos.find(x => x.id === +del.dataset.id)?.titulo || '')}</strong>`,
      '🗑️',
      () => deleteEvento(+del.dataset.id)
    );
  });
}

function getFilteredEventos() {
  return eventos.filter(ev => {
    if (evFilter.status === 'active'   && !ev.activo) return false;
    if (evFilter.status === 'inactive' &&  ev.activo) return false;
    if (evFilter.search && !ev.titulo.toLowerCase().includes(evFilter.search)) return false;
    return true;
  });
}

function renderEvRows(list) {
  const tbody = document.getElementById('ev-tbody');
  if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No se encontraron eventos.</td></tr>`; return; }

  tbody.innerHTML = list.map(ev => `
    <tr>
      <td>
        <div class="ev-cell">
          <span class="ev-icon">${ev.icono || '📌'}</span>
          <div>
            <div class="ev-title">${escHtml(ev.titulo)}</div>
            ${ev.promocion ? `<div class="ev-promo">🏷️ ${escHtml(ev.promocion)}</div>` : ''}
          </div>
        </div>
      </td>
      <td><span class="date-cell">📅 ${fmtShort(ev.fecha)}</span></td>
      <td><span class="badge ${ev.activo ? 'badge-active' : 'badge-inactive'}">${ev.activo ? '● Activo' : '○ Inactivo'}</span></td>
      ${can('edit') ? `<td><label class="switch"><input type="checkbox" class="ev-tog" data-id="${ev.id}" ${ev.activo?'checked':''}><span class="slider"></span></label></td>` : ''}
      ${can('edit') || can('delete') ? `
      <td><div class="action-btns">
        ${can('edit')   ? `<button class="btn-icon-action btn-edit-row"   data-id="${ev.id}" title="Editar">✏️</button>` : ''}
        ${can('delete') ? `<button class="btn-icon-action btn-delete-row" data-id="${ev.id}" title="Eliminar">🗑️</button>` : ''}
      </div></td>` : ''}
    </tr>`).join('');
}

function toggleEvActivo(id) {
  const ev = eventos.find(e => e.id === id);
  if (!ev) return;
  ev.activo = !ev.activo;
  saveEventos();
  renderEvRows(getFilteredEventos());
  const total = eventos.length, activos = eventos.filter(e => e.activo).length;
  // Actualiza stats
  document.querySelectorAll('.stat-num')[0].textContent = total;
  document.querySelectorAll('.stat-num')[1].textContent = activos;
  document.querySelectorAll('.stat-num')[2].textContent = total - activos;
  showToast(ev.activo ? `✓ "${ev.titulo}" activado` : `✕ "${ev.titulo}" desactivado`, ev.activo ? 'ok' : '');
}

function deleteEvento(id) {
  const idx = eventos.findIndex(e => e.id === id);
  if (idx === -1) return;
  const titulo = eventos[idx].titulo;
  eventos.splice(idx, 1);
  saveEventos();
  renderEventos();
  showToast(`🗑️ "${titulo}" eliminado.`);
}

/* ═══════════════════════════════════════════════════════════
   SECCIÓN: USUARIOS
═══════════════════════════════════════════════════════════ */
function renderUsuarios() {
  const total  = usuarios.length;
  const byRole = r => usuarios.filter(u => u.role === r).length;

  const tr = document.getElementById('topbar-right');
  tr.innerHTML = `<button class="btn-primary" id="btn-new-usr">＋ Nuevo Usuario</button>`;
  document.getElementById('btn-new-usr').addEventListener('click', () => openUserModal(null));

  document.getElementById('content-area').innerHTML = `
    <div class="stats-row">
      <div class="stat-card">       <div class="stat-num">${total}</div>              <div class="stat-label">Total</div></div>
      <div class="stat-card amber"> <div class="stat-num">${byRole('superadmin')}</div><div class="stat-label">Superadmin</div></div>
      <div class="stat-card blue">  <div class="stat-num">${byRole('admin')}</div>    <div class="stat-label">Admin</div></div>
      <div class="stat-card">       <div class="stat-num">${byRole('usuario')}</div>  <div class="stat-label">Usuario</div></div>
    </div>
    <div class="section-filters">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input class="filter-input" id="usr-search" type="text" placeholder="Buscar usuario...">
      </div>
      <div class="filter-tabs">
        <button class="ftab active" data-ur="all">Todos</button>
        <button class="ftab" data-ur="superadmin">Superadmin</button>
        <button class="ftab" data-ur="admin">Admin</button>
        <button class="ftab" data-ur="usuario">Usuario</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th style="width:100px">Acciones</th>
        </tr></thead>
        <tbody id="usr-tbody"></tbody>
      </table>
    </div>`;

  renderUsrRows(getFilteredUsuarios());

  document.getElementById('usr-search').addEventListener('input', e => { usrFilter.search = e.target.value.toLowerCase(); renderUsrRows(getFilteredUsuarios()); });
  document.querySelectorAll('[data-ur]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-ur]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    usrFilter.role = btn.dataset.ur;
    renderUsrRows(getFilteredUsuarios());
  }));

  document.getElementById('usr-tbody').addEventListener('click', e => {
    const edit = e.target.closest('.btn-edit-row');
    const del  = e.target.closest('.btn-delete-row');
    if (edit) openUserModal(+edit.dataset.id);
    if (del) {
      const u = usuarios.find(x => x.id === +del.dataset.id);
      if (!u) return;
      confirmAction(
        '¿Eliminar usuario?',
        `Se eliminará permanentemente el usuario <strong>${escHtml(u.username)}</strong>. Esta acción no se puede deshacer.`,
        '👤',
        () => deleteUsuario(+del.dataset.id)
      );
    }
  });
}

function getFilteredUsuarios() {
  return usuarios.filter(u => {
    if (usrFilter.role !== 'all' && u.role !== usrFilter.role) return false;
    if (usrFilter.search && !u.username.toLowerCase().includes(usrFilter.search) && !u.nombre.toLowerCase().includes(usrFilter.search)) return false;
    return true;
  });
}

function renderUsrRows(list) {
  const tbody = document.getElementById('usr-tbody');
  if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No se encontraron usuarios.</td></tr>`; return; }

  tbody.innerHTML = list.map(u => {
    const isMe     = session?.userId === u.id;
    const canEdit  = canEditUser(u);
    const canDel   = canDeleteUser(u) && !isMe;
    return `
    <tr>
      <td><strong>${escHtml(u.username)}</strong>${isMe ? ' <span style="font-size:0.65rem;color:var(--dim)">(tú)</span>' : ''}</td>
      <td>${escHtml(u.nombre)}</td>
      <td><span class="badge badge-${u.role}">${ROLES[u.role]?.label || u.role}</span></td>
      <td><span class="badge ${u.activo ? 'badge-active' : 'badge-inactive'}">${u.activo ? '● Activo' : '○ Inactivo'}</span></td>
      <td><div class="action-btns">
        ${canEdit ? `<button class="btn-icon-action btn-edit-row"   data-id="${u.id}" title="Editar">✏️</button>` : ''}
        ${canDel  ? `<button class="btn-icon-action btn-delete-row" data-id="${u.id}" title="Eliminar">🗑️</button>` : ''}
      </div></td>
    </tr>`;
  }).join('');
}

function deleteUsuario(id) {
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return;
  const name = usuarios[idx].username;
  usuarios.splice(idx, 1);
  saveUsuarios();
  renderUsuarios();
  showToast(`🗑️ Usuario "${name}" eliminado.`);
}

/* ═══════════════════════════════════════════════════════════
   MODAL — EVENTO
═══════════════════════════════════════════════════════════ */
function openEventModal(id) {
  const ev       = id ? eventos.find(e => e.id === id) : null;
  const isEdit   = !!ev;
  const title    = isEdit ? '✏️ Editar Evento' : '➕ Nuevo Evento';

  document.getElementById('modal-inner').innerHTML = `
    <h3 class="modal-title">${title}</h3>
    <p class="modal-sub">${isEdit ? 'Modifica los datos del evento.' : 'Completa los campos para crear un nuevo evento.'}</p>
    <form id="form-ev" novalidate>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Ícono <span class="form-hint">(emoji)</span></label>
          <input class="form-input" id="fe-icono" type="text" maxlength="8" placeholder="📌" value="${escHtml(ev?.icono||'')}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha <span class="form-req">*</span></label>
          <input class="form-input" id="fe-fecha" type="date" required value="${ev?.fecha||new Date().toISOString().slice(0,10)}">
        </div>
        <div class="form-group form-full">
          <label class="form-label">Título <span class="form-req">*</span></label>
          <input class="form-input" id="fe-titulo" type="text" maxlength="60" required placeholder="Nombre del evento" value="${escHtml(ev?.titulo||'')}">
          <span class="form-error" id="fe-titulo-err"></span>
        </div>
        <div class="form-group form-full">
          <label class="form-label">Descripción corta</label>
          <input class="form-input" id="fe-desc" type="text" maxlength="120" placeholder="Breve descripción en la tarjeta" value="${escHtml(ev?.descripcion||'')}">
        </div>
        <div class="form-group form-full">
          <label class="form-label">Detalle</label>
          <textarea class="form-input form-textarea" id="fe-detalle" rows="3" placeholder="Descripción completa del modal...">${escHtml(ev?.detalle||'')}</textarea>
        </div>
        <div class="form-group form-full">
          <label class="form-label">Promoción</label>
          <input class="form-input" id="fe-promo" type="text" maxlength="80" placeholder="Ej: Hasta 40% OFF" value="${escHtml(ev?.promocion||'')}">
        </div>
        <div class="form-group form-full">
          <div class="form-toggle-row">
            <div class="toggle-info">
              <div class="toggle-lbl">Visible en el calendario</div>
              <div class="toggle-sub">Activa o desactiva este evento en el timeline público</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="fe-activo" ${(ev?.activo!==false)?'checked':''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="fe-cancel">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Guardar cambios' : 'Crear evento'}</button>
      </div>
    </form>`;

  openModal('modal-main');
  document.getElementById('fe-cancel').addEventListener('click', () => closeModal('modal-main'));
  document.getElementById('form-ev').addEventListener('submit', e => { e.preventDefault(); submitEventForm(id); });
  setTimeout(() => document.getElementById('fe-titulo').focus(), 80);
}

function submitEventForm(id) {
  const titulo = document.getElementById('fe-titulo').value.trim();
  const fecha  = document.getElementById('fe-fecha').value;
  const errEl  = document.getElementById('fe-titulo-err');
  errEl.textContent = '';

  if (!titulo) { errEl.textContent = 'El título es obligatorio.'; document.getElementById('fe-titulo').focus(); return; }
  if (!fecha)  { showToast('La fecha es obligatoria.', 'err'); return; }

  if (id) {
    // Editar existente
    const ev = eventos.find(e => e.id === id);
    if (!ev) return;
    ev.titulo      = titulo;
    ev.fecha       = fecha;
    ev.icono       = document.getElementById('fe-icono').value.trim()   || ev.icono;
    ev.descripcion = document.getElementById('fe-desc').value.trim();
    ev.detalle     = document.getElementById('fe-detalle').value.trim();
    ev.promocion   = document.getElementById('fe-promo').value.trim();
    ev.activo      = document.getElementById('fe-activo').checked;
  } else {
    // Nuevo
    const newId = eventos.length ? Math.max(...eventos.map(e => e.id)) + 1 : 1;
    eventos.push({
      id: newId, fecha, activo: document.getElementById('fe-activo').checked,
      titulo, icono: document.getElementById('fe-icono').value.trim() || '📌',
      descripcion: document.getElementById('fe-desc').value.trim(),
      detalle:     document.getElementById('fe-detalle').value.trim(),
      promocion:   document.getElementById('fe-promo').value.trim()
    });
    eventos.sort((a,b) => a.fecha.localeCompare(b.fecha));
  }

  saveEventos();
  closeModal('modal-main');
  renderEventos();
  showToast(id ? `✓ Evento "${titulo}" actualizado.` : `✓ Evento "${titulo}" creado.`, 'ok');
}

/* ═══════════════════════════════════════════════════════════
   MODAL — USUARIO
═══════════════════════════════════════════════════════════ */
function openUserModal(id) {
  const usr    = id ? usuarios.find(u => u.id === id) : null;
  const isEdit = !!usr;

  // Opciones de rol según permisos
  const roleOptions = Object.entries(ROLES)
    .filter(([r]) => session?.role === 'superadmin' || r !== 'superadmin')
    .map(([r, info]) => `<option value="${r}" ${usr?.role===r?'selected':''}>${info.label}</option>`)
    .join('');

  document.getElementById('modal-inner').innerHTML = `
    <h3 class="modal-title">${isEdit ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}</h3>
    <p class="modal-sub">${isEdit ? 'Modifica los datos del usuario.' : 'Completa los campos para crear un usuario.'}</p>
    <form id="form-usr" novalidate>
      <div class="form-grid">
        <div class="form-group form-full">
          <label class="form-label">Nombre completo <span class="form-req">*</span></label>
          <input class="form-input" id="fu-nombre" type="text" maxlength="60" required placeholder="Nombre del usuario" value="${escHtml(usr?.nombre||'')}">
          <span class="form-error" id="fu-nombre-err"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Usuario <span class="form-req">*</span></label>
          <input class="form-input" id="fu-username" type="text" maxlength="30" required placeholder="nombre_usuario" value="${escHtml(usr?.username||'')}" autocomplete="off">
          <span class="form-error" id="fu-username-err"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña ${isEdit ? '' : '<span class="form-req">*</span>'}</label>
          <div class="pass-wrap">
            <input class="form-input" id="fu-pass" type="password" placeholder="${isEdit ? 'Dejar en blanco para no cambiar' : 'Contraseña'}" autocomplete="new-password">
            <button type="button" class="pass-eye" id="fu-pass-eye" tabindex="-1">👁</button>
          </div>
          <span class="form-error" id="fu-pass-err"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Rol <span class="form-req">*</span></label>
          <select class="form-input form-select" id="fu-role">${roleOptions}</select>
        </div>
        <div class="form-group form-full">
          <div class="form-toggle-row">
            <div class="toggle-info">
              <div class="toggle-lbl">Usuario activo</div>
              <div class="toggle-sub">Los usuarios inactivos no pueden iniciar sesión</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="fu-activo" ${(usr?.activo!==false)?'checked':''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="fu-cancel">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Guardar cambios' : 'Crear usuario'}</button>
      </div>
    </form>`;

  openModal('modal-main');
  document.getElementById('fu-cancel').addEventListener('click', () => closeModal('modal-main'));
  document.getElementById('fu-pass-eye').addEventListener('click', () => {
    const inp = document.getElementById('fu-pass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('form-usr').addEventListener('submit', e => { e.preventDefault(); submitUserForm(id); });
  setTimeout(() => document.getElementById('fu-nombre').focus(), 80);
}

function submitUserForm(id) {
  const nombre    = document.getElementById('fu-nombre').value.trim();
  const username  = document.getElementById('fu-username').value.trim().toLowerCase();
  const password  = document.getElementById('fu-pass').value;
  const role      = document.getElementById('fu-role').value;
  const activo    = document.getElementById('fu-activo').checked;
  let valid = true;

  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

  if (!nombre)   { document.getElementById('fu-nombre-err').textContent   = 'El nombre es obligatorio.';   valid = false; }
  if (!username) { document.getElementById('fu-username-err').textContent = 'El usuario es obligatorio.';  valid = false; }
  if (!id && !password) { document.getElementById('fu-pass-err').textContent = 'La contraseña es obligatoria.'; valid = false; }

  // Username único
  if (username) {
    const dup = usuarios.find(u => u.username === username && u.id !== id);
    if (dup) { document.getElementById('fu-username-err').textContent = 'Ese nombre de usuario ya existe.'; valid = false; }
  }

  // Admin no puede asignar rol superadmin
  if (!canSetRole(role)) { showToast('No puedes asignar ese rol.', 'err'); return; }
  if (!valid) return;

  if (id) {
    const usr = usuarios.find(u => u.id === id);
    if (!usr) return;
    usr.nombre   = nombre;
    usr.username = username;
    usr.role     = role;
    usr.activo   = activo;
    if (password) usr.password = password;
    // Si el usuario editado es la sesión actual, actualiza la sesión
    if (session.userId === id) { session.nombre = nombre; session.role = role; localStorage.setItem(SESSION_KEY, JSON.stringify(session)); setupSidebarUser(); }
  } else {
    const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    usuarios.push({ id: newId, username, password, nombre, role, activo });
  }

  saveUsuarios();
  closeModal('modal-main');
  renderUsuarios();
  showToast(id ? `✓ Usuario "${username}" actualizado.` : `✓ Usuario "${username}" creado.`, 'ok');
}

/* ═══════════════════════════════════════════════════════════
   CONFIRM DIALOG
═══════════════════════════════════════════════════════════ */
function confirmAction(title, msg, icon, onConfirm) {
  document.getElementById('confirm-title').textContent  = title;
  document.getElementById('confirm-msg').innerHTML      = msg;
  document.getElementById('confirm-icon').textContent   = icon;
  confirmCb = onConfirm;
  openModal('modal-confirm');
}

/* ═══════════════════════════════════════════════════════════
   MODALES (helpers)
═══════════════════════════════════════════════════════════ */
function initModals() {
  document.getElementById('modal-close').addEventListener('click',  () => closeModal('modal-main'));
  document.getElementById('modal-main').addEventListener('click',   e => { if (e.target.id === 'modal-main')    closeModal('modal-main'); });
  document.getElementById('modal-confirm').addEventListener('click',e => { if (e.target.id === 'modal-confirm') closeModal('modal-confirm'); });
  document.getElementById('confirm-no').addEventListener('click',   () => closeModal('modal-confirm'));
  document.getElementById('confirm-yes').addEventListener('click',  () => {
    closeModal('modal-confirm');
    if (confirmCb) { confirmCb(); confirmCb = null; }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('modal-main').classList.contains('open'))    closeModal('modal-main');
    else if (document.getElementById('modal-confirm').classList.contains('open')) closeModal('modal-confirm');
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════════════════ */
function parseDate(str) { const [y,m,d] = str.split('-').map(Number); return new Date(y, m-1, d); }
function fmtShort(str)  { return parseDate(str).toLocaleDateString('es-CL', { day:'numeric', month:'long' }); }
function escHtml(s)     { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

let toastTimer = null;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast show${type === 'ok' ? ' toast-ok' : type === 'err' ? ' toast-err' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 4000);
}
