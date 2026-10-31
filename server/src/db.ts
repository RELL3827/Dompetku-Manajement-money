import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'dompetku_stats.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// High-performance, crash-safe SQLite pragmas
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// Initialize schema
export function initDb() {
  const schemaPath = path.resolve(process.cwd(), 'src', 'schema.sql');
  const schemaSql = fs.existsSync(schemaPath)
    ? fs.readFileSync(schemaPath, 'utf8')
    : `
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
  `;
  db.exec(schemaSql);
}

// Prepared Statements for Performance
const stmtUpsertInstall = db.prepare(`
  INSERT INTO installs (install_id, first_seen, last_seen, app_version, platform)
  VALUES (@install_id, @date, @date, @app_version, @platform)
  ON CONFLICT(install_id) DO UPDATE SET
    last_seen = excluded.last_seen,
    app_version = excluded.app_version,
    platform = excluded.platform,
    updated_at = CURRENT_TIMESTAMP
`);

const stmtDeleteInstall = db.prepare(`
  DELETE FROM installs WHERE install_id = ?
`);

const stmtCleanupStale = db.prepare(`
  DELETE FROM installs
  WHERE last_seen < date('now', '-12 months')
`);

export function upsertInstall(payload: {
  install_id: string;
  app_version: string;
  platform: 'android' | 'ios' | 'desktop' | 'web';
  date: string;
}) {
  return stmtUpsertInstall.run(payload);
}

export function deleteInstall(install_id: string) {
  const result = stmtDeleteInstall.run(install_id);
  return result.changes > 0;
}

export function cleanupStaleInstalls() {
  const res = stmtCleanupStale.run();
  return res.changes;
}

export interface StatsTimelineItem {
  date: string;
  count: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  metrics: {
    totalInstalls: number;
    dau: number;
    wau: number;
    mau: number;
    retention7Days: {
      eligible: number;
      retained: number;
      percentage: number;
    };
    retention30Days: {
      eligible: number;
      retained: number;
      percentage: number;
    };
  };
  charts: {
    newInstallsTimeline: StatsTimelineItem[];
    activeInstallsTimeline: StatsTimelineItem[];
    versionDistribution: DistributionItem[];
    platformDistribution: DistributionItem[];
  };
  generatedAt: string;
  periodDays: number | 'all';
}

export function getDashboardStats(periodDays: number | 'all' = 30): DashboardStats {
  // 1. High level counters
  const totalInstalls = (db.prepare('SELECT COUNT(*) as count FROM installs').get() as { count: number }).count;
  
  // DAU: Active today (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);
  const dau = (db.prepare('SELECT COUNT(*) as count FROM installs WHERE last_seen = ?').get(today) as { count: number }).count;

  // WAU: Active in last 7 days
  const wau = (db.prepare("SELECT COUNT(*) as count FROM installs WHERE last_seen >= date('now', '-7 days')").get() as { count: number }).count;

  // MAU: Active in last 30 days
  const mau = (db.prepare("SELECT COUNT(*) as count FROM installs WHERE last_seen >= date('now', '-30 days')").get() as { count: number }).count;

  // 2. Retention calculation
  // 7-day retention: installs where first_seen was >= 7 days ago, how many were still active >= 7 days after first_seen
  const ret7Query = db.prepare(`
    SELECT
      COUNT(*) as eligible,
      SUM(CASE WHEN CAST(strftime('%J', last_seen) - strftime('%J', first_seen) AS INT) >= 7 THEN 1 ELSE 0 END) as retained
    FROM installs
    WHERE first_seen <= date('now', '-7 days')
  `).get() as { eligible: number; retained: number | null };

  const eligible7 = ret7Query?.eligible || 0;
  const retained7 = ret7Query?.retained || 0;
  const pct7 = eligible7 > 0 ? Math.round((retained7 / eligible7) * 1000) / 10 : 0;

  // 30-day retention
  const ret30Query = db.prepare(`
    SELECT
      COUNT(*) as eligible,
      SUM(CASE WHEN CAST(strftime('%J', last_seen) - strftime('%J', first_seen) AS INT) >= 30 THEN 1 ELSE 0 END) as retained
    FROM installs
    WHERE first_seen <= date('now', '-30 days')
  `).get() as { eligible: number; retained: number | null };

  const eligible30 = ret30Query?.eligible || 0;
  const retained30 = ret30Query?.retained || 0;
  const pct30 = eligible30 > 0 ? Math.round((retained30 / eligible30) * 1000) / 10 : 0;

  // 3. Timelines with period filter
  let dateConditionFirst = '';
  let dateConditionLast = '';
  if (typeof periodDays === 'number') {
    dateConditionFirst = `WHERE first_seen >= date('now', '-${periodDays} days')`;
    dateConditionLast = `WHERE last_seen >= date('now', '-${periodDays} days')`;
  }

  const newInstallsTimeline = db.prepare(`
    SELECT first_seen as date, COUNT(*) as count
    FROM installs
    ${dateConditionFirst}
    GROUP BY first_seen
    ORDER BY first_seen ASC
  `).all() as StatsTimelineItem[];

  const activeInstallsTimeline = db.prepare(`
    SELECT last_seen as date, COUNT(*) as count
    FROM installs
    ${dateConditionLast}
    GROUP BY last_seen
    ORDER BY last_seen ASC
  `).all() as StatsTimelineItem[];

  // 4. Distributions
  const totalInFilter = totalInstalls > 0 ? totalInstalls : 1;

  const rawVersions = db.prepare(`
    SELECT app_version as name, COUNT(*) as count
    FROM installs
    GROUP BY app_version
    ORDER BY count DESC
  `).all() as { name: string; count: number }[];

  const versionDistribution: DistributionItem[] = rawVersions.map((v) => ({
    name: v.name,
    count: v.count,
    percentage: Math.round((v.count / totalInFilter) * 1000) / 10,
  }));

  const rawPlatforms = db.prepare(`
    SELECT platform as name, COUNT(*) as count
    FROM installs
    GROUP BY platform
    ORDER BY count DESC
  `).all() as { name: string; count: number }[];

  const platformDistribution: DistributionItem[] = rawPlatforms.map((p) => ({
    name: p.name,
    count: p.count,
    percentage: Math.round((p.count / totalInFilter) * 1000) / 10,
  }));

  return {
    metrics: {
      totalInstalls,
      dau,
      wau,
      mau,
      retention7Days: {
        eligible: eligible7,
        retained: retained7,
        percentage: pct7,
      },
      retention30Days: {
        eligible: eligible30,
        retained: retained30,
        percentage: pct30,
      },
    },
    charts: {
      newInstallsTimeline,
      activeInstallsTimeline,
      versionDistribution,
      platformDistribution,
    },
    generatedAt: new Date().toISOString(),
    periodDays,
  };
}
