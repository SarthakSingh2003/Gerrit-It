import { Router, Request, Response, NextFunction } from 'express';
import { cohortService } from '../services/cohort.service.js';
import { cohortBodySchema } from '../validation/schemas.js';

const router = Router();

router.post(
  '/analyze',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = cohortBodySchema.parse(req.body);

      const result = await cohortService.analyzeCohort(body.identifiers, {
        preset: body.preset,
        startDate: body.startDate,
        endDate: body.endDate
      });

      res.json({
        data: result,
        meta: {
          source: 'Wikimedia Gerrit Cohort Analytics',
          generatedAt: result.generatedAt,
          cached: false,
          stale: false,
          complete: result.cohortTotals.unresolvedMembers === 0,
          recordsRetrieved: result.cohortTotals.totalMembers,
          paginationBudgetHit: false,
          queryExecutionMs: 100,
          warnings:
            result.cohortTotals.unresolvedMembers > 0
              ? [`${result.cohortTotals.unresolvedMembers} members could not be resolved in Gerrit`]
              : []
        },
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
