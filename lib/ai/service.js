// AI routes for /api/ai/*. Called from functions/api/[[path]].js with the signed-in user.
//   GET  /api/ai/status                 quotas left today, enabled modules, notice
//   POST /api/ai/generate   {module, input}
//   POST /api/ai/regen      {module, part, input, current}
//   GET  /api/ai/admin/stats            admin: usage, failures, provider status
//   GET|PUT /api/ai/admin/config        admin: quotas, enable/disable, provider/model
//   GET|PUT /api/ai/admin/user?email=   admin: per-teacher limits / block
//   POST /api/ai/admin/test             admin: one tiny provider call
// Privacy: prompts and generated content are never stored on the server. The usage log keeps only
// who/when/which module/status/error code/token counts. Teachers save results to their own library.
import { MODULE_IDS, loadConfig, normalizeConfig, ksaDay, nextReset } from './config.js';
import { AIError, runProvider, providerCatalog } from './providers.js';
import { validateInput, buildPrompt, buildRegenPrompt, normalize, normalizePart, parseJSON, PARTS, STAGES, GAME_KIND } from './modules.js';

const JSONH = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: JSONH });
const fail = (code, s, extra = {}) => json({ error: code, ...extra }, s);
const PENDING_MS = 3 * 60_000;     // a reservation older than this no longer blocks or counts (crashed request)
const BURST_MS = 10 * 60_000;
const MAX_BODY = 20_000;

const MSG = {
  provider_quota: 'نفدت حصة مزوّد الذكاء الاصطناعي المجانية لليوم. جرّبي غدًا.',
  rate_limited: 'المساعد مشغول الآن بطلبات كثيرة. جرّبي بعد دقيقة.',
  provider_down: 'تعذّر الوصول إلى خدمة الذكاء الاصطناعي. جرّبي بعد قليل.',
  timeout: 'استغرق التوليد وقتًا أطول من المعتاد. جرّبي مرة أخرى بعدد أقل.',
  bad_output: 'لم يخرج المحتوى بصيغة صحيحة. جرّبي مرة أخرى.',
  blocked: 'رفضت الخدمة هذا الطلب. راجعي عنوان الدرس والملاحظات.',
  off_topic: 'يبدو أن الطلب ليس موضوعًا تعليميًا. اكتبي عنوان درس واضحًا.',
  not_configured: 'المساعد غير مفعّل بعد على المنصة.',
  model_unavailable: 'نموذج الذكاء الاصطناعي المحدد غير متاح. أبلغي الإدارة.',
  bad_key: 'مفتاح Gemini غير صالح. على الإدارة التحقق من GEMINI_API_KEY في Cloudflare.',
  region: 'خدمة Gemini غير متاحة من موقع الخادم الحالي. أبلغي الإدارة.',
  bad_request: 'رفض المزوّد الطلب. أبلغي الإدارة لتجرّب «اختبري الاتصال».'
};

export async function handleAI(request, env, me, sub, isAdmin, fetchImpl) {
  const m = request.method, url = new URL(request.url);
  if (!me) return fail('auth', 401);
  const cfg = await loadConfig(env);
  if (sub === '/status' && m === 'GET') return json(await status(env, cfg, me));
  if ((sub === '/generate' || sub === '/regen') && m === 'POST') return generate(request, env, cfg, me, sub === '/regen', fetchImpl);
  if (sub.startsWith('/admin/')) {
    if (!isAdmin) return fail('forbidden', 403);
    if (sub === '/admin/stats' && m === 'GET') return json(await stats(env, cfg));
    if (sub === '/admin/config' && m === 'GET') return json({ config: cfg, providers: providerCatalog(env) });
    if (sub === '/admin/config' && m === 'PUT') {
      const body = await readBody(request); if (!body) return fail('bad_json', 400);
      const next = normalizeConfig(body);
      await env.DB.prepare('INSERT INTO docs(path,coll,data,updated) VALUES(?,?,?,?) ON CONFLICT(path) DO UPDATE SET data=excluded.data,updated=excluded.updated').bind('config/ai', 'config', JSON.stringify(next), new Date().toISOString()).run();
      return json({ config: next });
    }
    if (sub === '/admin/user') return adminUser(request, env, url, m);
    if (sub === '/admin/test' && m === 'POST') {
      const t0 = Date.now();
      try {
        const r = await runProvider(env, cfg, { system: 'Reply with JSON only.', user: 'Return {"ok":true}', maxTokens: 50, temperature: 0, timeoutMs: 20000 }, fetchImpl);
        await log(env, { uid: me.id, module: 'test', kind: 'test', status: 'ok', provider: r.provider, model: r.model, tin: r.usage.in, tout: r.usage.out, ms: Date.now() - t0 });
        return json({ ok: true, provider: r.provider, model: r.model, ms: Date.now() - t0 });
      } catch (e) {
        const code = e instanceof AIError ? e.code : 'provider_down';
        await log(env, { uid: me.id, module: 'test', kind: 'test', status: 'fail', err: code, ms: Date.now() - t0 });
        return json({ ok: false, error: code, detail: e && e.detail ? String(e.detail).slice(0, 160) : '' });
      }
    }
  }
  return fail('not_found', 404);
}

async function readBody(req) {
  const t = await req.text(); if (t.length > MAX_BODY) return null;
  try { const b = JSON.parse(t); return b && typeof b === 'object' && !Array.isArray(b) ? b : null; } catch { return null; }
}
async function userLimits(env, uid) {
  const r = await env.DB.prepare('SELECT data FROM ai_user_limits WHERE uid=?').bind(uid).first();
  try { return r ? JSON.parse(r.data) : {}; } catch { return {}; }
}
const quotaFor = (cfg, ul, bucket) => ul && ul.quotas && Number.isFinite(+ul.quotas[bucket]) && ul.quotas[bucket] !== '' && ul.quotas[bucket] != null ? Math.max(0, Math.min(200, +ul.quotas[bucket] | 0)) : cfg.quotas[bucket];

async function status(env, cfg, me) {
  const day = ksaDay(), since = Date.now() - PENDING_MS;
  const ul = await userLimits(env, me.id);
  const rs = await env.DB.prepare(`SELECT bucket, COUNT(*) n FROM ai_usage WHERE uid=? AND day=? AND (status='ok' OR (status='pending' AND created>?)) GROUP BY bucket`).bind(me.id, day, since).all();
  const used = Object.fromEntries((rs.results || []).map(r => [r.bucket, r.n]));
  const g = await env.DB.prepare(`SELECT COUNT(*) n FROM ai_usage WHERE day=? AND kind!='test' AND (status='ok' OR (status='pending' AND created>?))`).bind(day, since).first();
  const cool = await cooldown(env);
  const anyKey = Object.values(providerCatalog(env)).some(p => p.configured);
  const reason = !anyKey ? 'not_configured' : !cfg.enabled ? 'disabled' : ul.blocked ? 'blocked' : cool ? 'cooldown' : cfg.globalDaily && g.n >= cfg.globalDaily ? 'global_cap' : '';
  const mod = b => ({ limit: quotaFor(cfg, ul, b), used: used[b] | 0, left: Math.max(0, quotaFor(cfg, ul, b) - (used[b] | 0)) });
  return {
    available: !reason, reason, notice: cfg.notice, resetAt: nextReset(), cooldownUntil: cool || null,
    modules: Object.fromEntries(MODULE_IDS.map(k => [k, { ...mod(k), enabled: cfg.modules[k] }])),
    regen: mod('regen'), stages: STAGES, gameTypes: Object.keys(GAME_KIND), parts: PARTS
  };
}

async function cooldown(env) {
  const r = await env.DB.prepare('SELECT n FROM limits WHERE k=?').bind('ai:cooldown').first();
  return r && r.n > Date.now() ? new Date(r.n).toISOString() : '';
}
async function setCooldown(env, ms) {
  await env.DB.prepare('INSERT INTO limits(k,n,since) VALUES(?,?,?) ON CONFLICT(k) DO UPDATE SET n=MAX(n,excluded.n),since=excluded.since').bind('ai:cooldown', Date.now() + ms, Date.now()).run();
}

async function log(env, r) {
  await env.DB.prepare('INSERT INTO ai_usage(id,uid,module,kind,bucket,day,status,err,provider,model,tin,tout,ms,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), r.uid, r.module, r.kind, r.bucket || r.module, ksaDay(), r.status, r.err || '', r.provider || '', r.model || '', r.tin | 0, r.tout | 0, r.ms | 0, Date.now()).run();
}

// Atomically reserves one generation. One SQL statement = one serialized write in D1, so parallel
// requests or page refreshes cannot slip past the quota, the one-at-a-time rule, the burst limit or the daily cap.
async function reserve(env, cfg, me, module, kind, bucket, limit) {
  const id = crypto.randomUUID(), now = Date.now(), day = ksaDay(now), live = now - PENDING_MS;
  const r = await env.DB.prepare(`INSERT INTO ai_usage(id,uid,module,kind,bucket,day,status,err,provider,model,tin,tout,ms,created)
    SELECT ?,?,?,?,?,?,'pending','','','',0,0,0,? WHERE
      (SELECT COUNT(*) FROM ai_usage WHERE uid=? AND day=? AND bucket=? AND (status='ok' OR (status='pending' AND created>?))) < ?
      AND (SELECT COUNT(*) FROM ai_usage WHERE uid=? AND status='pending' AND created>?) = 0
      AND (SELECT COUNT(*) FROM ai_usage WHERE uid=? AND created>? AND kind!='test') < ?
      AND (? = 0 OR (SELECT COUNT(*) FROM ai_usage WHERE day=? AND kind!='test' AND (status='ok' OR (status='pending' AND created>?))) < ?)`)
    .bind(id, me.id, module, kind, bucket, day, now, me.id, day, bucket, live, limit, me.id, live, me.id, now - BURST_MS, cfg.burst, cfg.globalDaily, day, live, cfg.globalDaily).run();
  if (r.meta && r.meta.changes === 1) return { id };
  // Work out which rule refused, for a clear message.
  const q = (sql, ...b) => env.DB.prepare(sql).bind(...b).first().then(x => x.n);
  if (await q(`SELECT COUNT(*) n FROM ai_usage WHERE uid=? AND status='pending' AND created>?`, me.id, live)) return { refused: 'busy' };
  if (await q(`SELECT COUNT(*) n FROM ai_usage WHERE uid=? AND day=? AND bucket=? AND (status='ok' OR (status='pending' AND created>?))`, me.id, day, bucket, live) >= limit) return { refused: 'quota' };
  if (await q(`SELECT COUNT(*) n FROM ai_usage WHERE uid=? AND created>? AND kind!='test'`, me.id, now - BURST_MS) >= cfg.burst) return { refused: 'too_fast' };
  return { refused: 'global_cap' };
}

async function generate(request, env, cfg, me, isRegen, fetchImpl) {
  const body = await readBody(request);
  if (!body) return fail('bad_json', 400);
  const module = String(body.module || '');
  if (!MODULE_IDS.includes(module)) return fail('bad_input', 400, { field: 'module' });
  if (!Object.values(providerCatalog(env)).some(p => p.configured)) return fail('not_configured', 503, { message: MSG.not_configured });
  if (!cfg.enabled || !cfg.modules[module]) return fail('disabled', 503, { message: cfg.notice || 'المساعد متوقف مؤقتًا من الإدارة.' });
  const ul = await userLimits(env, me.id);
  if (ul.blocked) return fail('blocked_user', 403, { message: 'تم إيقاف المساعد لهذا الحساب. تواصلي مع الإدارة.' });
  const reg = await env.DB.prepare('SELECT data FROM docs WHERE path=?').bind('teachers/' + me.id).first();
  try { if (reg && JSON.parse(reg.data).blocked) return fail('blocked_user', 403, { message: 'الحساب موقوف.' }); } catch { }
  if (cfg.minAccountMinutes) {
    const u = await env.DB.prepare('SELECT created FROM users WHERE id=?').bind(me.id).first();
    if (u && Date.now() - Date.parse(u.created) < cfg.minAccountMinutes * 60_000) return fail('too_new', 403, { message: 'يتاح المساعد بعد وقت قصير من إنشاء الحساب.' });
  }
  const cool = await cooldown(env);
  if (cool) return fail('cooldown', 429, { message: MSG.rate_limited, until: cool });

  let inp, prompt, part = '';
  try {
    inp = validateInput(module, body.input);
    if (isRegen) { part = String(body.part || ''); prompt = buildRegenPrompt(module, part, inp, body.current); }
    else prompt = buildPrompt(module, inp);
  } catch (e) { return fail('bad_input', 400, { field: e.detail || '' }); }

  const bucket = isRegen ? 'regen' : module;
  const res = await reserve(env, cfg, me, module, isRegen ? 'regen' : 'gen', bucket, quotaFor(cfg, ul, bucket));
  if (res.refused) {
    const msgs = { busy: 'لديك طلب قيد التوليد. انتظري حتى ينتهي.', quota: 'انتهت حصتك اليومية لهذا النوع. تتجدد الحصة منتصف الليل.', too_fast: 'طلبات كثيرة في وقت قصير. انتظري بضع دقائق.', global_cap: 'وصلت المنصة للحد اليومي للمساعد. جرّبي غدًا.' };
    return fail(res.refused, 429, { message: msgs[res.refused], resetAt: nextReset() });
  }

  const t0 = Date.now(); let r = null, tin = 0, tout = 0;
  const finish = (st, extra) => env.DB.prepare('UPDATE ai_usage SET status=?,err=?,provider=?,model=?,tin=?,tout=?,ms=? WHERE id=?')
    .bind(st, extra.err || '', (r && r.provider) || '', (r && r.model) || '', tin, tout, Date.now() - t0, res.id).run();
  try {
    let out = null, lastErr = null;
    for (let attempt = 0; attempt < 2 && !out; attempt++) {
      r = await runProvider(env, cfg, attempt ? { ...prompt, user: prompt.user + '\n\nتنبيه: أعد JSON صالحًا فقط مطابقًا للمخطط، دون نص قبله أو بعده.' } : prompt, fetchImpl);
      tin += r.usage.in; tout += r.usage.out;
      try { const raw = parseJSON(r.text); out = isRegen ? normalizePart(module, part, raw, inp) : normalize(module, raw, inp); }
      catch (e) { lastErr = e; if (!(e instanceof AIError) || !e.retryable) throw e; }
    }
    if (!out) throw lastErr || new AIError('bad_output');
    await finish('ok', {});
    return json({ ok: true, module, part: part || undefined, ...(isRegen ? { value: out.value } : { data: out.data }), warnings: out.warnings, input: inp, review: true });
  } catch (e) {
    const code = e instanceof AIError ? e.code : 'provider_down';
    // A failed generation does not consume the teacher's quota (status 'fail' is not counted).
    await finish('fail', { err: code }).catch(() => { });
    if (code === 'rate_limited') await setCooldown(env, 60_000);
    if (code === 'provider_quota') await setCooldown(env, 60 * 60_000);
    console.log('ai_fail', module, code, e && e.detail ? String(e.detail).slice(0, 300) : '');
    const st = { rate_limited: 429, provider_quota: 429, timeout: 504, off_topic: 422, blocked: 422, bad_output: 502 }[code] || 503;
    return fail(code, st, { message: MSG[code] || MSG.provider_down });
  }
}

async function stats(env, cfg) {
  const day = ksaDay(), all = (sql, ...b) => env.DB.prepare(sql).bind(...b).all().then(r => r.results || []), one = (sql, ...b) => env.DB.prepare(sql).bind(...b).first();
  const from14 = ksaDay(Date.now() - 13 * 864e5), from30 = ksaDay(Date.now() - 29 * 864e5);
  const [tot, today, byMod, fails, series, tokens, recentFails, top, last] = await Promise.all([
    one(`SELECT COUNT(*) n FROM ai_usage WHERE status='ok' AND kind!='test'`),
    one(`SELECT SUM(status='ok') ok, SUM(status='fail') fail, COUNT(DISTINCT uid) users FROM ai_usage WHERE day=? AND kind!='test'`, day),
    all(`SELECT module, SUM(day=? AND status='ok') today, SUM(status='ok') total, SUM(status='fail') fails FROM ai_usage WHERE kind!='test' GROUP BY module`, day),
    all(`SELECT err, COUNT(*) n FROM ai_usage WHERE status='fail' AND day>=? GROUP BY err ORDER BY n DESC`, from14),
    all(`SELECT day, SUM(status='ok') ok, SUM(status='fail') fail FROM ai_usage WHERE day>=? AND kind!='test' GROUP BY day ORDER BY day`, from14),
    one(`SELECT SUM(CASE WHEN day=? THEN tin+tout ELSE 0 END) today, SUM(tin+tout) month, SUM(tin) tin, SUM(tout) tout FROM ai_usage WHERE day>=?`, day, from30),
    all(`SELECT created, module, kind, err, model FROM ai_usage WHERE status='fail' ORDER BY created DESC LIMIT 15`),
    all(`SELECT u.email, COUNT(*) n FROM ai_usage a JOIN users u ON u.id=a.uid WHERE a.day=? AND a.kind!='test' GROUP BY a.uid ORDER BY n DESC LIMIT 8`, day),
    all(`SELECT status, MAX(created) t, provider, model, err FROM ai_usage WHERE status IN ('ok','fail') GROUP BY status`)
  ]);
  return {
    day, total: tot.n | 0, today: { ok: today.ok | 0, fail: today.fail | 0, users: today.users | 0 }, byModule: byMod, failures: fails, series, tokens: { today: tokens.today | 0, month: tokens.month | 0, in: tokens.tin | 0, out: tokens.tout | 0 },
    recentFailures: recentFails, topUsers: top, last: Object.fromEntries(last.map(x => [x.status, x])), cooldownUntil: (await cooldown(env)) || null,
    providers: providerCatalog(env), config: cfg, globalUsedToday: today.ok | 0
  };
}

async function adminUser(request, env, url, m) {
  const email = String(url.searchParams.get('email') || '').trim().toLowerCase();
  const u = await env.DB.prepare('SELECT id,email FROM users WHERE email=?').bind(email).first();
  if (!u) return fail('not_found', 404);
  if (m === 'PUT') {
    const b = await readBody(request); if (!b) return fail('bad_json', 400);
    const quotas = {};
    for (const k of [...MODULE_IDS, 'regen']) if (b.quotas && b.quotas[k] !== '' && b.quotas[k] != null && Number.isFinite(+b.quotas[k])) quotas[k] = Math.max(0, Math.min(200, +b.quotas[k] | 0));
    const data = { blocked: !!b.blocked, quotas, note: String(b.note || '').slice(0, 200), updated: new Date().toISOString() };
    await env.DB.prepare('INSERT INTO ai_user_limits(uid,data) VALUES(?,?) ON CONFLICT(uid) DO UPDATE SET data=excluded.data').bind(u.id, JSON.stringify(data)).run();
  }
  const usage = await env.DB.prepare(`SELECT bucket, SUM(status='ok') ok, SUM(status='fail') fail FROM ai_usage WHERE uid=? AND day=? GROUP BY bucket`).bind(u.id, ksaDay()).all();
  return json({ uid: u.id, email: u.email, limits: await userLimits(env, u.id), today: usage.results || [] });
}
