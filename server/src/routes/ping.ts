import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { upsertInstall, deleteInstall } from '../db.js';

// Strict Privacy Payload Schema: Strictly rejects any extraneous properties (no PII, no IP, no names)
const PingPayloadSchema = z
  .object({
    install_id: z.string().uuid({ message: 'install_id harus berupa UUID v4' }),
    app_version: z.string().min(1).max(20),
    platform: z.enum(['android', 'ios', 'desktop', 'web']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' }),
  })
  .strict();

export const pingRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/ping - Receive anonymous opt-in daily ping
  fastify.post(
    '/api/ping',
    {
      config: {
        rateLimit: {
          max: 30, // 30 pings per minute maximum per anonymized client
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parseResult = PingPayloadSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Payload ping tidak valid atau mengandung parameter yang dilarang.',
          issues: parseResult.error.flatten(),
        });
      }

      const { install_id, app_version, platform, date } = parseResult.data;

      // Ensure reported date is not far in the future (max 1 day difference due to timezone)
      const now = new Date();
      const clientDate = new Date(date);
      const diffDays = Math.abs((clientDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 2) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Tanggal ping di luar batas wajar (maksimal selisih 1 hari zona waktu).',
        });
      }

      try {
        upsertInstall({
          install_id,
          app_version,
          platform,
          date,
        });

        return reply.send({
          status: 'ok',
          message: 'Ping opt-in anonim berhasil dicatat.',
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Gagal memproses ping di database.',
        });
      }
    }
  );

  // DELETE /api/install/:id - Permanently erase an install_id upon user request
  fastify.delete('/api/install/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const uuidCheck = z.string().uuid().safeParse(id);
    if (!uuidCheck.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Parameter ID bukan UUID v4 yang valid.',
      });
    }

    try {
      const deleted = deleteInstall(id);
      return reply.send({
        status: 'ok',
        deleted,
        message: deleted
          ? 'Data statistik untuk install_id ini berhasil dihapus secara permanen dari server.'
          : 'Data untuk install_id ini tidak ditemukan atau sudah dihapus sebelumnya.',
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Gagal menghapus data instalasi.',
      });
    }
  });
};

