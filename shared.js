// ── SUPABASE CONFIG ──
// Lee desde config.js (window.SUPABASE_*) si está cargado; si no, usa fallback hardcodeado.
// IMPORTANTE: cargar <script src="config.js"> ANTES de <script src="shared.js"> en cada HTML.
var SB_URL   = window.SUPABASE_URL      || 'https://npatcmgjqxpjxhbcqsqv.supabase.co';
var ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wYXRjbWdqcXhwanhoYmNxc3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTEzNDUsImV4cCI6MjA5Mjg2NzM0NX0.uDyUMvouWcPlbNOiPClNYezkKIE9ICAEpWZxklUdGZg';
var SURL = SB_URL;    // alias para secciones type="text/babel"
var SKEY = ANON_KEY;  // alias para secciones type="text/babel"

// ── SESIÓN ──
function getSession() {
  return JSON.parse(sessionStorage.getItem('mars_portal_session') || 'null');
}

function saveSession(rol, nombre, username, access_token, refresh_token, expires_in) {
  sessionStorage.setItem('mars_portal_session', JSON.stringify({
    rol: rol,
    nombre: nombre,
    username: username,
    access_token: access_token || null,
    refresh_token: refresh_token || null,
    ts: Date.now(),
    expires_at: access_token
      ? Date.now() + ((expires_in || 3600) * 1000)
      : Date.now() + (24 * 60 * 60 * 1000)
  }));
}

function clearSession() {
  sessionStorage.removeItem('mars_portal_session');
}

// ── SUPABASE HELPERS (admin) ──
async function sbGet(endpoint) {
  var token = window.MARS_TOKEN || ANON_KEY;
  const r = await fetch(SB_URL + '/rest/v1' + endpoint, {
    headers: { 'Authorization': 'Bearer ' + token, 'apikey': ANON_KEY }
  });
  const t = await r.text();
  if (!r.ok) { console.error('[sbGet]', endpoint, r.status, t); return []; }
  return t ? JSON.parse(t) : [];
}

async function sbUpsert(table, data) {
  var token = window.MARS_TOKEN || ANON_KEY;
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?on_conflict=clave', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'apikey': ANON_KEY,
               'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(data)
  });
  if (!r.ok) { const err = await r.text(); throw new Error('Supabase ' + r.status + ': ' + err.substring(0, 200)); }
}

async function sbAdmin(method, ep, body) {
  var s = getSession() || {};
  var token = (s.access_token && s.expires_at && s.expires_at > Date.now()) ? s.access_token : ANON_KEY;
  var opts = { method: method, headers: { 'Authorization': 'Bearer ' + token, 'apikey': ANON_KEY, 'Content-Type': 'application/json', 'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal' } };
  if (body) opts.body = JSON.stringify(body);
  var r = await fetch(SB_URL + '/rest/v1' + ep, opts);
  var t = await r.text();
  if (!r.ok) { console.error('[sbAdmin]', method, ep, r.status, t); return []; }
  return t ? JSON.parse(t) : [];
}
