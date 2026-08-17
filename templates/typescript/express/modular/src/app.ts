import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './modules/auth/auth.routes';
import { healthRoutes } from './modules/health/health.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Module registration
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;