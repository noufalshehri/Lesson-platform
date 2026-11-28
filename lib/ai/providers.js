// AI provider layer. Each provider turns {system, user, maxTokens, temperature} into {text, usage}.
// Keys live only in Cloudflare environment secrets and never leave the server.
// To add a provider: write an adapter with the same signature and register it in ADAPTERS.

export class AIError extends Error {
  // code: provider_quota | rate_limited | provider_down | timeout | blocked | bad_output | not_configured | bad_request
  constructor(code, detail = '', retryable = false) { super(code); this.code = code; this.detail = String(detail).slice(0, 300); this.retryable = retryable; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function post(url, headers, body, timeoutMs, fetchImpl) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctl.signal });
  } catch (e) {
    if (e && e.name === 'AbortError') throw new AIError('timeout', 'provider timed out', true);
    throw new AIError('provider_down', e && e.message, true);
  } finally { clearTimeout(t); }
}

async function classify(res) {
  let txt = ''; try { txt = await res.text(); } catch { }
  if (res.status === 429) {
    const daily = /per\s*day|PerDay|daily/i.test(txt);
    return new AIError(daily ? 'provider_quota' : 'rate_limited', txt, false);
  }
  if (res.status === 401 || res.status === 403) return new AIError('not_configured', 'provider rejected the API key', false);
  if (res.status === 404) return new AIError('model_unavailable', txt.slice(0, 200), false);
  if (res.status >= 500) return new AIError('provider_down', 'HTTP ' + res.status, true);
  return new AIError('bad_request', 'HTTP ' + res.status + ' ' + txt.slice(0, 200), false);
}

/* ---------- Google Gemini (generativelanguage REST API) ---------- */
function thinkingFor(model) {
  if (/^gemini-2\.5-flash/.test(model)) return { thinkingBudget: 0 };
  if (/^gemini-[3-9]/.test(model)) return { thinkingLevel: 'low' };
  return null;
}
async function gemini({ key, model, system, user, maxTokens, temperature, timeoutMs, fetchImpl }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { responseMimeType: 'application/json', temperature, maxOutputTokens: maxTokens }
  };
  const th = thinkingFor(model);
  if (th) body.generationConfig.thinkingConfig = th;
  let res = await post(url, { 'x-goog-api-key': key }, body, timeoutMs, fetchImpl);
  if (res.status === 400 && th) { // older/newer model without this thinking option: retry plainly
    const t = await res.clone().text().catch(() => '');
    if (/thinking/i.test(t)) { delete body.generationConfig.thinkingConfig; res = await post(url, { 'x-goog-api-key': key }, body, timeoutMs, fetchImpl); }
  }
  if (!res.ok) throw await classify(res);
  const j = await res.json().catch(() => null);
  if (!j) throw new AIError('bad_output', 'non-JSON response', true);
  if (j.promptFeedback && j.promptFeedback.blockReason) throw new AIError('blocked', j.promptFeedback.blockReason);
  const c = (j.candidates || [])[0];
  if (!c) throw new AIError('bad_output', 'no candidates', true);
  if (c.finishReason === 'SAFETY' || c.finishReason === 'PROHIBITED_CONTENT' || c.finishReason === 'BLOCKLIST') throw new AIError('blocked', c.finishReason);
  const text = ((c.content && c.content.parts) || []).filter(p => !p.thought).map(p => p.text || '').join('');
  const u = j.usageMetadata || {};
  return { text, truncated: c.finishReason === 'MAX_TOKENS', usage: { in: u.promptTokenCount | 0, out: (u.candidatesTokenCount | 0) + (u.thoughtsTokenCount | 0) } };
}

/* ---------- Any OpenAI-compatible chat API (Groq, OpenRouter, Mistral, OpenAI…) ---------- */
async function openaiCompat({ key, model, base, system, user, maxTokens, temperature, timeoutMs, fetchImpl }) {
  const url = String(base || '').replace(/\/+$/, '') + '/chat/completions';
  const body = { model, temperature, max_tokens: maxTokens, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
  const res = await post(url, { authorization: 'Bearer ' + key }, body, timeoutMs, fetchImpl);
  if (!res.ok) throw await classify(res);
  const j = await res.json().catch(() => null);
  const c = j && j.choices && j.choices[0];
  if (!c) throw new AIError('bad_output', 'no choices', true);
  if (c.finish_reason === 'content_filter') throw new AIError('blocked', 'content_filter');
  const u = j.usage || {};
  return { text: (c.message && c.message.content) || '', truncated: c.finish_reason === 'length', usage: { in: u.prompt_tokens | 0, out: u.completion_tokens | 0 } };
}

const ADAPTERS = { gemini, openai: openaiCompat };

// Which providers are usable with the current environment. Never returns key values.
export function providerCatalog(env) {
  return {
    gemini: { label: 'Google Gemini', configured: !!env.GEMINI_API_KEY, models: [env.GEMINI_MODEL || 'gemini-3.5-flash', env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite'].filter((v, i, a) => v && a.indexOf(v) === i) },
    openai: { label: 'OpenAI-compatible (' + (env.OPENAI_COMPAT_LABEL || 'fallback') + ')', configured: !!(env.OPENAI_COMPAT_API_KEY && env.OPENAI_COMPAT_BASE_URL && env.OPENAI_COMPAT_MODEL), models: [env.OPENAI_COMPAT_MODEL].filter(Boolean) }
  };
}

// Builds the ordered list of {provider, model} attempts from config + env.
export function attemptChain(env, cfg) {
  const cat = providerCatalog(env), out = [];
  const order = [cfg.provider, ...(cfg.fallback ? ['gemini', 'openai'] : [])].filter((v, i, a) => ADAPTERS[v] && a.indexOf(v) === i);
  for (const p of order) {
    if (!cat[p].configured) continue;
    const models = p === 'gemini' ? [cfg.model || cat.gemini.models[0], ...(cfg.fallback ? cat.gemini.models : [])] : cat[p].models;
    for (const m of models.filter((v, i, a) => v && a.indexOf(v) === i)) out.push({ provider: p, model: m });
  }
  return out;
}

// Runs one generation with retries on transient errors and fallback on rate limits.
export async function runProvider(env, cfg, req, fetchImpl = fetch) {
  const chain = attemptChain(env, cfg);
  if (!chain.length) throw new AIError('not_configured', 'no provider key set');
  let last = null;
  for (const step of chain) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await ADAPTERS[step.provider]({
          ...req, model: step.model, fetchImpl, timeoutMs: req.timeoutMs || 55000,
          key: step.provider === 'gemini' ? env.GEMINI_API_KEY : env.OPENAI_COMPAT_API_KEY,
          base: env.OPENAI_COMPAT_BASE_URL
        });
        return { ...r, provider: step.provider, model: step.model };
      } catch (e) {
        last = e instanceof AIError ? e : new AIError('provider_down', e && e.message, true);
        if (last.code === 'blocked' || last.code === 'bad_request') throw last; // a fallback will not fix these
        if (!last.retryable || attempt === 2) break; // move to next model/provider
        await sleep(attempt === 0 ? 700 : 1800);
      }
    }
  }
  throw last || new AIError('provider_down');
}
