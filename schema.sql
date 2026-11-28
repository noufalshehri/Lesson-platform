-- D1 schema for the Madbout lesson platform
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  pass TEXT NOT NULL,
  created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_uid ON sessions(uid);
CREATE TABLE IF NOT EXISTS docs (
  path TEXT PRIMARY KEY,
  coll TEXT NOT NULL,
  data TEXT NOT NULL,
  updated TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS docs_coll ON docs(coll);
CREATE TABLE IF NOT EXISTS limits (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  since INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  module TEXT NOT NULL,        -- presentation | lesson | quiz | game | worksheet | prep | test
  kind TEXT NOT NULL,          -- gen | regen | test
  bucket TEXT NOT NULL,        -- quota bucket: the module name, or 'regen'
  day TEXT NOT NULL,           -- Saudi date YYYY-MM-DD (quota day)
  status TEXT NOT NULL,        -- pending | ok | fail
  err TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  tin INTEGER NOT NULL DEFAULT 0,
  tout INTEGER NOT NULL DEFAULT 0,
  ms INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ai_usage_user_day ON ai_usage(uid, day, bucket, status);
CREATE INDEX IF NOT EXISTS ai_usage_day ON ai_usage(day, status);
CREATE INDEX IF NOT EXISTS ai_usage_created ON ai_usage(created);
CREATE TABLE IF NOT EXISTS ai_user_limits (
  uid TEXT PRIMARY KEY,
  data TEXT NOT NULL
);
