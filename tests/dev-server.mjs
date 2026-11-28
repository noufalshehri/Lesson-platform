// Local preview: serves public/ and runs functions/api against SQLite with a mocked Gemini (no key, no network).
// node tests/dev-server.mjs [port]   — then open http://localhost:8788
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { makeD1 } from './d1-shim.mjs';
import { mockFetch } from './fixtures.mjs';
import { onRequest } from '../functions/api/[[path]].js';

const PORT = +process.argv[2] || 8788, ROOT = new URL('../public/', import.meta.url).pathname;
const env = { DB: makeD1(), ADMIN_EMAILS: 'noufallshehri@gmail.com', DEMO_PAYMENTS: 'true', GEMINI_API_KEY: 'local-mock' };
const realFetch = globalThis.fetch, mock = mockFetch({ delay: +process.env.MOCK_DELAY || 1200, mode: () => process.env.MOCK_MODE || 'ok' });
globalThis.fetch = (url, init) => String(url).startsWith('https://generativelanguage.googleapis.com/') ? mock(url, init) : realFetch(url, init);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname.startsWith('/api/')) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request('https://localhost' + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const r = await onRequest({ request, env, params: { path: url.pathname.slice(5).split('/') } });
    const h = Object.fromEntries(r.headers); if (h['set-cookie']) h['set-cookie'] = h['set-cookie'].replace('; Secure', '');
    res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer())); return;
  }
  const p = normalize(join(ROOT, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
  if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try { const b = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, () => console.log('preview on http://localhost:' + PORT));
