import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { ZodError } from 'zod';
import { authRoutes } from './modules/auth/auth.routes';
import { healthRoutes } from './modules/health/health.routes';
import { AppError } from './errors/appError';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(helmet);
  app.register(cors);

  // Register Modules
  app.register(healthRoutes, { prefix: '/health' });
  app.register(authRoutes, { prefix: '/auth' });

  // Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
    });
  });

  return app;
}