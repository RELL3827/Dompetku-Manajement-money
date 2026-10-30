// Vercel Serverless Function: POST /api/ping
// Catat instalasi baru dan pengguna aktif harian secara 100% anonim (tanpa IP, tanpa nama, tanpa data pribadi)

interface PingPayload {
  type?: 'install' | 'active';
  device?: 'android' | 'ios' | 'desktop';
}

const COUNTER_NAMESPACE = 'dompetku-farel-official';

async function incrementCounter(key: string): Promise<number | null> {
  // 1. Cek jika developer mengonfigurasi Upstash Redis / Vercel KV
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/incr/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      });
      const data = await res.json();
      return typeof data?.result === 'number' ? data.result : null;
    } catch {
      // fallback ke public counter
    }
  }

  // 2. Free persistent cloud counter API (Zero configuration needed)
  try {
    const res = await fetch(`https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${encodeURIComponent(key)}/up`, {
      method: 'GET',
      headers: { 'User-Agent': 'DompetKu-Dev-Serverless/1.2' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      return typeof data?.count === 'number' ? data.count : null;
    }
  } catch {
    // Graceful fallback
  }

  return null;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers for safe same-origin / preview
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let payload: PingPayload = {};

    if (req.method === 'POST') {
      if (typeof req.body === 'string') {
        try {
          payload = JSON.parse(req.body);
        } catch {
          payload = {};
        }
      } else if (req.body && typeof req.body === 'object') {
        payload = req.body;
      }
    } else {
      // Support query param for testing / GET
      payload = {
        type: req.query?.type === 'active' ? 'active' : 'install',
        device: req.query?.device || 'desktop',
      };
    }

    const type = payload.type || 'install';
    const device = payload.device || 'desktop';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let updatedCount: number | null = null;

    if (type === 'install') {
      // Catat total user / instalasi baru
      updatedCount = await incrementCounter('total_users');
      // Catat perangkat
      await incrementCounter(`device_${device}`);
    } else {
      // Catat pengguna aktif hari ini
      updatedCount = await incrementCounter(`active_${today}`);
    }

    return res.status(200).json({
      success: true,
      type,
      device,
      timestamp: new Date().toISOString(),
      currentCount: updatedCount,
      message: 'Ping pengguna anonim berhasil dicatat',
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      message: 'Ping gagal diproses tapi aplikasi tetap berfungsi offline',
      error: err?.message,
    });
  }
}
