import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RegisterSchema, LoginSchema } from './auth.schemas';
import { AuthService } from './auth.service';
import { authenticate } from '../../middleware/authenticate';

const app = new Hono();

app.post('/register', zValidator('json', RegisterSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await AuthService.register(body);
  return c.json({ success: true, data: result }, 201);
});

app.post('/login', zValidator('json', LoginSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await AuthService.login(body);
  return c.json({ success: true, data: result }, 200);
});

app.get('/me', authenticate, async (c) => {
  const user = c.get('user');
  return c.json({ success: true, data: { user } }, 200);
});

export const authRoutes = app;