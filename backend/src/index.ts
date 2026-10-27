import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './logger/logger.js';

const app = createApp();

app.listen(env.PORT, env.HOST, () => {
  logger.info(`Gerrit-It backend server running on http://${env.HOST}:${env.PORT}`, {
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
    gerritBaseUrl: env.GERRIT_BASE_URL
  });
});
