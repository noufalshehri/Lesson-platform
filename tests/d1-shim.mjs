// Minimal Cloudflare D1 stand-in on node:sqlite for local tests and the preview server.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export function makeD1(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => { const r = db.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; }
  });
  return { prepare: sql => stmt(sql), _db: db };
}
