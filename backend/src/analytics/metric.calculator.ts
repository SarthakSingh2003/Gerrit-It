import {
  GerritChange,
  AuthoredMetrics,
  ReviewMetrics,
  RepositoryContributionStats,
  CategoryBreakdown,
  NormalizedChange
} from './types.js';
import { classifyRepository } from '../classification/repo.classifier.js';
import { RepoCategory } from '../classification/rules.js';
import { DateRangeFilter, isTimestampInRange } from './date.filter.js';

export class MetricCalculator {
  /**
   * Filters authored changes according to the specified date range.
   * For merged changes, respects merge timestamp (`submitted`) if available,
   * otherwise creation timestamp (`created`).
   */
  static filterAuthoredChanges(
    changes: GerritChange[],
    dateRange: DateRangeFilter
  ): GerritChange[] {
    if (dateRange.type === 'lifetime' || (!dateRange.startDate && !dateRange.endDate)) {
      return changes;
    }

    return changes.filter((change) => {
      const timestamp = change.status === 'MERGED' && change.submitted
        ? change.submitted
        : change.created;

      return isTimestampInRange(timestamp, dateRange.startDate, dateRange.endDate);
    });
  }

  /**
   * Filters reviewed changes according to the specified date range.
   * Filters by vote date in label approvals for this user, or change updated date.
   */
  static filterReviewChanges(
    changes: GerritChange[],
    targetAccountId: number,
    dateRange: DateRangeFilter
  ): GerritChange[] {
    if (dateRange.type === 'lifetime' || (!dateRange.startDate && !dateRange.endDate)) {
      return changes;
    }

    return changes.filter((change) => {
      let voteDate: string | undefined;
      const crApprovals = change.labels?.['Code-Review']?.all;
      if (crApprovals && Array.isArray(crApprovals)) {
        const userApproval = crApprovals.find((a) => a._account_id === targetAccountId);
        if (userApproval?.date) {
          voteDate = userApproval.date;
        }
      }

      const timestamp = voteDate || change.updated || change.created;
      return isTimestampInRange(timestamp, dateRange.startDate, dateRange.endDate);
    });
  }

  /**
   * Calculates comprehensive authored contribution metrics.
   */
  static calculateAuthoredMetrics(changes: GerritChange[]): AuthoredMetrics {
    let merged = 0;
    let open = 0;
    let abandoned = 0;
    let totalInsertions = 0;
    let totalDeletions = 0;
    const repos = new Set<string>();

    let earliestDate: string | undefined;
    let latestDate: string | undefined;

    for (const change of changes) {
      if (change.status === 'MERGED') merged++;
      else if (change.status === 'NEW') open++;
      else if (change.status === 'ABANDONED') abandoned++;

      if (change.project) {
        repos.add(change.project);
      }

      totalInsertions += change.insertions || 0;
      totalDeletions += change.deletions || 0;

      if (change.created) {
        if (!earliestDate || change.created < earliestDate) {
          earliestDate = change.created;
        }
      }

      const actDate = change.submitted || change.updated || change.created;
      if (actDate) {
        if (!latestDate || actDate > latestDate) {
          latestDate = actDate;
        }
      }
    }

    return {
      totalAuthored: changes.length,
      merged,
      open,
      abandoned,
      uniqueRepositories: repos.size,
      firstRecordedDate: earliestDate,
      lastRecordedDate: latestDate,
      totalInsertions,
      totalDeletions
    };
  }

  /**
   * Calculates review and code review intelligence metrics.
   * Deduplicates by change identity and isolates authored vs reviewed metrics.
   */
  static calculateReviewMetrics(
    changes: GerritChange[],
    targetAccountId: number
  ): ReviewMetrics {
    let approvalsCount = 0;
    let verifiedCount = 0;
    let recommendationsCount = 0;
    let critiquesCount = 0;
    const repos = new Set<string>();
    let earliestDate: string | undefined;
    let latestDate: string | undefined;

    for (const change of changes) {
      if (change.project) {
        repos.add(change.project);
      }

      const crApprovals = change.labels?.['Code-Review']?.all;
      if (crApprovals && Array.isArray(crApprovals)) {
        const userVote = crApprovals.find((a) => a._account_id === targetAccountId);
        if (userVote) {
          if (userVote.value === 2) approvalsCount++;
          else if (userVote.value === 1) recommendationsCount++;
          else if (userVote.value !== undefined && userVote.value < 0) critiquesCount++;

          if (userVote.date) {
            if (!earliestDate || userVote.date < earliestDate) earliestDate = userVote.date;
            if (!latestDate || userVote.date > latestDate) latestDate = userVote.date;
          }
        }
      }

      const vApprovals = change.labels?.['Verified']?.all;
      if (vApprovals && Array.isArray(vApprovals)) {
        const userVVote = vApprovals.find((a) => a._account_id === targetAccountId);
        if (userVVote && userVVote.value && userVVote.value >= 1) {
          verifiedCount++;
        }
      }

      const actDate = change.updated || change.created;
      if (actDate) {
        if (!earliestDate || actDate < earliestDate) earliestDate = actDate;
        if (!latestDate || actDate > latestDate) latestDate = actDate;
      }
    }

    return {
      distinctChangesReviewed: changes.length,
      approvalsCount,
      verifiedCount,
      recommendationsCount,
      critiquesCount,
      uniqueReviewRepositories: repos.size,
      firstRecordedReviewDate: earliestDate,
      lastRecordedReviewDate: latestDate,
      mentorshipDisclaimer:
        'Code reviews indicate technical collaboration and peer review support across repositories. Review volume alone does not prove or establish formal mentorship.',
      limitationsNote:
        'Aggregated from Gerrit REST change search results with LABELS. Unrecorded review updates, patch-set comments without votes, or changes beyond pagination safety limits are not counted.'
    };
  }

  /**
   * Aggregates stats per repository combining authored and review participation.
   */
  static aggregateRepositories(
    authoredChanges: GerritChange[],
    reviewChanges: GerritChange[]
  ): RepositoryContributionStats[] {
    const map = new Map<string, RepositoryContributionStats>();

    const getOrInit = (project: string): RepositoryContributionStats => {
      let stats = map.get(project);
      if (!stats) {
        const classified = classifyRepository(project);
        stats = {
          project,
          category: classified.category,
          categoryLabel: classified.displayLabel,
          mergedCount: 0,
          openCount: 0,
          abandonedCount: 0,
          reviewedCount: 0,
          totalAuthored: 0,
          gerritUrl: `https://gerrit.wikimedia.org/r/q/project:${encodeURIComponent(project)}`
        };
        map.set(project, stats);
      }
      return stats;
    };

    for (const change of authoredChanges) {
      if (!change.project) continue;
      const s = getOrInit(change.project);
      if (change.status === 'MERGED') s.mergedCount++;
      else if (change.status === 'NEW') s.openCount++;
      else if (change.status === 'ABANDONED') s.abandonedCount++;
      s.totalAuthored++;

      const date = change.submitted || change.created;
      if (date) {
        if (!s.firstActivityDate || date < s.firstActivityDate) s.firstActivityDate = date;
        if (!s.lastActivityDate || date > s.lastActivityDate) s.lastActivityDate = date;
      }
    }

    for (const change of reviewChanges) {
      if (!change.project) continue;
      const s = getOrInit(change.project);
      s.reviewedCount++;

      const date = change.updated || change.created;
      if (date) {
        if (!s.firstActivityDate || date < s.firstActivityDate) s.firstActivityDate = date;
        if (!s.lastActivityDate || date > s.lastActivityDate) s.lastActivityDate = date;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.mergedCount !== a.mergedCount) return b.mergedCount - a.mergedCount;
      if (b.totalAuthored !== a.totalAuthored) return b.totalAuthored - a.totalAuthored;
      return b.reviewedCount - a.reviewedCount;
    });
  }

  /**
   * Calculates category distribution across authored changes.
   */
  static calculateCategoryBreakdown(changes: GerritChange[]): CategoryBreakdown[] {
    const counts: Record<RepoCategory, number> = {
      Core: 0,
      Extension: 0,
      Skin: 0,
      'Bot ecosystem': 0,
      'Design system': 0,
      Infrastructure: 0,
      Other: 0
    };

    let total = 0;
    for (const change of changes) {
      const classified = classifyRepository(change.project);
      counts[classified.category] = (counts[classified.category] || 0) + 1;
      total++;
    }

    const categories: RepoCategory[] = [
      'Core',
      'Extension',
      'Skin',
      'Bot ecosystem',
      'Design system',
      'Infrastructure',
      'Other'
    ];

    return categories.map((cat) => {
      const count = counts[cat] || 0;
      return {
        category: cat,
        count,
        percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0
      };
    });
  }

  /**
   * Normalizes raw Gerrit changes into client-ready change items with direct Gerrit URLs.
   */
  static normalizeChanges(
    changes: GerritChange[],
    targetAccountId?: number
  ): NormalizedChange[] {
    return changes.map((c) => {
      const classified = classifyRepository(c.project);
      let status: 'merged' | 'open' | 'abandoned' = 'open';
      if (c.status === 'MERGED') status = 'merged';
      else if (c.status === 'ABANDONED') status = 'abandoned';

      let userReviewScore: number | undefined;
      if (targetAccountId && c.labels?.['Code-Review']?.all) {
        const vote = c.labels['Code-Review'].all.find((a) => a._account_id === targetAccountId);
        if (vote && vote.value !== undefined) {
          userReviewScore = vote.value;
        }
      }

      return {
        changeNumber: c._number,
        changeId: c.change_id || c.id,
        subject: c.subject || 'No subject',
        project: c.project,
        category: classified.category,
        categoryLabel: classified.displayLabel,
        status,
        created: c.created,
        updated: c.updated,
        submitted: c.submitted,
        insertions: c.insertions || 0,
        deletions: c.deletions || 0,
        totalComments: c.total_comment_count || 0,
        gerritUrl: `https://gerrit.wikimedia.org/r/c/${encodeURIComponent(c.project)}/+/${c._number}`,
        userReviewScore
      };
    });
  }
}
