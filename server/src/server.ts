import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { initDb, cleanupStaleInstalls } from './db.js';
import { pingRoutes } from './routes/ping.js';
import { adminRoutes } from './routes/admin.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dompetku-dev-session-secret-change-in-production-3827';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173,http://localhost:5174';

// Initialize SQLite database
initDb();

// 1. Initialize Fastify with Privacy-First Zero-IP Logging
const fastify = Fastify({
  bodyLimit: 15 * 1024, // 15 KB strict limit
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          // Intentionally OMIT req.ip, req.headers['x-forwarded-for'], and user-agent
        };
      },
    },
  },
});

// 2. Security Headers via Helmet
await fastify.register(helmet, {
  contentSecurityPolicy: false, // Handled per app
});

// 3. CORS Configuration
const allowedOrigins = ALLOWED_ORIGIN.split(',').map((o) => o.trim());
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return cb(null, true);
    }
    return cb(new Error('CORS origin tidak diizinkan oleh server DompetKu'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
});

// 4. Secure Cookie Plugin
await fastify.register(cookie, {
  secret: SESSION_SECRET,
  parseOptions: {},
});

// 5. In-Memory Rate Limiting (Zero DB footprint)
await fastify.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
  allowList: ['127.0.0.1'],
});

// Health check endpoint
fastify.get('/health', async () => {
  return {
    status: 'ok',
    service: 'dompetku-telemetry-server',
    timestamp: new Date().toISOString(),
  };
});

// 6. Register Routes
await fastify.register(pingRoutes);
await fastify.register(adminRoutes);

// 7. Retention Policy: Daily automatic cleanup of inactive records (> 12 months)
const RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
  try {
    const deletedCount = cleanupStaleInstalls();
    if (deletedCount > 0) {
      fastify.log.info(`[RETENTION] Membersihkan ${deletedCount} data instalasi tidak aktif > 12 bulan.`);
    }
  } catch (err) {
    fastify.log.error(err, '[RETENTION] Gagal menjalankan pembersihan data usang.');
  }
}, RETENTION_INTERVAL_MS);

// 8. Server Start & Graceful Shutdown
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`====================================================`);
    console.log(` DompetKu Privacy Stats Server berjalan di:`);
    console.log(` http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(` Zero-PII: IP Address TIDAK disimpan di database/log.`);
    console.log(`====================================================`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  console.log(`Menerima sinyal ${signal}, menutup server dengan anggun...`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();

