import { FastifyReply, FastifyRequest } from 'fastify';
import * as jose from 'jose';
import { env } from '../config/env';
import { AppError } from '../errors/appError';

export interface UserPayload {
  id: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized: Missing or invalid token', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    request.user = { id: payload.sub as string, email: payload.email as string };
  } catch {
    throw new AppError('Unauthorized: Token invalid or expired', 401);
  }
}