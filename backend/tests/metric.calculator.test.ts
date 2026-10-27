import { describe, it, expect } from 'vitest';
import { MetricCalculator } from '../src/analytics/metric.calculator.js';
import { GerritChange } from '../src/analytics/types.js';
import { DateRangeFilter } from '../src/analytics/date.filter.js';

describe('Metric Calculator Engine', () => {
  const sampleAuthoredChanges: GerritChange[] = [
    {
      id: 'repo1~1',
      change_id: 'I111',
      _number: 101,
      project: 'mediawiki/core',
      branch: 'master',
      subject: 'Fix core bug',
      status: 'MERGED',
      created: '2024-01-10 10:00:00.000000000',
      updated: '2024-01-15 12:00:00.000000000',
      submitted: '2024-01-15 11:59:00.000000000',
      insertions: 50,
      deletions: 10
    },
    {
      id: 'repo2~2',
      change_id: 'I222',
      _number: 102,
      project: 'mediawiki/extensions/VisualEditor',
      branch: 'master',
      subject: 'Add VE feature',
      status: 'NEW',
      created: '2024-06-01 09:00:00.000000000',
      updated: '2024-06-02 09:00:00.000000000',
      insertions: 120,
      deletions: 5
    },
    {
      id: 'repo1~3',
      change_id: 'I333',
      _number: 103,
      project: 'mediawiki/core',
      branch: 'master',
      subject: 'Abandoned attempt',
      status: 'ABANDONED',
      created: '2023-11-01 08:00:00.000000000',
      updated: '2023-11-05 08:00:00.000000000',
      insertions: 20,
      deletions: 2
    }
  ];

  const sampleReviewChanges: GerritChange[] = [
    {
      id: 'rev1~201',
      change_id: 'I444',
      _number: 201,
      project: 'mediawiki/skins/Vector',
      branch: 'master',
      subject: 'Improve skin layout',
      status: 'MERGED',
      created: '2024-03-01 10:00:00.000000000',
      updated: '2024-03-05 10:00:00.000000000',
      labels: {
        'Code-Review': {
          all: [
            { _account_id: 458, value: 2, date: '2024-03-04 15:00:00.000000000' }
          ]
        },
        'Verified': {
          all: [
            { _account_id: 458, value: 1, date: '2024-03-04 14:00:00.000000000' }
          ]
        }
      }
    },
    {
      id: 'rev2~202',
      change_id: 'I555',
      _number: 202,
      project: 'pywikibot/core',
      branch: 'master',
      subject: 'Refactor bot login',
      status: 'NEW',
      created: '2024-04-10 10:00:00.000000000',
      updated: '2024-04-11 10:00:00.000000000',
      labels: {
        'Code-Review': {
          all: [
            { _account_id: 458, value: 1, date: '2024-04-11 11:00:00.000000000' }
          ]
        }
      }
    }
  ];

  it('calculates lifetime authored metrics accurately', () => {
    const metrics = MetricCalculator.calculateAuthoredMetrics(sampleAuthoredChanges);
    expect(metrics.totalAuthored).toBe(3);
    expect(metrics.merged).toBe(1);
    expect(metrics.open).toBe(1);
    expect(metrics.abandoned).toBe(1);
    expect(metrics.uniqueRepositories).toBe(2);
    expect(metrics.totalInsertions).toBe(190);
    expect(metrics.totalDeletions).toBe(17);
    expect(metrics.firstRecordedDate).toBe('2023-11-01 08:00:00.000000000');
  });

  it('calculates review intelligence metrics with approvals and recommendations', () => {
    const reviews = MetricCalculator.calculateReviewMetrics(sampleReviewChanges, 458);
    expect(reviews.distinctChangesReviewed).toBe(2);
    expect(reviews.approvalsCount).toBe(1);
    expect(reviews.recommendationsCount).toBe(1);
    expect(reviews.verifiedCount).toBe(1);
    expect(reviews.critiquesCount).toBe(0);
    expect(reviews.uniqueReviewRepositories).toBe(2);
    expect(reviews.mentorshipDisclaimer).toContain('peer review');
  });

  it('filters authored changes strictly by date range, respecting merge timestamp for merged patches', () => {
    const range2024: DateRangeFilter = {
      type: 'custom',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      label: 'Year 2024'
    };

    const filtered = MetricCalculator.filterAuthoredChanges(sampleAuthoredChanges, range2024);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c._number)).toEqual([101, 102]);
  });

  it('aggregates repository statistics combining authored and reviewed counts', () => {
    const repos = MetricCalculator.aggregateRepositories(sampleAuthoredChanges, sampleReviewChanges);
    expect(repos).toHaveLength(4);

    const coreRepo = repos.find((r) => r.project === 'mediawiki/core');
    expect(coreRepo).toBeDefined();
    expect(coreRepo?.mergedCount).toBe(1);
    expect(coreRepo?.openCount).toBe(0);
    expect(coreRepo?.abandonedCount).toBe(1);
    expect(coreRepo?.totalAuthored).toBe(2);

    const vectorRepo = repos.find((r) => r.project === 'mediawiki/skins/Vector');
    expect(vectorRepo?.reviewedCount).toBe(1);
    expect(vectorRepo?.totalAuthored).toBe(0);
  });

  it('calculates category breakdown percentages accurately', () => {
    const breakdown = MetricCalculator.calculateCategoryBreakdown(sampleAuthoredChanges);
    const core = breakdown.find((b) => b.category === 'Core');
    const ext = breakdown.find((b) => b.category === 'Extension');

    expect(core?.count).toBe(2);
    expect(ext?.count).toBe(1);
    expect(core?.percentage).toBe(66.7);
  });
});
