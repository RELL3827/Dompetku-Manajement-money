// Vercel Serverless Function: GET /api/stats
// Mengambil agregat statistik total user dan pengguna aktif untuk Admin Panel

const COUNTER_NAMESPACE = 'dompetku-farel-official';

async function getCounterValue(key: string, defaultVal: number = 0): Promise<number> {
  // 1. Cek jika developer mengonfigurasi Upstash Redis / Vercel KV
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      });
      const data = await res.json();
      const val = parseInt(data?.result, 10);
      return !isNaN(val) ? val : defaultVal;
    } catch {
      // fallback
    }
  }

  // 2. Free persistent cloud counter API
  try {
    const res = await fetch(`https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: { 'User-Agent': 'DompetKu-Dev-Serverless/1.2' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.count === 'number') {
        return data.count;
      }
    }
  } catch {
    // fallback
  }

  return defaultVal;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Ambil semua counter secara paralel
    const [totalUsers, activeToday, androidUsers, iosUsers, desktopUsers] = await Promise.all([
      getCounterValue('total_users', 1),
      getCounterValue(`active_${today}`, 1),
      getCounterValue('device_android', 0),
      getCounterValue('device_ios', 0),
      getCounterValue('device_desktop', 0),
    ]);

    const totalDevices = androidUsers + iosUsers + desktopUsers || totalUsers || 1;

    return res.status(200).json({
      success: true,
      app: 'DompetKu',
      developer: 'Farel Rizky P',
      version: 'v1.2.0',
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers: Math.max(1, totalUsers),
        activeToday: Math.max(1, activeToday),
        devices: {
          android: androidUsers,
          ios: iosUsers,
          desktop: desktopUsers,
          percentage: {
            android: Math.round((androidUsers / totalDevices) * 100) || 60,
            ios: Math.round((iosUsers / totalDevices) * 100) || 25,
            desktop: Math.round((desktopUsers / totalDevices) * 100) || 15,
          },
        },
      },
      status: 'online',
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      message: 'Gagal mengambil data live, menggunakan fallback lokal',
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
      error: err?.message,
    });
  }
}
