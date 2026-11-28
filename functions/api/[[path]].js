// Madbout lesson platform API (Cloudflare Pages Functions + D1 + optional R2)
// Routes:
//   GET  /api/me                      current account
//   POST /api/register | /api/login   {email,password}
//   POST /api/logout
//   GET  /api/doc?p=path              read a document
//   PUT  /api/doc?p=path              write a document (JSON object body)
//   DELETE /api/doc?p=path
//   GET  /api/list?c=collection       list documents in a collection
//   POST /api/billing/demo            {plan,cycle} demo subscription (only when DEMO_PAYMENTS=true)
//   POST /api/billing/cancel          stop auto-renew
//   GET|POST|DELETE /api/files        admin images in R2 (binding FILES)
//   GET  /api/file/<key>              serve an uploaded image
//   /api/ai/*                         AI educational generator (see lib/ai/service.js)
//
// Access rules (mirror the in-Claude version):
//   data/users/<uid>/...   only that teacher
//   teachers/<uid>         that teacher or an admin; plan fields are written by the server or an admin only
//   catalog/*, config/*    everyone reads, admins write

import { handleAI } from '../../lib/ai/service.js';

const JSONH = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...JSONH, ...extra } });
const err = (code, status) => json({ error: code }, status);
const SEG = /^[\w.\-~:@+]{1,200}$/;
const PROTECTED = ['plan', 'until', 'planOverride', 'blocked', 'payments', 'auto', 'cycle'];
const PLAN_PRICES = { basic: { m: 15, y: 99 }, pro: { m: 25, y: 199 } };
const MAX_DOC = 1_000_000;

export async function onRequest(ctx) {
  const { request, env, params } = ctx;
  const path = '/' + [].concat(params.path || []).join('/');
  const url = new URL(request.url);
  const m = request.method;
  if (!env.DB) return err('db_not_bound', 500);
  try {
    if (path.startsWith('/file/') && m === 'GET') return serveFile(env, path.slice(6));
    const me = await currentUser(request, env);
    if (path === '/me' && m === 'GET') return me ? json(pub(me, env)) : err('auth', 401);
    if (path === '/register' && m === 'POST') return register(request, env);
    if (path === '/login' && m === 'POST') return login(request, env);
    if (path === '/logout' && m === 'POST') return logout(request, env);
    if (path === '/doc') {
      const p = url.searchParams.get('p') || '';
      const segs = splitPath(p, 'doc'); if (!segs) return err('bad_path', 400);
      if (m === 'GET') {
        if (!canRead(segs, me, env)) return json({ data: null });
        const row = await env.DB.prepare('SELECT data FROM docs WHERE path=?').bind(p).first();
        return json({ data: row ? JSON.parse(row.data) : null });
      }
      if (m === 'PUT') {
        if (!canWrite(segs, me, env)) return err('forbidden', 403);
        const text = await request.text();
        if (text.length > MAX_DOC) return err('too_large', 413);
        let body; try { body = JSON.parse(text); } catch { return err('bad_json', 400); }
        if (!body || typeof body !== 'object' || Array.isArray(body)) return err('bad_json', 400);
        if (segs[0] === 'teachers' && !isAdmin(me, env)) {
          const old = await env.DB.prepare('SELECT data FROM docs WHERE path=?').bind(p).first();
          const prev = old ? JSON.parse(old.data) : {};
          for (const k of PROTECTED) { if (k in prev) body[k] = prev[k]; else delete body[k]; }
        }
        await putDoc(env, p, segs, body);
        return json({ ok: true });
      }
      if (m === 'DELETE') {
        if (!canWrite(segs, me, env)) return err('forbidden', 403);
        await env.DB.prepare('DELETE FROM docs WHERE path=?').bind(p).run();
        return json({ ok: true });
      }
    }
    if (path === '/list' && m === 'GET') {
      const c = url.searchParams.get('c') || '';
      const segs = splitPath(c, 'coll'); if (!segs) return err('bad_path', 400);
      if (!canList(segs, me, env)) return json({ docs: [] });
      const rs = await env.DB.prepare('SELECT path,data FROM docs WHERE coll=? ORDER BY path LIMIT 2000').bind(c).all();
      return json({ docs: (rs.results || []).map(r => ({ id: r.path.split('/').pop(), data: JSON.parse(r.data) })) });
    }
    if (path === '/billing/demo' && m === 'POST') {
      if (!me) return err('auth', 401);
      if (String(env.DEMO_PAYMENTS) !== 'true') return err('payments_off', 403);
      const { plan, cycle } = await request.json().catch(() => ({}));
      if (!PLAN_PRICES[plan] || !['m', 'y'].includes(cycle)) return err('bad_plan', 400);
      const p = 'teachers/' + me.id, segs = p.split('/');
      const old = await env.DB.prepare('SELECT data FROM docs WHERE path=?').bind(p).first();
      const reg = old ? JSON.parse(old.data) : { joined: today() };
      const base = PLAN_PRICES[plan][cycle], vat = Math.round(base * 15) / 100;
      reg.plan = plan; reg.cycle = cycle; reg.auto = true; reg.until = addDays(cycle === 'y' ? 365 : 30);
      reg.payments = [{ id: 'INV-' + Date.now().toString(36).toUpperCase(), date: today(), plan, cycle, amount: Math.round((base + vat) * 100) / 100, vat, status: 'تجريبي' }, ...(reg.payments || [])].slice(0, 50);
      await putDoc(env, p, segs, reg);
      return json(reg);
    }
    if (path === '/billing/cancel' && m === 'POST') {
      if (!me) return err('auth', 401);
      const p = 'teachers/' + me.id;
      const old = await env.DB.prepare('SELECT data FROM docs WHERE path=?').bind(p).first();
      if (!old) return err('not_found', 404);
      const reg = JSON.parse(old.data); reg.auto = false;
      await putDoc(env, p, p.split('/'), reg);
      return json(reg);
    }
    if (path.startsWith('/ai/')) {
      if (m !== 'GET' && !(request.headers.get('content-type') || '').includes('application/json')) return err('bad_type', 415);
      try { return await handleAI(request, env, me, path.slice(3), isAdmin(me, env)); }
      catch (e) { if (/no such table/i.test(String(e && e.message))) return err('ai_not_migrated', 503); throw e; }
    }
    if (path === '/files') {
      if (!isAdmin(me, env)) return err('forbidden', 403);
      if (!env.FILES) return err('files_not_bound', 501);
      if (m === 'GET') {
        const l = await env.FILES.list({ limit: 500 });
        return json({ files: l.objects.map(o => ({ id: o.key, url: '/api/file/' + o.key, contentType: (o.httpMetadata && o.httpMetadata.contentType) || 'image/*', sizeBytes: o.size })) });
      }
      if (m === 'POST') {
        const type = request.headers.get('content-type') || '';
        if (!/^image\/(png|jpe?g|webp|gif)$/.test(type)) return err('only_images', 415);
        const buf = await request.arrayBuffer();
        if (buf.byteLength > 5_000_000) return err('too_large', 413);
        const key = crypto.randomUUID().replace(/-/g, '') + '.' + type.split('/')[1].replace('jpeg', 'jpg');
        await env.FILES.put(key, buf, { httpMetadata: { contentType: type } });
        return json({ id: key, url: '/api/file/' + key, contentType: type });
      }
      if (m === 'DELETE') {
        const k = url.searchParams.get('k') || '';
        if (!/^[\w.-]+$/.test(k)) return err('bad_key', 400);
        await env.FILES.delete(k); return json({ ok: true });
      }
    }
    return err('not_found', 404);
  } catch (e) {
    return err('server_error', 500);
  }
}

/* ---------- documents ---------- */
function splitPath(p, kind) {
  const s = String(p).split('/');
  if (!s.length || s.length > 16 || p.length > 1000 || !s.every(x => SEG.test(x) && x !== '.' && x !== '..')) return null;
  if (kind === 'doc' && s.length % 2) return null;
  if (kind === 'coll' && !(s.length % 2)) return null;
  return s;
}
const isAdmin = (me, env) => !!me && adminEmails(env).includes(me.email);
const adminEmails = env => String(env.ADMIN_EMAILS || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
function canRead(s, me, env) {
  if (s[0] === 'catalog' || s[0] === 'config') return true;
  if (s[0] === 'data' && s[1] === 'users') return !!me && s[2] === me.id;
  if (s[0] === 'teachers') return !!me && (isAdmin(me, env) || s[1] === me.id);
  return false;
}
function canWrite(s, me, env) {
  if (!me) return false;
  if (s[0] === 'catalog' || s[0] === 'config') return isAdmin(me, env);
  if (s[0] === 'data' && s[1] === 'users') return s[2] === me.id && s.length >= 4;
  if (s[0] === 'teachers') return s.length === 2 && (isAdmin(me, env) || s[1] === me.id);
  return false;
}
function canList(s, me, env) {
  if (s[0] === 'catalog' || s[0] === 'config') return true;
  if (s[0] === 'data' && s[1] === 'users') return !!me && s[2] === me.id;
  if (s[0] === 'teachers') return isAdmin(me, env);
  return false;
}
async function putDoc(env, p, segs, body) {
  await env.DB.prepare('INSERT INTO docs(path,coll,data,updated) VALUES(?,?,?,?) ON CONFLICT(path) DO UPDATE SET data=excluded.data,updated=excluded.updated')
    .bind(p, segs.slice(0, -1).join('/'), JSON.stringify(body), new Date().toISOString()).run();
}

/* ---------- accounts ---------- */
const pub = (u, env) => ({ uid: u.id, email: u.email, admin: isAdmin(u, env) });
function cookie(req, name) { const c = req.headers.get('cookie') || ''; const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? m[1] : null; }
async function currentUser(req, env) {
  const t = cookie(req, 'sid'); if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  const row = await env.DB.prepare('SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=? AND s.expires>?').bind(await sha256(t), Date.now()).first();
  return row || null;
}
async function register(req, env) {
  const { email, password } = await req.json().catch(() => ({}));
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 200) return err('bad_email', 400);
  if (String(password || '').length < 8 || String(password).length > 200) return err('weak_password', 400);
  if (await env.DB.prepare('SELECT 1 FROM users WHERE email=?').bind(e).first()) return err('exists', 409);
  const id = 'u' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await env.DB.prepare('INSERT INTO users(id,email,pass,created) VALUES(?,?,?,?)').bind(id, e, await hashPass(password), new Date().toISOString()).run();
  return startSession(env, { id, email: e });
}
async function login(req, env) {
  const { email, password } = await req.json().catch(() => ({}));
  const e = String(email || '').trim().toLowerCase();
  const key = 'login:' + e, now = Date.now();
  const lim = await env.DB.prepare('SELECT n,since FROM limits WHERE k=?').bind(key).first();
  if (lim && lim.n >= 8 && now - lim.since < 15 * 60_000) return err('too_many', 429);
  const u = await env.DB.prepare('SELECT id,email,pass FROM users WHERE email=?').bind(e).first();
  if (!u || !(await checkPass(String(password || ''), u.pass))) {
    const fresh = !lim || now - lim.since >= 15 * 60_000;
    await env.DB.prepare('INSERT INTO limits(k,n,since) VALUES(?,1,?) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN ? THEN 1 ELSE n+1 END, since=CASE WHEN ? THEN ? ELSE since END')
      .bind(key, now, fresh ? 1 : 0, fresh ? 1 : 0, now).run();
    return err('bad_login', 401);
  }
  await env.DB.prepare('DELETE FROM limits WHERE k=?').bind(key).run();
  return startSession(env, u);
}
async function startSession(env, u) {
  const raw = new Uint8Array(32); crypto.getRandomValues(raw);
  const t = [...raw].map(b => b.toString(16).padStart(2, '0')).join('');
  const days = 30;
  await env.DB.prepare('INSERT INTO sessions(token,uid,expires) VALUES(?,?,?)').bind(await sha256(t), u.id, Date.now() + days * 864e5).run();
  return json(pub(u, env), 200, { 'set-cookie': `sid=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${days * 86400}` });
}
async function logout(req, env) {
  const t = cookie(req, 'sid');
  if (t && /^[a-f0-9]{64}$/.test(t)) await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(await sha256(t)).run();
  return json({ ok: true }, 200, { 'set-cookie': 'sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' });
}
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function sha256(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function pbkdf2(pw, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, k, 256);
}
async function hashPass(pw) { const salt = new Uint8Array(16); crypto.getRandomValues(salt); return 'p1$' + b64(salt) + '$' + b64(await pbkdf2(pw, salt)); }
async function checkPass(pw, stored) {
  const [v, s, h] = String(stored).split('$'); if (v !== 'p1') return false;
  const a = new Uint8Array(await pbkdf2(pw, unb64(s))), b = unb64(h);
  if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0;
}

/* ---------- files ---------- */
async function serveFile(env, key) {
  if (!env.FILES || !/^[\w.-]+$/.test(key)) return err('not_found', 404);
  const o = await env.FILES.get(key); if (!o) return err('not_found', 404);
  return new Response(o.body, { headers: { 'content-type': (o.httpMetadata && o.httpMetadata.contentType) || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
}
const today = () => new Date().toISOString().slice(0, 10);
const addDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
