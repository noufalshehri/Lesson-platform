import test from 'node:test';
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.mjs';
import { mockFetch, FIX } from './fixtures.mjs';
import { onRequest } from '../functions/api/[[path]].js';
import { handleAI } from '../lib/ai/service.js';

const ADMIN = 'noufallshehri@gmail.com';
function setup(extraEnv = {}) {
  const env = { DB: makeD1(), ADMIN_EMAILS: ADMIN, GEMINI_API_KEY: 'test-key', ...extraEnv };
  const jar = {};
  const call = async (method, path, body, who = 'teacher', fetchImpl) => {
    const headers = { 'content-type': 'application/json' };
    if (jar[who]) headers.cookie = 'sid=' + jar[who];
    const request = new Request('https://app.madbot.store/api' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const segs = path.split('?')[0].slice(1).split('/');
    let res;
    if (fetchImpl && path.startsWith('/ai/')) { // inject the provider mock directly
      const me = jar[who] ? await env.DB.prepare('SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.uid').first() : null;
      const row = jar[who] ? await env.DB.prepare('SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=?').bind(await sha(jar[who])).first() : null;
      res = await handleAI(request, env, row || me, path.split('?')[0].slice(3), row && row.email === ADMIN, fetchImpl);
    } else res = await onRequest({ request, env, params: { path: segs } });
    const sc = res.headers.get('set-cookie'); if (sc && sc.startsWith('sid=')) jar[who] = sc.slice(4).split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  return { env, call, jar };
}
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
const INPUT = { stage: 'المرحلة الابتدائية', grade: 'الثاني الابتدائي', subject: 'العلوم', lesson: 'حالات الماء', semester: 'الفصل الدراسي الأول', difficulty: 'متوسط', style: 'science' };
async function signup(call, who, email) { const r = await call('POST', '/register', { email, password: 'password123' }, who); assert.equal(r.status, 200); }

test('all six generators return validated, structured data', async () => {
  const { call } = setup(); await signup(call, 'teacher', 't1@school.sa');
  const f = mockFetch();
  for (const module of ['presentation', 'lesson', 'quiz', 'game', 'worksheet', 'prep']) {
    const input = module === 'quiz' ? { ...INPUT, types: ['mcq', 'tf', 'fill', 'open'], count: 7 } : module === 'game' ? { ...INPUT, gameType: 'star' } : module === 'worksheet' ? { ...INPUT, kinds: ['mcq', 'fill', 'match', 'short', 'draw', 'circle'] } : INPUT;
    const r = await call('POST', '/ai/generate', { module, input }, 'teacher', f);
    assert.equal(r.status, 200, module + ' ' + JSON.stringify(r.body));
    assert.ok(r.body.ok && r.body.data && r.body.review, module);
    if (module === 'presentation') {
      const types = r.body.data.slides.map(s => s.type);
      assert.ok(!types.includes('script'), 'unknown slide type dropped');
      assert.equal(r.body.data.slides.filter(s => s.type === 'mcq').length, 2, 'mcq without distractors dropped');
      const sort = r.body.data.slides.find(s => s.type === 'sort'); assert.equal(sort.items.length, 4, 'item with unknown group dropped');
      const ex = r.body.data.slides.find(s => s.type === 'examples'); assert.equal(ex.items[2].pic, '⭐', 'non-whitelisted picture replaced');
    }
    if (module === 'lesson') {
      const q = r.body.data.content.questions[0]; assert.equal(q[2], '٧', 'arithmetic key corrected'); assert.ok(r.body.warnings.some(w => w.includes('صُحّحت')));
      assert.deepEqual(r.body.data.content.diff.map(d => d[0]), ['أنطلق', 'أتقدّم', 'أتميّز'], 'level spelling normalised');
      assert.equal(r.body.data.content.order[0][1], '', 'emoji without a picture cleared');
    }
    if (module === 'quiz') {
      const qs = r.body.data.questions; assert.equal(qs.length, 6, 'duplicate-option question dropped');
      assert.equal(qs[0].o[qs[0].a], '٧', 'wrong arithmetic answer fixed in options'); assert.equal(qs.find(q => q.t === 'tf' && q.q.includes('٩')).a, '0');
    }
    if (module === 'game') { assert.equal(r.body.data.type, 'star'); assert.equal(r.body.data.rows.length, 5); assert.equal(r.body.data.rows[0].length, 6); }
    if (module === 'worksheet') { const fill = r.body.data.sections.find(s => s.kind === 'fill'); assert.ok(fill.items[1].sentence.includes('......'), 'blank added'); }
    if (module === 'prep') assert.equal(r.body.data.stages.reduce((a, s) => a + s.minutes, 0), 45);
  }
  // key never sent anywhere except the provider header, and never in the response
  assert.ok(f.calls.every(c => c.url.startsWith('https://generativelanguage.googleapis.com/')));
});

test('quotas: per module, refresh-proof, failures do not count', async () => {
  const { call, env } = setup(); await signup(call, 'teacher', 't2@school.sa');
  const ok = mockFetch();
  for (let i = 0; i < 2; i++) assert.equal((await call('POST', '/ai/generate', { module: 'game', input: { ...INPUT, gameType: 'star' } }, 'teacher', ok)).status, 200);
  const third = await call('POST', '/ai/generate', { module: 'game', input: { ...INPUT, gameType: 'star' } }, 'teacher', ok);
  assert.equal(third.status, 429); assert.equal(third.body.error, 'quota');
  const st = await call('GET', '/ai/status', undefined, 'teacher', ok);
  assert.equal(st.body.modules.game.left, 0); assert.equal(st.body.modules.quiz.left, 5);
  // provider failure: no quota consumed
  const bad = mockFetch({ mode: '500' });
  const r = await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', bad);
  assert.equal(r.status, 503); assert.equal(bad.calls.length, 6, 'retried transient errors twice on each of the two models');
  assert.equal((await call('GET', '/ai/status', undefined, 'teacher', ok)).body.modules.quiz.left, 5);
  const rows = await env.DB.prepare("SELECT status, err FROM ai_usage WHERE module='quiz'").all();
  assert.deepEqual(rows.results.map(x => x.status + ':' + x.err), ['fail:provider_down']);
});

test('parallel requests cannot bypass the quota or the one-at-a-time rule', async () => {
  const { call } = setup(); await signup(call, 'teacher', 't3@school.sa');
  const slow = mockFetch({ delay: 60 });
  const rs = await Promise.all(Array.from({ length: 6 }, () => call('POST', '/ai/generate', { module: 'presentation', input: INPUT }, 'teacher', slow)));
  const codes = rs.map(r => r.status).sort();
  assert.equal(codes.filter(c => c === 200).length, 1, 'only one in flight');
  assert.ok(rs.filter(r => r.status === 429).every(r => r.body.error === 'busy'));
  await call('POST', '/ai/generate', { module: 'presentation', input: INPUT }, 'teacher', slow);
  const after = await call('POST', '/ai/generate', { module: 'presentation', input: INPUT }, 'teacher', slow);
  assert.equal(after.body.error, 'quota', 'presentations stop at 2/day');
});

test('burst limit, global cap, rate-limit cooldown, fallback model', async () => {
  const { call, env } = setup({ GEMINI_FALLBACK_MODEL: 'gemini-3.1-flash-lite' }); await signup(call, 'admin', ADMIN); await signup(call, 'teacher', 't4@school.sa');
  // fallback: first model 429 (per minute) -> second model answers
  const fb = mockFetch({ mode: n => n === 1 ? '429' : 'ok' });
  const r = await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', fb);
  assert.equal(r.status, 200); assert.ok(fb.calls[1].url.includes('gemini-3.1-flash-lite'));
  // daily provider quota on every model -> cooldown blocks the next request without calling the provider
  const day = mockFetch({ mode: '429day' });
  assert.equal((await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', day)).body.error, 'provider_quota');
  const n = day.calls.length;
  const blocked = await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', day);
  assert.equal(blocked.body.error, 'cooldown'); assert.equal(day.calls.length, n);
  await env.DB.prepare("DELETE FROM limits WHERE k='ai:cooldown'").run();
  // global cap via admin config
  const put = await call('PUT', '/ai/admin/config', { globalDaily: 1, quotas: { quiz: 50 } }, 'admin');
  assert.equal(put.status, 200); assert.equal(put.body.config.globalDaily, 1);
  const cap = await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', mockFetch());
  assert.equal(cap.body.error, 'global_cap');
  // burst: 15 attempts / 10 min
  await call('PUT', '/ai/admin/config', { globalDaily: 0, quotas: { quiz: 50 } }, 'admin');
  let last; for (let i = 0; i < 17; i++) last = await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', mockFetch());
  assert.equal(last.body.error, 'too_fast');
});

test('admin controls: disable, user limits, block, stats; teachers cannot use admin routes', async () => {
  const { call } = setup(); await signup(call, 'admin', ADMIN); await signup(call, 'teacher', 't5@school.sa');
  assert.equal((await call('GET', '/ai/admin/stats', undefined, 'teacher')).status, 403);
  assert.equal((await call('PUT', '/ai/admin/config', { enabled: false }, 'teacher')).status, 403);
  await call('PUT', '/ai/admin/config', { modules: { worksheet: false }, notice: 'صيانة' }, 'admin');
  const off = await call('POST', '/ai/generate', { module: 'worksheet', input: INPUT }, 'teacher', mockFetch());
  assert.equal(off.body.error, 'disabled'); assert.equal(off.body.message, 'صيانة');
  const u = await call('PUT', '/ai/admin/user?email=t5@school.sa', { quotas: { quiz: 1 } }, 'admin'); assert.equal(u.body.limits.quotas.quiz, 1);
  assert.equal((await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', mockFetch())).status, 200);
  assert.equal((await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', mockFetch())).body.error, 'quota');
  await call('PUT', '/ai/admin/user?email=t5@school.sa', { blocked: true }, 'admin');
  assert.equal((await call('POST', '/ai/generate', { module: 'lesson', input: INPUT }, 'teacher', mockFetch())).body.error, 'blocked_user');
  const s = await call('GET', '/ai/admin/stats', undefined, 'admin');
  assert.equal(s.status, 200); assert.ok(s.body.total >= 1); assert.ok(s.body.byModule.find(m => m.module === 'quiz'));
  assert.equal(s.body.providers.gemini.configured, true); assert.ok(!JSON.stringify(s.body).includes('test-key'), 'API key never exposed');
  const t = await call('POST', '/ai/admin/test', {}, 'admin', mockFetch()); assert.equal(t.body.ok, true);
});

test('input validation, auth, prompt hygiene, regeneration', async () => {
  const { call } = setup(); await signup(call, 'teacher', 't6@school.sa');
  assert.equal((await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'nobody')).status, 401);
  assert.equal((await call('POST', '/ai/generate', { module: 'quiz', input: { ...INPUT, stage: 'x' } }, 'teacher', mockFetch())).body.error, 'bad_input');
  assert.equal((await call('POST', '/ai/generate', { module: 'hack', input: INPUT }, 'teacher', mockFetch())).body.error, 'bad_input');
  const f = mockFetch();
  await call('POST', '/ai/generate', { module: 'lesson', input: { ...INPUT, notes: 'جوال ولي الأمر 0551234567 وبريده a@b.com https://evil.example', source: 'نص من الكتاب: للماء ثلاث حالات.' } }, 'teacher', f);
  const sent = f.calls[0].body.contents[0].parts[0].text;
  assert.ok(!sent.includes('0551234567') && !sent.includes('a@b.com') && !sent.includes('evil.example'), 'personal data stripped');
  assert.ok(sent.includes('نص_مرجعي') && sent.includes('للماء ثلاث حالات'));
  assert.ok(f.calls[0].body.systemInstruction.parts[0].text.includes('لا تدّعِ أبدًا أن المحتوى مطابق للمنهج'));
  for (const [module, part] of [['presentation', 'mcq'], ['quiz', 'mcq'], ['lesson', 'questions'], ['worksheet', 'tf'], ['game', 'items'], ['prep', 'homework']]) {
    const r = await call('POST', '/ai/regen', { module, part, input: module === 'game' ? { ...INPUT, gameType: 'star' } : INPUT, current: { old: 1 } }, 'teacher', mockFetch());
    assert.equal(r.status, 200, module + JSON.stringify(r.body)); assert.ok(r.body.value, module);
  }
  assert.equal((await call('POST', '/ai/regen', { module: 'quiz', part: 'drop table', input: INPUT }, 'teacher', mockFetch())).body.error, 'bad_input');
  // bad JSON twice -> bad_output, quota untouched
  const bad = await call('POST', '/ai/generate', { module: 'prep', input: INPUT }, 'teacher', mockFetch({ mode: 'badjson' }));
  assert.equal(bad.body.error, 'bad_output');
  assert.equal((await call('POST', '/ai/generate', { module: 'prep', input: INPUT }, 'teacher', mockFetch({ mode: 'fenced' }))).status, 200, 'fenced JSON accepted');
});

test('no provider key -> clear not_configured; missing migration -> clear error', async () => {
  const { call } = setup({ GEMINI_API_KEY: '' }); await signup(call, 'teacher', 't7@school.sa');
  const st = await call('GET', '/ai/status'); assert.equal(st.body.reason, 'not_configured');
  assert.equal((await call('POST', '/ai/generate', { module: 'quiz', input: INPUT })).body.error, 'not_configured');
  const s2 = setup(); await signup(s2.call, 'teacher', 't8@school.sa'); s2.env.DB._db.exec('DROP TABLE ai_usage');
  assert.equal((await s2.call('GET', '/ai/status')).body.error, 'ai_not_migrated');
});

test('invalid Gemini key (HTTP 400) is reported precisely', async () => {
  const { call } = setup(); await signup(call, 'teacher', 't9@school.sa');
  const f = async () => new Response('{"error":{"code":400,"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}', { status: 400 });
  const r = await call('POST', '/ai/generate', { module: 'quiz', input: INPUT }, 'teacher', f);
  assert.equal(r.body.error, 'bad_key'); assert.ok(r.body.message.includes('GEMINI_API_KEY'));
});
