import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  checkLoginBruteForce,
  recordLoginFailure,
  resetLoginFailure,
  verifyAdminPassword,
  createSessionToken,
  requireAdminAuth,
} from '../auth.js';
import { getDashboardStats } from '../db.js';

const LoginSchema = z.object({
  password: z.string().min(1, 'Password wajib diisi'),
});

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/admin/login
  fastify.post('/api/admin/login', async (request, reply) => {
    // 1. Check brute force protection
    const bruteStatus = checkLoginBruteForce(request);
    if (!bruteStatus.allowed) {
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${bruteStatus.waitMinutes} menit.`,
      });
    }

    // 2. Validate input
    const bodyResult = LoginSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Format data login tidak valid.',
      });
    }

    const { password } = bodyResult.data;

    // 3. Verify password
    const isMatch = await verifyAdminPassword(password);
    if (!isMatch) {
      recordLoginFailure(request);
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Password admin tidak cocok.',
      });
    }

    // Reset failure counter on success
    resetLoginFailure(request);

    // 4. Issue session cookie
    const token = createSessionToken('admin');
    const isProd = process.env.NODE_ENV === 'production';

    reply.setCookie('admin_session', token, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return reply.send({
      status: 'ok',
      message: 'Login berhasil.',
      user: 'admin',
    });
  });

  // POST /api/admin/logout
  fastify.post('/api/admin/logout', async (_request, reply) => {
    reply.clearCookie('admin_session', { path: '/' });
    return reply.send({
      status: 'ok',
      message: 'Sesi admin telah ditutup.',
    });
  });

  // GET /api/admin/me - Check current auth session
  fastify.get('/api/admin/me', { preHandler: requireAdminAuth }, async (_request, reply) => {
    return reply.send({
      status: 'ok',
      user: 'admin',
    });
  });

  // GET /api/admin/stats - Retrieve aggregated privacy-friendly metrics
  fastify.get(
    '/api/admin/stats',
    {
      preHandler: requireAdminAuth,
    },
    async (request, reply) => {
      const { period } = request.query as { period?: string };

      let periodDays: number | 'all' = 30;
      if (period === '7d') periodDays = 7;
      else if (period === '30d') periodDays = 30;
      else if (period === '90d') periodDays = 90;
      else if (period === 'all') periodDays = 'all';

      const stats = getDashboardStats(periodDays);
      return reply.send(stats);
    }
  );

  // GET /api/admin/export-csv - Export aggregate metrics to CSV
  fastify.get(
    '/api/admin/export-csv',
    {
      preHandler: requireAdminAuth,
    },
    async (request, reply) => {
      const stats = getDashboardStats('all');

      let csv = 'Tanggal,Instalasi Baru (Opt-in),Pengguna Aktif (Opt-in)\n';
      const allDates = new Set<string>();

      stats.charts.newInstallsTimeline.forEach((t) => allDates.add(t.date));
      stats.charts.activeInstallsTimeline.forEach((t) => allDates.add(t.date));

      const sortedDates = Array.from(allDates).sort();
      const newMap = new Map(stats.charts.newInstallsTimeline.map((i) => [i.date, i.count]));
      const actMap = new Map(stats.charts.activeInstallsTimeline.map((i) => [i.date, i.count]));

      for (const d of sortedDates) {
        csv += `${d},${newMap.get(d) || 0},${actMap.get(d) || 0}\n`;
      }

      reply.header('Content-Type', 'text/csv; charset=utf-8');
      reply.header('Content-Disposition', 'attachment; filename="dompetku_stats_aggregate.csv"');
      return reply.send(csv);
    }
  );
};
