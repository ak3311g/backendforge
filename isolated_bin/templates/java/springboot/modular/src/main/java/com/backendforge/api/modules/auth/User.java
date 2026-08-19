import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service.js';
import { RegisterSchema, LoginSchema } from './auth.schemas.js';
import { authenticate } from '../../middleware/authenticate.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const parsedBody = RegisterSchema.parse(request.body);
    const result = await AuthService.register(parsedBody);
    return reply.status(201).send({ success: true, data: result });
  });

  fastify.post('/login', async (request, reply) => {
    const parsedBody = LoginSchema.parse(request.body);
    const result = await AuthService.login(parsedBody);
    return reply.status(200).send({ success: true, data: result });
  });

  fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    return reply.status(200).send({ success: true, data: { user: request.user } });
  });
}