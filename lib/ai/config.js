// AI settings: stored by the admin in docs `config/ai`, merged over these defaults and clamped on every read,
// so a bad value can never switch off the protections.

export const MODULE_IDS = ['presentation', 'lesson', 'quiz', 'game', 'worksheet', 'prep'];

export const DEFAULTS = {
  enabled: true,
  provider: 'gemini',          // gemini | openai (OpenAI-compatible)
  model: '',                   // empty = GEMINI_MODEL env or gemini-3.5-flash
  fallback: true,              // on rate limits try GEMINI_FALLBACK_MODEL, then the other provider if configured
  notice: '',                  // message shown to teachers when generation is paused
  quotas: { presentation: 2, lesson: 3, quiz: 5, game: 2, worksheet: 3, prep: 3, regen: 15 },
  modules: { presentation: true, lesson: true, quiz: true, game: true, worksheet: true, prep: true },
  globalDaily: 400,            // all teachers together, protects the provider's free quota
  burst: 15,                   // attempts (incl. failures and regenerations) per user per 10 minutes
  minAccountMinutes: 0         // new accounts must wait this long before generating (anti-abuse)
};

const int = (v, lo, hi, d) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

export function normalizeConfig(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const q = r.quotas || {}, m = r.modules || {};
  return {
    enabled: r.enabled !== false,
    provider: ['gemini', 'openai'].includes(r.provider) ? r.provider : DEFAULTS.provider,
    model: /^[\w.\-:/]{0,80}$/.test(String(r.model || '')) ? String(r.model || '') : '',
    fallback: r.fallback !== false,
    notice: String(r.notice || '').slice(0, 240),
    quotas: Object.fromEntries([...MODULE_IDS, 'regen'].map(k => [k, int(q[k], 0, 100, DEFAULTS.quotas[k])])),
    modules: Object.fromEntries(MODULE_IDS.map(k => [k, m[k] !== false])),
    globalDaily: int(r.globalDaily, 0, 100000, DEFAULTS.globalDaily),
    burst: int(r.burst, 1, 60, DEFAULTS.burst),
    minAccountMinutes: int(r.minAccountMinutes, 0, 10080, DEFAULTS.minAccountMinutes)
  };
}

export async function loadConfig(env) {
  const row = await env.DB.prepare('SELECT data FROM docs WHERE path=?').bind('config/ai').first();
  let raw = null; try { raw = row ? JSON.parse(row.data) : null; } catch { }
  return normalizeConfig(raw);
}

// Quota day follows Saudi time (UTC+3, no daylight saving): resets at midnight in Riyadh.
export const ksaDay = (t = Date.now()) => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);
export const nextReset = (t = Date.now()) => { const d = new Date(t + 3 * 3600e3); d.setUTCHours(24, 0, 0, 0); return new Date(d.getTime() - 3 * 3600e3).toISOString(); };
