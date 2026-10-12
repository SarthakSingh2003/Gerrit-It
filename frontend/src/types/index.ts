export type RepoCategory =
  | 'Core'
  | 'Extension'
  | 'Skin'
  | 'Bot ecosystem'
  | 'Design system'
  | 'Infrastructure'
  | 'Other';

export interface GerritContributor {
  accountId: number;
  username?: string;
  displayName: string;
  registeredOn?: string;
  statusText?: string;
  gerritProfileUrl: string;
}

export interface AuthoredMetrics {
  totalAuthored: number;
  merged: number;
  open: number;
  abandoned: number;
  uniqueRepositories: number;
  firstRecordedDate?: string;
  lastRecordedDate?: string;
  totalInsertions: number;
  totalDeletions: number;
}

export interface ReviewMetrics {
  distinctChangesReviewed: number;
  approvalsCount: number;
  verifiedCount: number;
  recommendationsCount: number;
  critiquesCount: number;
  uniqueReviewRepositories: number;
  firstRecordedReviewDate?: string;
  lastRecordedReviewDate?: string;
  mentorshipDisclaimer: string;
  limitationsNote: string;
}

export interface CategoryBreakdown {
  category: RepoCategory;
  count: number;
  percentage: number;
}

export interface DateRangeState {
  type: 'lifetime' | 'custom' | 'preset';
  startDate?: string;
  endDate?: string;
  label: string;
}

export interface ResponseMetadata {
  source: string;
  generatedAt: string;
  cached: boolean;
  stale: boolean;
  complete: boolean;
  recordsRetrieved: number;
  paginationBudgetHit: boolean;
  queryExecutionMs: number;
  warnings: string[];
}

export interface ContributorSummaryResponse {
  contributor: GerritContributor;
  authored: AuthoredMetrics;
  reviews: ReviewMetrics;
  categoryBreakdown: CategoryBreakdown[];
  repositoriesImpacted: number;
  dateRange: DateRangeState;
  metadata: ResponseMetadata;
}

export interface RepositoryContributionStats {
  project: string;
  category: RepoCategory;
  categoryLabel: string;
  mergedCount: number;
  openCount: number;
  abandonedCount: number;
  reviewedCount: number;
  totalAuthored: number;
  firstActivityDate?: string;
  lastActivityDate?: string;
  gerritUrl: string;
}

export interface NormalizedChange {
  changeNumber: number;
  changeId: string;
  subject: string;
  project: string;
  category: RepoCategory;
  categoryLabel: string;
  status: 'merged' | 'open' | 'abandoned';
  created: string;
  updated: string;
  submitted?: string;
  insertions: number;
  deletions: number;
  totalComments: number;
  gerritUrl: string;
  userReviewScore?: number;
}

export interface DisambiguationCandidate {
  _account_id: number;
  name?: string;
  username?: string;
  status?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: {
    candidates?: DisambiguationCandidate[];
    [key: string]: unknown;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta: ResponseMetadata;
  error: ApiError | null;
}

export interface CohortAnalysisResult {
  members: Array<{
    inputIdentifier: string;
    resolved: boolean;
    error?: string;
    summary?: ContributorSummaryResponse;
  }>;
  cohortTotals: {
    totalMembers: number;
    resolvedMembers: number;
    unresolvedMembers: number;
    combinedAuthoredChanges: number;
    combinedMergedChanges: number;
    combinedOpenChanges: number;
    combinedAbandonedChanges: number;
    combinedDistinctReviews: number;
    uniqueRepositoriesImpacted: number;
    topSharedRepositories: Array<{ project: string; contributorCount: number }>;
  };
  markdownReport: string;
  csvReport: string;
  generatedAt: string;
}
