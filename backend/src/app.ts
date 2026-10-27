import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { logger } from './logger/logger.js';
import healthRoutes from './routes/health.routes.js';
import contributorRoutes from './routes/contributor.routes.js';
import repositoryRoutes from './routes/repository.routes.js';
import cohortRoutes from './routes/cohort.routes.js';
import fixtureRoutes from './routes/fixture.routes.js';
import { AccountResolutionError } from './gerrit/identity.resolver.js';

export function createApp(): express.Application {
  const app = express();

  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  app.use((req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + env.RATE_LIMIT_WINDOW_MS };
      requestCounts.set(ip, record);
    } else {
      record.count++;
      if (record.count > env.RATE_LIMIT_MAX_REQUESTS) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`);
        res.status(429).json({
          data: null,
          meta: {
            source: 'Gerrit-It',
            generatedAt: new Date().toISOString(),
            cached: false,
            stale: false,
            complete: false,
            recordsRetrieved: 0,
            paginationBudgetHit: false,
            queryExecutionMs: 0,
            warnings: ['Rate limit exceeded. Please wait before retrying.']
          },
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please retry in a few moments.'
          }
        });
        return;
      }
    }
    next();
  });

  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? true : env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '1mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode} [${duration}ms]`, {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: duration
      });
    });
    next();
  });

  app.use('/api', healthRoutes);
  app.use('/api/contributors', contributorRoutes);
  app.use('/api/repositories', repositoryRoutes);
  app.use('/api/cohorts', cohortRoutes);
  app.use('/api/fixtures', fixtureRoutes);

  const candidateDistPaths = [
    path.resolve(process.cwd(), 'frontend', 'dist'),
    path.resolve(process.cwd(), '..', 'frontend', 'dist'),
    fileURLToPath(new URL('../../frontend/dist', import.meta.url))
  ];
  const frontendDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

  if (frontendDistPath) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }

  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      data: null,
      meta: {
        source: 'Gerrit-It',
        generatedAt: new Date().toISOString(),
        cached: false,
        stale: false,
        complete: false,
        recordsRetrieved: 0,
        paginationBudgetHit: false,
        queryExecutionMs: 0,
        warnings: []
      },
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: `API endpoint '${req.originalUrl}' not found`
      }
    });
  });

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled request error', { path: req.path }, err);

    if (err instanceof ZodError) {
      res.status(400).json({
        data: null,
        meta: {
          source: 'Gerrit-It',
          generatedAt: new Date().toISOString(),
          cached: false,
          stale: false,
          complete: false,
          recordsRetrieved: 0,
          paginationBudgetHit: false,
          queryExecutionMs: 0,
          warnings: []
        },
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request input',
          details: err.errors
        }
      });
      return;
    }

    if (err instanceof AccountResolutionError) {
      const statusCode = err.code === 'ACCOUNT_NOT_FOUND' ? 404 : 400;
      res.status(statusCode).json({
        data: null,
        meta: {
          source: 'Wikimedia Gerrit Accounts',
          generatedAt: new Date().toISOString(),
          cached: false,
          stale: false,
          complete: false,
          recordsRetrieved: 0,
          paginationBudgetHit: false,
          queryExecutionMs: 0,
          warnings: []
        },
        error: {
          code: err.code,
          message: err.message,
          details: err.candidates ? { candidates: err.candidates } : undefined
        }
      });
      return;
    }

    res.status(500).json({
      data: null,
      meta: {
        source: 'Gerrit-It',
        generatedAt: new Date().toISOString(),
        cached: false,
        stale: false,
        complete: false,
        recordsRetrieved: 0,
        paginationBudgetHit: false,
        queryExecutionMs: 0,
        warnings: []
      },
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while processing the request. Upstream Gerrit service may be experiencing high load.'
      }
    });
  });

  return app;
}
