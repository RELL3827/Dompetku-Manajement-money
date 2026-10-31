import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { insertFeedback } from '../db.js';

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  category: z.string().min(1).max(50),
  message: z.string().min(2).max(2000),
  contact: z.string().max(150).optional(),
  app_version: z.string().max(50).optional(),
  platform: z.enum(['android', 'ios', 'desktop', 'web']).optional(),
});

export const feedbackRoutes: FastifyPluginAsync = async (fastify) => {
  // Public endpoint for submitting app feedback
  fastify.post(
    '/api/feedback',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parsed = feedbackSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: 'Format feedback tidak valid',
          details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
      }

      const id = insertFeedback(parsed.data);

      return reply.status(201).send({
        success: true,
        message: 'Umpan balik berhasil diterima oleh pengembang. Terima kasih!',
        id,
      });
    }
  );
};
