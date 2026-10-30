/**
 * Layanan Telemetri Anonim & Client Statistik Pengembang DompetKu
 * 100% Zero-PII: Tidak menyimpan IP, tidak melacak nama, tidak merekam transaksi finansial.
 */

export interface AdminStatsMetrics {
  totalUsers: number;
  activeToday: number;
  devices: {
    android: number;
    ios: number;
    desktop: number;
    percentage: {
      android: number;
      ios: number;
      desktop: number;
    };
  };
}

export interface AdminStatsResponse {
  success: boolean;
  app: string;
  developer: string;
  version: string;
  timestamp: string;
  metrics: AdminStatsMetrics;
  status: 'online' | 'offline' | 'cached';
  error?: string;
}

export function detectDevicePlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  return 'desktop';
}

/**
 * Kirim ping instalasi (1x selamanya per perangkat) dan ping aktif harian
 */
export async function sendAnonymousTelemetryPing(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const device = detectDevicePlatform();
  const today = new Date().toISOString().split('T')[0];

  const hasPingedInstall = localStorage.getItem('dompetku_installed_ping');
  const lastActiveDate = localStorage.getItem('dompetku_daily_ping');

  try {
    // 1. Ping Instalasi Pertama Kali
    if (!hasPingedInstall) {
      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'install', device }),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        localStorage.setItem('dompetku_installed_ping', new Date().toISOString());
      }
    }

    // 2. Ping Pengguna Aktif Hari Ini (Hanya 1x per hari)
    if (lastActiveDate !== today) {
      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'active', device }),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        localStorage.setItem('dompetku_daily_ping', today);
      }
    }
  } catch {
    // Abaikan jika offline / koneksi timeout
  }
}

/**
 * Ambil data statistik dari /api/stats untuk Admin Panel
 */
export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  const fallbackData: AdminStatsResponse = {
    success: true,
    app: 'DompetKu',
    developer: 'Farel Rizky P',
    version: 'v1.2.0',
    timestamp: new Date().toISOString(),
    metrics: {
      totalUsers: 1,
      activeToday: 1,
      devices: {
        android: 1,
        ios: 0,
        desktop: 0,
        percentage: { android: 100, ios: 0, desktop: 0 },
      },
    },
    status: 'cached',
  };

  if (!navigator.onLine) {
    return { ...fallbackData, status: 'offline', error: 'Perangkat sedang offline' };
  }

  try {
    const res = await fetch('/api/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data: AdminStatsResponse = await res.json();
      return data;
    }
  } catch (err: any) {
    return { ...fallbackData, status: 'offline', error: err?.message };
  }

  return fallbackData;
}

/**
 * Tes ping manual khusus pengembang dari dalam Admin Panel
 */
export async function testManualPing(): Promise<{ success: boolean; message: string }> {
  try {
    const device = detectDevicePlatform();
    const res = await fetch('/api/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'active', device }),
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'Ping serverless berhasil!' };
    }
    return { success: false, message: `Server merespon dengan status ${res.status}` };
  } catch (err: any) {
    return { success: false, message: `Gagal ping: ${err.message}` };
  }
}
