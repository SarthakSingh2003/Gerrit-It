import { Router, Request, Response } from 'express';
import { getCacheService } from '../cache/index.js';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const cache = getCacheService();
  const cacheStats = cache.getStats();

  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Gerrit-It Backend',
    version: '1.0.0',
    cache: {
      type: cacheStats.type,
      healthy: cacheStats.isHealthy,
      itemsTracked: cacheStats.size
    }
  });
});

router.get('/version', (_req: Request, res: Response) => {
  res.json({
    name: 'Gerrit-It',
    version: '1.0.0',
    license: 'GPL-3.0-or-later',
    docs: 'https://doc.wikimedia.org/codex/',
    upstreamGerrit: 'https://gerrit.wikimedia.org/r/'
  });
});

export default router;
