import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricCards from '../src/components/MetricCards.vue';
import { ContributorSummaryResponse } from '../src/types/index.js';

const mockSummary: ContributorSummaryResponse = {
  contributor: {
    accountId: 458,
    username: 'legoktm',
    displayName: 'Legoktm',
    registeredOn: '2016-07-25 01:42:27',
    gerritProfileUrl: 'https://gerrit.wikimedia.org/r/q/owner:458'
  },
  authored: {
    totalAuthored: 120,
    merged: 90,
    open: 20,
    abandoned: 10,
    uniqueRepositories: 15,
    firstRecordedDate: '2016-08-10 14:22:01',
    totalInsertions: 12000,
    totalDeletions: 4000
  },
  reviews: {
    distinctChangesReviewed: 85,
    approvalsCount: 42,
    verifiedCount: 30,
    recommendationsCount: 25,
    critiquesCount: 8,
    uniqueReviewRepositories: 12,
    mentorshipDisclaimer: 'Peer review guidance note',
    limitationsNote: 'API limitation note'
  },
  categoryBreakdown: [
    { category: 'Core', count: 40, percentage: 33.3 },
    { category: 'Extension', count: 80, percentage: 66.7 }
  ],
  repositoriesImpacted: 15,
  dateRange: {
    type: 'lifetime',
    label: 'Lifetime Contributions'
  },
  metadata: {
    source: 'Wikimedia Gerrit',
    generatedAt: '2026-10-12T10:00:00Z',
    cached: true,
    stale: false,
    complete: true,
    recordsRetrieved: 205,
    paginationBudgetHit: false,
    queryExecutionMs: 12,
    warnings: []
  }
};

describe('MetricCards Component', () => {
  it('renders all 8 core metric values accurately', () => {
    const wrapper = mount(MetricCards, {
      props: { summary: mockSummary }
    });

    const text = wrapper.text();
    expect(text).toContain('120'); // Total Authored
    expect(text).toContain('90');  // Merged
    expect(text).toContain('20');  // Open
    expect(text).toContain('10');  // Abandoned
    expect(text).toContain('85');  // Reviewed
    expect(text).toContain('42');  // Approvals
    expect(text).toContain('15');  // Repositories
    expect(text).toContain('2016-08-10'); // First recorded activity
  });

  it('calculates and displays merge rate percentage accurately', () => {
    const wrapper = mount(MetricCards, {
      props: { summary: mockSummary }
    });

    // 90 / 120 = 75%
    expect(wrapper.text()).toContain('75% merge rate');
  });

  it('displays cached status tag when served from cache', () => {
    const wrapper = mount(MetricCards, {
      props: { summary: mockSummary }
    });

    expect(wrapper.text()).toContain('Cached');
    expect(wrapper.text()).toContain('Query Latency: 12ms');
  });
});
