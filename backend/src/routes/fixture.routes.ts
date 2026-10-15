import { Router, Request, Response } from 'express';
import { ContributorSummaryResponse } from '../analytics/types.js';

const router = Router();

export const SAMPLE_CONTRIBUTOR_SUMMARY: ContributorSummaryResponse = {
  contributor: {
    accountId: 458,
    username: 'legoktm',
    displayName: 'Legoktm',
    registeredOn: '2016-07-25 01:42:27.000000000',
    statusText: 'Core Contributor',
    gerritProfileUrl: 'https://gerrit.wikimedia.org/r/q/owner:458'
  },
  authored: {
    totalAuthored: 124,
    merged: 98,
    open: 14,
    abandoned: 12,
    uniqueRepositories: 18,
    firstRecordedDate: '2016-08-10 14:22:01.000000000',
    lastRecordedDate: '2026-05-21 06:51:39.000000000',
    totalInsertions: 14820,
    totalDeletions: 9410
  },
  reviews: {
    distinctChangesReviewed: 86,
    approvalsCount: 38,
    verifiedCount: 29,
    recommendationsCount: 31,
    critiquesCount: 12,
    uniqueReviewRepositories: 14,
    firstRecordedReviewDate: '2016-09-02 09:12:00.000000000',
    lastRecordedReviewDate: '2026-06-11 15:40:22.000000000',
    mentorshipDisclaimer:
      'Code reviews indicate technical collaboration and peer review support across repositories. Review volume alone does not prove or establish formal mentorship.',
    limitationsNote:
      'Aggregated from Gerrit REST change search results with LABELS. Unrecorded review updates, patch-set comments without votes, or changes beyond pagination safety limits are not counted.'
  },
  categoryBreakdown: [
    { category: 'Extension', count: 52, percentage: 41.9 },
    { category: 'Core', count: 28, percentage: 22.6 },
    { category: 'Bot ecosystem', count: 18, percentage: 14.5 },
    { category: 'Skin', count: 12, percentage: 9.7 },
    { category: 'Design system', count: 8, percentage: 6.5 },
    { category: 'Infrastructure', count: 4, percentage: 3.2 },
    { category: 'Other', count: 2, percentage: 1.6 }
  ],
  repositoriesImpacted: 18,
  dateRange: {
    type: 'lifetime',
    label: 'Lifetime Contributions'
  },
  metadata: {
    source: 'Wikimedia Gerrit (Fixture Mode)',
    generatedAt: new Date().toISOString(),
    cached: true,
    stale: false,
    complete: true,
    recordsRetrieved: 210,
    paginationBudgetHit: false,
    queryExecutionMs: 5,
    warnings: []
  }
};

export const SAMPLE_REPOSITORIES = [
  {
    project: 'mediawiki/extensions/MassMessage',
    category: 'Extension',
    categoryLabel: 'Extension: MassMessage',
    mergedCount: 34,
    openCount: 3,
    abandonedCount: 2,
    reviewedCount: 19,
    totalAuthored: 39,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:mediawiki/extensions/MassMessage'
  },
  {
    project: 'mediawiki/core',
    category: 'Core',
    categoryLabel: 'MediaWiki Core',
    mergedCount: 28,
    openCount: 4,
    abandonedCount: 3,
    reviewedCount: 24,
    totalAuthored: 35,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:mediawiki/core'
  },
  {
    project: 'pywikibot/core',
    category: 'Bot ecosystem',
    categoryLabel: 'Pywikibot: core',
    mergedCount: 18,
    openCount: 2,
    abandonedCount: 1,
    reviewedCount: 15,
    totalAuthored: 21,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:pywikibot/core'
  },
  {
    project: 'mediawiki/skins/Vector',
    category: 'Skin',
    categoryLabel: 'Skin: Vector',
    mergedCount: 12,
    openCount: 1,
    abandonedCount: 2,
    reviewedCount: 11,
    totalAuthored: 15,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:mediawiki/skins/Vector'
  },
  {
    project: 'design/codex',
    category: 'Design system',
    categoryLabel: 'Codex',
    mergedCount: 8,
    openCount: 2,
    abandonedCount: 1,
    reviewedCount: 9,
    totalAuthored: 11,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:design/codex'
  },
  {
    project: 'operations/puppet',
    category: 'Infrastructure',
    categoryLabel: 'Operations: puppet',
    mergedCount: 4,
    openCount: 1,
    abandonedCount: 1,
    reviewedCount: 5,
    totalAuthored: 6,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:operations/puppet'
  }
];

router.get('/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  if (name === 'sample-contributor' || name === 'legoktm') {
    res.json({
      data: SAMPLE_CONTRIBUTOR_SUMMARY,
      meta: SAMPLE_CONTRIBUTOR_SUMMARY.metadata,
      error: null
    });
    return;
  }

  if (name === 'sample-repositories') {
    res.json({
      data: SAMPLE_REPOSITORIES,
      meta: SAMPLE_CONTRIBUTOR_SUMMARY.metadata,
      error: null
    });
    return;
  }

  res.status(404).json({
    data: null,
    error: {
      code: 'FIXTURE_NOT_FOUND',
      message: `Fixture '${name}' not found`
    }
  });
});

export default router;
