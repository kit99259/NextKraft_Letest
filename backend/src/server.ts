import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const PORT = env.server.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${env.server.nodeEnv}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
});
