import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Express server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
});