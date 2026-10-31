-- DompetKu Privacy-Preserving Opt-In Telemetry Database Schema
-- No IP addresses, no user personal data, no financial records are ever stored here.

CREATE TABLE IF NOT EXISTS installs (
  install_id TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('android', 'ios', 'desktop', 'web')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_installs_first_seen ON installs(first_seen);
CREATE INDEX IF NOT EXISTS idx_installs_last_seen ON installs(last_seen);
CREATE INDEX IF NOT EXISTS idx_installs_platform ON installs(platform);
CREATE INDEX IF NOT EXISTS idx_installs_app_version ON installs(app_version);

-- Optional Aggregated Daily Stats Cache Table (for ultra-fast reporting across millions of entries)
CREATE TABLE IF NOT EXISTS daily_aggregates (
  stat_date TEXT PRIMARY KEY,
  active_count INTEGER NOT NULL DEFAULT 0,
  new_count INTEGER NOT NULL DEFAULT 0,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
