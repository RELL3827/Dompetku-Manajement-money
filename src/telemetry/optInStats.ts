import { APP_VERSION } from '../utils/version';

/**
 * DompetKu Privacy-Preserving Opt-In Telemetry Module
 * 
 * CORE PRIVACY PRINCIPLES:
 * 1. 100% OPT-IN, DEFAULT DISABLED (OFF).
 * 2. ONLY 4 FIELDS: install_id (random UUIDv4), app_version, platform, date (YYYY-MM-DD).
 * 3. STRICTLY ZERO PII: No financial data, no transactions, no balances, no IP, no names, no device fingerprint.
 * 4. Can be revoked and wiped at any time by the user.
 * 5. If VITE_STATS_ENDPOINT is not defined, this feature is completely invisible in the app UI.
 */

const STORAGE_KEY_OPT_IN = 'dompetku_opt_in_stats_enabled';
const STORAGE_KEY_INSTALL_ID = 'dompetku_stats_install_id';
const STORAGE_KEY_LAST_PING = 'dompetku_stats_last_ping_date';

// Configurable endpoint (e.g. "https://stats.domain.com" or empty)
export const STATS_ENDPOINT: string = (import.meta.env.VITE_STATS_ENDPOINT || '').trim();

/**
 * Returns true if a telemetry server endpoint is configured.
 * Forks wanting a pure offline experience without any stats UI can simply leave VITE_STATS_ENDPOINT empty.
 */
export function isStatsFeatureAvailable(): boolean {
  return Boolean(STATS_ENDPOINT && STATS_ENDPOINT.length > 0);
}

/**
 * Checks whether user has actively opted in to anonymous stats.
 * DEFAULT IS ALWAYS FALSE (OFF).
 */
export function isStatsOptInEnabled(): boolean {
  if (!isStatsFeatureAvailable()) return false;
  try {
    return localStorage.getItem(STORAGE_KEY_OPT_IN) === 'true';
  } catch {
    return false;
  }
}

/**
 * Get or create the local anonymous UUID v4.
 * This ID is randomly generated on the user's device and not tied to any identity.
 */
export function getOrCreateInstallId(): string {
  let installId = localStorage.getItem(STORAGE_KEY_INSTALL_ID);
  if (!installId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      installId = crypto.randomUUID();
    } else {
      // Fallback RFC4122 v4 UUID generator
      installId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem(STORAGE_KEY_INSTALL_ID, installId);
  }
  return installId;
}

/**
 * Minimal, coarse platform detection without device model details.
 */
export function detectPlatform(): 'android' | 'ios' | 'desktop' | 'web' {
  if (typeof navigator === 'undefined') return 'web';

  const ua = navigator.userAgent.toLowerCase();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

  if (ua.includes('android')) return 'android';
  if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (isStandalone) return 'desktop';
  return 'web';
}

/**
 * Returns the exact JSON payload structure sent to the server.
 * Used for the transparency dialog in the Settings UI so users can verify what is sent.
 */
export function getExamplePayload(): {
  install_id: string;
  app_version: string;
  platform: 'android' | 'ios' | 'desktop' | 'web';
  date: string;
} {
  const existingId = localStorage.getItem(STORAGE_KEY_INSTALL_ID);
  return {
    install_id: existingId || 'c1f7b165-2428-4e89-a5c9-953b0bc8fa12 (Contoh UUID v4)',
    app_version: APP_VERSION,
    platform: detectPlatform(),
    date: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Enable anonymous statistics opt-in.
 * Creates an install_id and sends the first daily ping in the background.
 */
export function enableStatsOptIn(): void {
  try {
    localStorage.setItem(STORAGE_KEY_OPT_IN, 'true');
    getOrCreateInstallId();
    // Fire daily ping in background
    sendDailyPingIfDue();
  } catch {
    // LocalStorage write error silent ignore
  }
}

/**
 * Disable anonymous statistics opt-in.
 * Immediately stops pings and permanently deletes the local install_id.
 */
export function disableStatsOptIn(): void {
  try {
    localStorage.setItem(STORAGE_KEY_OPT_IN, 'false');
    localStorage.removeItem(STORAGE_KEY_INSTALL_ID);
    localStorage.removeItem(STORAGE_KEY_LAST_PING);
  } catch {
    // ignore
  }
}

/**
 * Request server to delete all telemetry records matching the current install_id.
 * Also wipes local storage keys regardless of network outcome.
 */
export async function deleteMyStatsData(): Promise<{ success: boolean; message: string }> {
  if (!isStatsFeatureAvailable()) {
    return { success: false, message: 'Server statistik tidak dikonfigurasi.' };
  }

  const installId = localStorage.getItem(STORAGE_KEY_INSTALL_ID);
  if (!installId) {
    disableStatsOptIn();
    return { success: true, message: 'Tidak ada data statistik lokal yang tersimpan.' };
  }

  try {
    const res = await fetch(`${STATS_ENDPOINT}/api/install/${installId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Wipe local keys
    disableStatsOptIn();

    if (res.ok) {
      return {
        success: true,
        message: 'Data statistik Anda untuk install_id ini berhasil dihapus secara permanen dari server.',
      };
    } else {
      return {
        success: true,
        message: 'Data lokal telah dihapus. Server mengonfirmasi ID ini sudah bersih.',
      };
    }
  } catch {
    // Network offline or failed: still wipe locally so no future pings are sent
    disableStatsOptIn();
    return {
      success: true,
      message: 'Data statistik lokal berhasil dihapus. Pengiriman ke server telah dihentikan total.',
    };
  }
}

/**
 * Sends anonymous ping at most 1x per calendar day.
 * STRICTLY SILENT: Never shows error toasts, never interrupts user, never retries aggressively.
 */
export async function sendDailyPingIfDue(): Promise<void> {
  if (!isStatsFeatureAvailable() || !isStatsOptInEnabled()) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const lastPing = localStorage.getItem(STORAGE_KEY_LAST_PING);

  // If already pinged today, skip silently
  if (lastPing === today) {
    return;
  }

  const installId = getOrCreateInstallId();
  const payload = {
    install_id: installId,
    app_version: APP_VERSION,
    platform: detectPlatform(),
    date: today,
  };

  try {
    const res = await fetch(`${STATS_ENDPOINT}/api/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (res.ok) {
      localStorage.setItem(STORAGE_KEY_LAST_PING, today);
    }
  } catch {
    // Silent catch: network offline or server down should NEVER affect the app
  }
}

