import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() };
  });
}