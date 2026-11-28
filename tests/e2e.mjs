// End-to-end browser test against tests/dev-server.mjs (mock provider). Usage: node tests/e2e.mjs [baseUrl] [outDir]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const BASE = process.argv[2] || 'http://localhost:8788', OUT = process.argv[3] || '/tmp/shots';
mkdirSync(OUT, { recursive: true });
const results = []; let failed = 0;
const ok = (name, cond, extra = '') => { results.push((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!cond) failed++; };

async function signup(page, email, name) {
  await page.goto(BASE + '/#ai');
  await page.click('[data-swap]');
  await page.fill('.auf [name=email]', email); await page.fill('.auf [name=password]', 'password123'); await page.click('.auf button.pri');
  await page.fill('.onf [name=name]', name); await page.click('.onf button.pri');
  await page.waitForSelector('.aiMods');
}
async function gen(page, mod, fill = {}) {
  await page.click(`[data-aimod=${mod}]`); await page.waitForSelector('#aiForm');
  await page.fill('#aiForm [name=subject]', fill.subject || 'العلوم'); await page.fill('#aiForm [name=lesson]', fill.lesson || 'حالات الماء');
  if (fill.before) await fill.before();
  await page.click('#aiForm button.pri');
  await page.waitForSelector('.aiLoad, .dlg [data-ok]', { timeout: 3000 }).catch(() => { });
  if (await page.locator('.dlg [data-ok]').count()) { gen.confirmed = (gen.confirmed || 0) + 1; await page.click('.dlg [data-ok]'); }
  await page.waitForSelector('.aiResH, .aiErr', { timeout: 15000 }).catch(async e => { await page.screenshot({ path: OUT + '/fail.png' }); console.log('STATE', await page.evaluate(() => AI.view + ' submit=' + (document.querySelector('#app').onsubmit && document.querySelector('#app').onsubmit.name)), 'ERRORS', JSON.stringify(gen.errors || [])); throw e; });
}
async function backToAI(page) { await page.goto(BASE + '/#ai'); await page.waitForSelector('.aiMods, .aiResH'); if (await page.locator('.aiResH').count()) { await page.click('[data-aihome]'); await page.waitForSelector('.aiMods'); } }
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const toastText = page => page.locator('#toast').textContent();

async function run(device) {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext(device === 'mobile' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ar-SA' } : { viewport: { width: 1366, height: 900 }, locale: 'ar-SA' });
  const page = await ctx.newPage(), errors = [];
  gen.errors = errors; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g|unpkg|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('response', async r => { if (r.url().includes('/api/ai/') && r.status() !== 200) console.log('AIRESP', D, r.url().split('/api/ai')[1], r.status(), (await r.text().catch(() => '')).slice(0, 160)); });
  await page.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
  const D = device, shot = n => page.screenshot({ path: `${OUT}/${D}-${n}.png`, fullPage: false });
  await signup(page, `${D}@school.sa`, 'أ. نوف');
  ok(`${D}: RTL document`, await page.evaluate(() => document.documentElement.dir === 'rtl' && getComputedStyle(document.querySelector('#aiBody')).direction === 'rtl'));
  ok(`${D}: six module cards with quotas`, (await page.locator('.aiMod').count()) === 6 && (await page.locator('.aiMod .aiQ').first().textContent()).includes('متبقٍ'));
  ok(`${D}: no horizontal overflow (home)`, await noOverflow(page)); await shot('01-home');

  // 1. presentation
  await page.click('[data-aimod=presentation]'); await page.waitForSelector('#aiForm'); await shot('02-form');
  ok(`${D}: no horizontal overflow (form)`, await noOverflow(page));
  await page.click('[data-aihome]'); await gen(page, 'presentation', { before: async () => { for (const v of ['mystery', 'story']) await page.click(`label.aiChip:has(input[name=acts][value=${v}])`); ok(`${D}: plan-locked activities are disabled`, await page.locator('#aiForm [name=acts][value=match]').isDisabled()); } });
  const nSl = await page.locator('#aiGal .gitem').count();
  ok(`${D}: presentation renders slides`, nSl >= 15, nSl + ' slides'); await shot('03-presentation');
  ok(`${D}: no horizontal overflow (result)`, await noOverflow(page));
  ok(`${D}: AI review notice shown`, (await page.locator('.aiReview').textContent()).includes('يحتاج مراجعتك'));
  for (let k = 0; k < 6 && !(await page.locator('[data-airgs]').count()); k++) { await page.click('#aiGal [data-gnav="1"]'); await page.waitForTimeout(700); }
  const toolBtn = page.locator('[data-airgs]');
  if (await toolBtn.count()) { const before = await page.evaluate(() => JSON.stringify(AI.res.data.slides)); await toolBtn.click(); await page.waitForFunction(b => JSON.stringify(AI.res.data.slides) !== b, before, { timeout: 8000 }).catch(() => { }); ok(`${D}: per-slide regeneration replaces only that slide`, await page.evaluate(b => { const a = AI.res.data.slides, o = JSON.parse(b); return a.length === o.length && a.filter((s, i) => JSON.stringify(s) !== JSON.stringify(o[i])).length === 1; }, before)); }
  else ok(`${D}: per-slide regeneration tool visible`, false);
  // regeneration failure keeps content
  await page.evaluate(() => { window.__realFetch = window.fetch; window.fetch = (u, o) => String(u).includes('/api/ai/regen') ? Promise.resolve(new Response('{"error":"provider_down","message":"تعذّر"}', { status: 503 })) : window.__realFetch(u, o); });
  const snap = await page.evaluate(() => JSON.stringify(AI.res.data)); await page.locator('[data-airgs]').click().catch(() => { }); await page.waitForTimeout(600);
  ok(`${D}: failed regeneration never loses content`, await page.evaluate(s => JSON.stringify(AI.res.data) === s, snap));
  await page.evaluate(() => { window.fetch = window.__realFetch; });
  // reorder + duplicate + delete in preview
  const n0 = await page.evaluate(() => AI.res.data.slides.length);
  await page.locator('[data-aidup]').click(); ok(`${D}: duplicate slide`, await page.evaluate(n => AI.res.data.slides.length === n + 1, n0));
  await page.locator('[data-aidel]').click(); ok(`${D}: delete slide`, await page.evaluate(n => AI.res.data.slides.length === n, n0));
  // play: answer an MCQ and open an embedded game
  await page.click('[data-aiplay]'); await page.waitForSelector('#pl');
  let answered = false, gameOpened = false;
  for (let i = 0; i < 30 && !(answered && gameOpened); i++) {
    if (!answered && await page.locator('#stage .opt[data-ok="1"]').count()) { await page.locator('#stage .opt[data-ok="1"]').first().click(); answered = await page.locator('#stage .opt.won').count() > 0; }
    if (!gameOpened && await page.locator('#stage [data-game]').count()) { await page.locator('#stage [data-game]').first().click(); await page.waitForTimeout(400); gameOpened = await page.locator('#gr').count() > 0; if (gameOpened) await page.click("#gr [data-gx]"); await page.waitForTimeout(200); }
    const next = page.locator('#pl [data-a=next]'); if (await next.isDisabled()) break; await next.click(); await page.waitForTimeout(150);
  }
  ok(`${D}: interactive MCQ works in player`, answered); ok(`${D}: embedded AI game opens`, gameOpened);
  if (D === 'desktop') await shot('04-player');
  await page.click('#pl [data-a=close]'); if (await page.locator('.dlg').count()) { console.log('DIALOG:', (await page.locator('.dlg').first().textContent()).slice(0, 200)); await shot('dbg'); }
  await page.click('[data-aisave]'); await page.waitForTimeout(500);
  ok(`${D}: saved to «دروسي» with linked games`, await page.evaluate(() => ME.lessons.some(l => l.src === 'ai:presentation') && ME.games.length >= 1 && ME.lessons[0].slides.every(s => s.els.every(e => e.kind !== 'game' || !String(e.data.ref).startsWith('aitmp_')))));
  await page.click('[data-aistudio]'); await page.waitForSelector('.studio');
  ok(`${D}: opens in studio (edit/reorder/export)`, (await page.locator('#stSlides .sth').count()) >= 15);
  await backToAI(page);

  // 2. lesson
  await gen(page, 'lesson', { subject: 'الرياضيات', lesson: 'الجمع ضمن ١٠' });
  ok(`${D}: complete lesson composes stages`, (await page.locator('#aiGal .gitem').count()) >= 20);
  ok(`${D}: arithmetic correction surfaced`, (await page.locator('.aiWarn').textContent()).includes('صُحّحت'));
  await page.click('[data-aiedit]'); await page.waitForSelector('#aiLF .in');
  const t0 = await page.locator('#aiLF [data-f=title]').inputValue(); await page.fill('#aiLF [data-f=title]', t0 + ' (معدّل)'); await page.waitForTimeout(500);
  ok(`${D}: lesson editing updates content`, await page.evaluate(() => AI.res.data.content.title.endsWith('(معدّل)')));
  await page.selectOption('#aiPart', 'questions'); await page.click('[data-airgp]'); await page.waitForTimeout(1800);
  ok(`${D}: lesson part regeneration`, await page.evaluate(() => AI.res.data.content.questions[0][0].includes('١ + ٨')));
  await page.click('[data-aijr]'); await page.waitForTimeout(600); ok(`${D}: journey mode opens`, page.url().includes('#journey'));
  await backToAI(page);

  // 3. quiz
  await gen(page, 'quiz', { subject: 'الرياضيات', lesson: 'الجمع', before: async () => { await page.click('label.aiChip:has(input[name=types][value=open])'); } });
  const nq = await page.locator('.aiQ1').count(); ok(`${D}: quiz editor lists questions`, nq === 6, nq + ''); await shot('05-quiz');
  await page.locator('[data-airgq]').first().click(); await page.waitForTimeout(1800);
  ok(`${D}: quiz question regeneration`, await page.evaluate(() => AI.res.data.questions[0].q.includes('٤ + ٣')));
  await page.click('[data-aiqprint=A]'); await page.waitForTimeout(300); await page.click('[data-aiqprint=key]'); await page.waitForTimeout(300); ok(`${D}: quiz prints paper + key`, await page.evaluate(() => window.__printed >= 2));
  await page.click('[data-aiqcls]'); await page.waitForTimeout(400); ok(`${D}: quiz added to class exams`, (await toastText(page)).includes('اختبارات'));
  await page.click('[data-aiq2g]'); await page.waitForTimeout(600); ok(`${D}: quiz converts to a game`, await page.locator("#gr").count() > 0); await page.click("#gr [data-gx]");
  await page.click('[data-aisave]'); await page.waitForTimeout(400); ok(`${D}: quiz saved to library`, (await toastText(page)).includes('مكتبتك'));
  await page.click('[data-aihome]');

  // 4. game
  await gen(page, 'game', { subject: 'الرياضيات', lesson: 'الجمع' });
  ok(`${D}: game result table`, (await page.locator('.aiTbl tbody tr').count()) === 5); await shot('06-game');
  await page.click('[data-aigplay]'); await page.waitForTimeout(500); ok(`${D}: generated game runs`, await page.locator("#gr").count() > 0); await page.click("#gr [data-gx]"); await page.waitForTimeout(300);
  await page.click('[data-aisave]'); await page.waitForTimeout(400); ok(`${D}: game saved to «ألعابي»`, await page.evaluate(() => ME.games.some(g => g.ai && g.ai.module === 'game')));
  await page.click('[data-aihome]');

  // 5. worksheet
  await gen(page, 'worksheet', { before: async () => { for (const v of ['draw', 'circle']) await page.click(`label.aiChip:has(input[name=kinds][value=${v}])`); } });
  ok(`${D}: worksheet sections`, (await page.locator('.wsS').count()) === 6); await shot('07-worksheet');
  await page.click('[data-tab=aiws][data-k=key]'); ok(`${D}: worksheet answer key`, (await page.locator('.wsP .k').count()) > 0);
  await page.click('[data-tab=aiws][data-k=edit]'); ok(`${D}: worksheet editor`, (await page.locator('[data-aie^="sections."]').count()) > 10);
  await page.locator('[data-airgw]').nth(1).click(); await page.waitForTimeout(1800); ok(`${D}: worksheet section regeneration`, await page.evaluate(() => AI.res.data.sections[1].kind === 'fill' && AI.res.data.sections[1].items[0].answer === 'يذوب'));
  await page.click('[data-aiwprint="1"]'); await page.waitForTimeout(300); ok(`${D}: worksheet prints`, await page.evaluate(() => window.__printed >= 3));
  await page.click('[data-aihome]');

  // 6. prep
  await gen(page, 'prep');
  ok(`${D}: prep plan with stages`, (await page.locator('.ppT tbody tr').count()) === 4); await shot('08-prep');
  await page.locator('[data-airgf=homework]').click(); await page.waitForTimeout(1800); ok(`${D}: prep field regeneration`, await page.evaluate(() => AI.res.data.homework.includes('ثلاثة أمثلة')));
  await page.click('[data-ai2lesson]'); ok(`${D}: prep → lesson prefill`, (await page.locator('#aiForm [name=objectives]').inputValue()).includes('حالات الماء'));
  await page.click('[data-aihome]');

  // quotas: games are 2/day
  await gen(page, 'game', { subject: 'الرياضيات', lesson: 'الجمع' }); await page.click('[data-aihome]').catch(() => { });
  await page.click('[data-aimod=game]'); await page.waitForSelector('#aiForm');
  ok(`${D}: quota reached disables button`, await page.locator('#aiForm button.pri').isDisabled());
  const st = await page.evaluate(() => fetch('/api/ai/generate', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ module: 'game', input: { stage: 'المرحلة الابتدائية', subject: 'x', lesson: 'xx' } }) }).then(r => r.json()));
  ok(`${D}: server refuses over-quota even if UI is bypassed`, st.error === 'quota', JSON.stringify(st));
  // draft survives refresh
  await page.reload(); await page.waitForSelector('.aiMods'); ok(`${D}: draft survives page refresh`, (await page.locator('.aiDraft').count()) === 1);
  await page.click('[data-ailib]'); await page.waitForSelector('.aiLibI'); ok(`${D}: library lists saved items`, (await page.locator('.aiLibI').count()) >= 3); await shot('09-library');
  ok(`${D}: unsaved draft asks before being replaced`, gen.confirmed > 0);
  ok(`${D}: no JS errors`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

async function admin() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 1000 } })).newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await signup(page, 'noufallshehri@gmail.com', 'نوف');
  await page.goto(BASE + '/#admin'); await page.click('[data-tab=ad][data-k=ai]'); await page.waitForSelector('#aiaCfg');
  ok('admin: AI dashboard shows totals and provider status', (await page.locator('#adPanel .stat').count()) >= 5 && (await page.locator('#adPanel').textContent()).includes('مفعّل'));
  await page.screenshot({ path: `${OUT}/admin-ai.png`, fullPage: true });
  await page.fill('#aiaCfg [name=q_quiz]', '7'); await page.uncheck('#aiaCfg [name=mod_prep]'); await page.click('#aiaCfg button.pri'); await page.waitForTimeout(500);
  const cfg = await page.evaluate(() => fetch('/api/ai/admin/config').then(r => r.json()));
  ok('admin: quotas and module switches save', cfg.config.quotas.quiz === 7 && cfg.config.modules.prep === false);
  await page.fill('#aiaU [name=email]', 'desktop@school.sa'); await page.click('#aiaU button'); await page.waitForSelector('#aiaUL');
  await page.check('#aiaUL [name=blocked]'); await page.click('#aiaUL button.pri'); await page.waitForTimeout(400);
  ok('admin: block a teacher', (await page.evaluate(() => fetch('/api/ai/admin/user?email=desktop@school.sa').then(r => r.json()))).limits.blocked === true);
  await page.click('[data-aiatest]'); await page.waitForTimeout(2500); ok('admin: provider test', (await toastText(page)).includes('يعمل'));
  ok('admin: no JS errors', errors.length === 0, errors.join(' | '));
  await browser.close();
}

await run('desktop'); await run('mobile'); await admin();
console.log(results.join('\n')); console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
