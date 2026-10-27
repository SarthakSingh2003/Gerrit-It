import { Router, Request, Response, NextFunction } from 'express';
import { contributorService } from '../services/contributor.service.js';
import { ReportService } from '../services/report.service.js';
import {
  identifierParamSchema,
  dateQuerySchema,
  reportQuerySchema,
  changesQuerySchema
} from '../validation/schemas.js';

const router = Router();

router.get(
  '/:identifier',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = identifierParamSchema.parse(req.params);
      const account = await contributorService.resolveAccount(identifier);

      res.json({
        data: {
          accountId: account._account_id,
          username: account.username,
          displayName: account.name || account.username || `User #${account._account_id}`,
          registeredOn: account.registered_on,
          statusText: account.status,
          gerritProfileUrl: `https://gerrit.wikimedia.org/r/q/owner:${account._account_id}`
        },
        meta: {
          source: 'Wikimedia Gerrit Accounts',
          generatedAt: new Date().toISOString(),
          cached: false,
          stale: false,
          complete: true,
          recordsRetrieved: 1,
          paginationBudgetHit: false,
          queryExecutionMs: 10,
          warnings: []
        },
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:identifier/summary',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = identifierParamSchema.parse(req.params);
      const dateQuery = dateQuerySchema.parse(req.query);

      const { summary } = await contributorService.getContributorSummary(identifier, dateQuery);

      res.json({
        data: summary,
        meta: summary.metadata,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:identifier/repositories',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = identifierParamSchema.parse(req.params);
      const dateQuery = dateQuerySchema.parse(req.query);

      const repositories = await contributorService.getRepositoryStats(identifier, dateQuery);

      res.json({
        data: repositories,
        meta: {
          source: 'Wikimedia Gerrit',
          generatedAt: new Date().toISOString(),
          cached: false,
          stale: false,
          complete: true,
          recordsRetrieved: repositories.length,
          paginationBudgetHit: false,
          queryExecutionMs: 10,
          warnings: []
        },
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:identifier/changes',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = identifierParamSchema.parse(req.params);
      const query = changesQuerySchema.parse(req.query);

      const allChanges = await contributorService.getNormalizedChanges(
        identifier,
        {
          preset: query.preset,
          startDate: query.startDate,
          endDate: query.endDate
        },
        query.type
      );

      const offset = query.offset || 0;
      const limit = query.limit || 100;
      const paged = allChanges.slice(offset, offset + limit);

      res.json({
        data: {
          changes: paged,
          total: allChanges.length,
          offset,
          limit,
          hasMore: offset + limit < allChanges.length
        },
        meta: {
          source: 'Wikimedia Gerrit',
          generatedAt: new Date().toISOString(),
          cached: false,
          stale: false,
          complete: true,
          recordsRetrieved: paged.length,
          paginationBudgetHit: false,
          queryExecutionMs: 15,
          warnings: []
        },
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:identifier/reviews',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = identifierParamSchema.parse(req.params);
      const dateQuery = dateQuerySchema.parse(req.query);

      const { summary } = await contributorService.getContributorSummary(identifier, dateQuery);
      const reviewChanges = await contributorService.getNormalizedChanges(
        identifier,
        dateQuery,
        'reviewed'
      );

      res.json({
        data: {
          metrics: summary.reviews,
          changesSample: reviewChanges.slice(0, 50),
          totalReviewed: reviewChanges.length
        },
        meta: summary.metadata,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:identifier/report',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = identifierParamSchema.parse(req.params);
      const query = reportQuerySchema.parse(req.query);

      const { summary } = await contributorService.getContributorSummary(identifier, {
        preset: query.preset,
        startDate: query.startDate,
        endDate: query.endDate
      });

      const repos = await contributorService.getRepositoryStats(identifier, {
        preset: query.preset,
        startDate: query.startDate,
        endDate: query.endDate
      });

      const markdown = ReportService.generateMarkdownReport(summary, repos, {
        includeRepositories: query.includeRepositories,
        maxRepositoriesInTable: query.maxRepositories
      });

      if (query.format === 'markdown') {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `inline; filename="gerrit-it-report-${summary.contributor.username || summary.contributor.accountId}.md"`
        );
        res.send(markdown);
        return;
      }

      res.json({
        data: {
          markdown,
          summary,
          topRepositories: repos.slice(0, query.maxRepositories)
        },
        meta: summary.metadata,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
