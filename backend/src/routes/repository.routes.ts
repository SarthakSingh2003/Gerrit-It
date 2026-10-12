import { Router, Request, Response } from 'express';
import { getAvailableCategories, classifyRepository } from '../classification/repo.classifier.js';
import { CLASSIFICATION_RULES } from '../classification/rules.js';

const router = Router();

router.get('/classification', (req: Request, res: Response) => {
  const sample = req.query.test as string | undefined;

  const responseData: Record<string, unknown> = {
    categories: getAvailableCategories(),
    rules: CLASSIFICATION_RULES.map((r) => ({
      id: r.id,
      category: r.category,
      pattern: r.pattern.toString()
    }))
  };

  if (sample) {
    responseData.testedRepository = classifyRepository(sample);
  }

  res.json({
    data: responseData,
    meta: {
      source: 'WikiGerritTracker Classifier',
      generatedAt: new Date().toISOString(),
      cached: false,
      stale: false,
      complete: true,
      recordsRetrieved: CLASSIFICATION_RULES.length,
      paginationBudgetHit: false,
      queryExecutionMs: 1,
      warnings: []
    },
    error: null
  });
});

export default router;
