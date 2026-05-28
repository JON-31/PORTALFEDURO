// ── SUPABASE CONFIG ──
// Las credenciales deben estar en config.js, cargado ANTES que este script.
if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
  document.body.innerHTML = '<div style="font-family:sans-serif;padding:40px;color:#c00"><h2>Error de configuración</h2><p>config.js no encontrado o vacío.<br>Copia <b>config.example.js</b> como <b>config.js</b> y completa las credenciales.</p></div>';
  throw new Error('Faltan credenciales en config.js');
}
var SB_URL   = window.SUPABASE_URL;
var ANON_KEY = window.SUPABASE_ANON_KEY;
var SURL = SB_URL;    // alias para secciones type="text/babel"
var SKEY = ANON_KEY;  // alias para secciones type="text/babel"

// ── SESIÓN ──
function getSession() {
  return JSON.parse(sessionStorage.getItem('mars_portal_session') || 'null');
}

function saveSession(rol, nombre, username, access_token, refresh_token, expires_in) {
  sessionStorage.setItem('mars_portal_session', JSON.stringify({
    rol:           rol,
    nombre:        nombre,
    username:      username,
    access_token:  access_token  || null,
    refresh_token: refresh_token || null,
    ts:            Date.now(),
    // Todos los roles reciben JWT desde Supabase Auth.
    // expires_in viene en segundos; fallback a 1h si no se provee.
    expires_at:    Date.now() + ((expires_in || 3600) * 1000)
  }));
}

function clearSession() {
  sessionStorage.removeItem('mars_portal_session');
}

// Renueva el access_token si quedan menos de 5 minutos de sesión.
// Llámala al inicio de cada portal antes de cargar datos.
async function refreshSession() {
  var s = getSession();
  if (!s || !s.refresh_token) return;
  if (s.expires_at - Date.now() > 5 * 60 * 1000) return;
  try {
    var r = await fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    });
    if (!r.ok) { console.error('[refreshSession] HTTP', r.status, await r.text()); return; }
    var data = await r.json();
    if (data.access_token) {
      saveSession(s.rol, s.nombre, s.username, data.access_token, data.refresh_token || s.refresh_token, data.expires_in);
    }
  } catch(e) {
    console.error('[refreshSession]', e);
  }
}

// ── SUPABASE HELPERS ──
async function sbGet(endpoint) {
  var s = getSession();
  var token = (s && s.access_token) ? s.access_token : ANON_KEY;
  const r = await fetch(SB_URL + '/rest/v1' + endpoint, {
    headers: { 'Authorization': 'Bearer ' + token, 'apikey': ANON_KEY }
  });
  const t = await r.text();
  if (!r.ok) { console.error('[sbGet]', endpoint, r.status, t); return []; }
  return t ? JSON.parse(t) : [];
}

async function sbUpsert(table, data) {
  var s = getSession();
  var token = (s && s.access_token) ? s.access_token : ANON_KEY;
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?on_conflict=clave', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'apikey': ANON_KEY,
               'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(data)
  });
  if (!r.ok) { const err = await r.text(); throw new Error('Supabase ' + r.status + ': ' + err.substring(0, 200)); }
}

// Usa siempre el JWT de la sesión activa. Lanza error si no hay sesión.
async function sbAdmin(method, ep, body) {
  var s = getSession();
  if (!s || !s.access_token) throw new Error('[sbAdmin] Sesión inválida o expirada. Vuelve a iniciar sesión.');
  var opts = { method: method, headers: { 'Authorization': 'Bearer ' + s.access_token, 'apikey': ANON_KEY, 'Content-Type': 'application/json', 'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal' } };
  if (body) opts.body = JSON.stringify(body);
  var r = await fetch(SB_URL + '/rest/v1' + ep, opts);
  var t = await r.text();
  if (!r.ok) { console.error('[sbAdmin]', method, ep, r.status, t); return []; }
  return t ? JSON.parse(t) : [];
}
