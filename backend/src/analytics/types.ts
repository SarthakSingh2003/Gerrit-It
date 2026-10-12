import { RepoCategory } from '../classification/rules.js';

export interface GerritAccount {
  _account_id: number;
  name?: string;
  display_name?: string;
  email?: string;
  username?: string;
  registered_on?: string;
  status?: string;
  avatars?: Array<{ url: string; height: number; width: number }>;
}

export interface GerritChangeLabelApproval {
  _account_id: number;
  name?: string;
  value?: number;
  date?: string;
  tag?: string;
}

export interface GerritChangeLabels {
  'Code-Review'?: {
    approved?: { _account_id: number };
    all?: GerritChangeLabelApproval[];
    default_value?: number;
    values?: Record<string, string>;
  };
  'Verified'?: {
    approved?: { _account_id: number };
    all?: GerritChangeLabelApproval[];
    default_value?: number;
    values?: Record<string, string>;
  };
  [key: string]: unknown;
}

export interface GerritChange {
  id: string;
  project: string;
  branch: string;
  change_id: string;
  subject: string;
  status: 'NEW' | 'MERGED' | 'ABANDONED';
  created: string;
  updated: string;
  submitted?: string;
  _number: number;
  insertions?: number;
  deletions?: number;
  total_comment_count?: number;
  owner?: {
    _account_id: number;
    name?: string;
    username?: string;
  };
  labels?: GerritChangeLabels;
  _more_changes?: boolean;
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
  userReviewScore?: number; // E.g. +2, +1, -1, -2 if user reviewed
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
  approvalsCount: number; // Code-Review +2
  verifiedCount: number; // Verified +1 or +2
  recommendationsCount: number; // Code-Review +1
  critiquesCount: number; // Code-Review -1 or -2
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

export interface ContributorSummaryResponse {
  contributor: {
    accountId: number;
    username?: string;
    displayName: string;
    registeredOn?: string;
    statusText?: string;
    gerritProfileUrl: string;
  };
  authored: AuthoredMetrics;
  reviews: ReviewMetrics;
  categoryBreakdown: CategoryBreakdown[];
  repositoriesImpacted: number;
  dateRange: {
    type: 'lifetime' | 'custom' | 'preset';
    startDate?: string;
    endDate?: string;
    label: string;
  };
  metadata: ResponseMetadata;
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

export interface ApiResponse<T> {
  data: T;
  meta: ResponseMetadata;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}
