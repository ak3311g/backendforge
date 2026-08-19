import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { authRoutes } from './modules/auth/auth.routes';
import { healthRoutes } from './modules/health/health.routes';
import { AppError } from './errors/appError';

export const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors());

// Routes
app.route('/health', healthRoutes);
app.route('/auth', authRoutes);

// Error Handling
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, message: err.message }, err.statusCode as any);
  }
  console.error('Unhandled Error:', err);
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});