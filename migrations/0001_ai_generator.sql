/* AI generator: usage log (no prompt or content stored) and per-teacher limits. Paste into the D1 Console and run. */
CREATE TABLE IF NOT EXISTS ai_usage (id TEXT PRIMARY KEY, uid TEXT NOT NULL, module TEXT NOT NULL, kind TEXT NOT NULL, bucket TEXT NOT NULL, day TEXT NOT NULL, status TEXT NOT NULL, err TEXT NOT NULL DEFAULT '', provider TEXT NOT NULL DEFAULT '', model TEXT NOT NULL DEFAULT '', tin INTEGER NOT NULL DEFAULT 0, tout INTEGER NOT NULL DEFAULT 0, ms INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS ai_usage_user_day ON ai_usage(uid, day, bucket, status);
CREATE INDEX IF NOT EXISTS ai_usage_day ON ai_usage(day, status);
CREATE INDEX IF NOT EXISTS ai_usage_created ON ai_usage(created);
CREATE TABLE IF NOT EXISTS ai_user_limits (uid TEXT PRIMARY KEY, data TEXT NOT NULL);
