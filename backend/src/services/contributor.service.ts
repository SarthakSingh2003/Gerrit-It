import { GerritClient, gerritClient } from '../gerrit/gerrit.client.js';
import { resolveCanonicalAccount } from '../gerrit/identity.resolver.js';
import { MetricCalculator } from '../analytics/metric.calculator.js';
import { resolveDateRange, DateRangeFilter } from '../analytics/date.filter.js';
import {
  GerritAccount,
  GerritChange,
  ContributorSummaryResponse,
  RepositoryContributionStats,
  NormalizedChange,
  ResponseMetadata
} from '../analytics/types.js';
import { getCacheService, buildCacheKey } from '../cache/index.js';
import { logger } from '../logger/logger.js';

export class ContributorService {
  constructor(private client: GerritClient = gerritClient) {}

  /**
   * Fetches raw authored changes for a contributor with caching and optional date range.
   */
  async getRawAuthoredChanges(
    account: GerritAccount,
    options?: { maxPages?: number; dateRange?: DateRangeFilter }
  ): Promise<{ changes: GerritChange[]; complete: boolean; warning?: string; cached: boolean }> {
    const cache = getCacheService();
    const cacheKey = buildCacheKey('changes', account._account_id, {
      after: options?.dateRange?.startDate,
      before: options?.dateRange?.endDate
    });
    const cached = await cache.get<{ changes: GerritChange[]; complete: boolean; warning?: string }>(cacheKey);

    if (cached) {
      return { ...cached, cached: true };
    }

    let query = `owner:${account._account_id}`;
    if (options?.dateRange?.startDate) {
      query += ` after:"${options.dateRange.startDate}"`;
    }
    if (options?.dateRange?.endDate) {
      query += ` before:"${options.dateRange.endDate}"`;
    }

    const result = await this.client.fetchChanges(query, {
      includeLabels: false,
      maxPages: options?.maxPages
    });

    const payload = {
      changes: result.data,
      complete: result.complete,
      warning: result.truncatedReason
    };

    await cache.set(cacheKey, payload);
    return { ...payload, cached: false };
  }

  /**
   * Fetches raw review changes where contributor participated with caching and optional date range.
   */
  async getRawReviewChanges(
    account: GerritAccount,
    options?: { maxPages?: number; dateRange?: DateRangeFilter }
  ): Promise<{ changes: GerritChange[]; complete: boolean; warning?: string; cached: boolean }> {
    const cache = getCacheService();
    const cacheKey = buildCacheKey('reviews', account._account_id, {
      after: options?.dateRange?.startDate,
      before: options?.dateRange?.endDate
    });
    const cached = await cache.get<{ changes: GerritChange[]; complete: boolean; warning?: string }>(cacheKey);

    if (cached) {
      return { ...cached, cached: true };
    }

    let query = `reviewer:${account._account_id} -owner:${account._account_id}`;
    if (options?.dateRange?.startDate) {
      query += ` after:"${options.dateRange.startDate}"`;
    }
    if (options?.dateRange?.endDate) {
      query += ` before:"${options.dateRange.endDate}"`;
    }

    const result = await this.client.fetchChanges(query, {
      includeLabels: true,
      maxPages: options?.maxPages
    });

    const payload = {
      changes: result.data,
      complete: result.complete,
      warning: result.truncatedReason
    };

    await cache.set(cacheKey, payload);
    return { ...payload, cached: false };
  }

  /**
   * Resolves canonical account by identifier.
   */
  async resolveAccount(identifier: string | number): Promise<GerritAccount> {
    return resolveCanonicalAccount(identifier);
  }

  /**
   * Computes full summary response for a contributor within a date range.
   */
  async getContributorSummary(
    identifier: string | number,
    dateOptions?: { preset?: string; startDate?: string; endDate?: string }
  ): Promise<{ summary: ContributorSummaryResponse; rawAuthored: GerritChange[]; rawReviewed: GerritChange[] }> {
    const startTime = Date.now();
    const account = await this.resolveAccount(identifier);
    const dateRange: DateRangeFilter = resolveDateRange(
      dateOptions?.preset,
      dateOptions?.startDate,
      dateOptions?.endDate
    );

    const [authoredResult, reviewResult] = await Promise.all([
      this.getRawAuthoredChanges(account, { dateRange }),
      this.getRawReviewChanges(account, { dateRange })
    ]);

    const warnings: string[] = [];
    if (authoredResult.warning) warnings.push(authoredResult.warning);
    if (reviewResult.warning) warnings.push(reviewResult.warning);

    const filteredAuthored = MetricCalculator.filterAuthoredChanges(
      authoredResult.changes,
      dateRange
    );
    const filteredReviewed = MetricCalculator.filterReviewChanges(
      reviewResult.changes,
      account._account_id,
      dateRange
    );

    const authoredMetrics = MetricCalculator.calculateAuthoredMetrics(filteredAuthored);
    const reviewMetrics = MetricCalculator.calculateReviewMetrics(filteredReviewed, account._account_id);
    const categoryBreakdown = MetricCalculator.calculateCategoryBreakdown(filteredAuthored);

    const allRepos = new Set<string>();
    filteredAuthored.forEach((c) => c.project && allRepos.add(c.project));

    const metadata: ResponseMetadata = {
      source: 'Wikimedia Gerrit',
      generatedAt: new Date().toISOString(),
      cached: Boolean(authoredResult.cached && reviewResult.cached),
      stale: false,
      complete: authoredResult.complete && reviewResult.complete,
      recordsRetrieved: filteredAuthored.length + filteredReviewed.length,
      paginationBudgetHit: !authoredResult.complete || !reviewResult.complete,
      queryExecutionMs: Date.now() - startTime,
      warnings
    };

    const displayName = account.name || account.username || `Contributor #${account._account_id}`;
    const gerritProfileUrl = `https://gerrit.wikimedia.org/r/q/owner:${account._account_id}`;

    const summary: ContributorSummaryResponse = {
      contributor: {
        accountId: account._account_id,
        username: account.username,
        displayName,
        registeredOn: account.registered_on,
        statusText: account.status,
        gerritProfileUrl
      },
      authored: authoredMetrics,
      reviews: reviewMetrics,
      categoryBreakdown,
      repositoriesImpacted: allRepos.size,
      dateRange: {
        type: dateRange.type,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        label: dateRange.label
      },
      metadata
    };

    return {
      summary,
      rawAuthored: filteredAuthored,
      rawReviewed: filteredReviewed
    };
  }

  /**
   * Retrieves aggregated repository contributions.
   */
  async getRepositoryStats(
    identifier: string | number,
    dateOptions?: { preset?: string; startDate?: string; endDate?: string }
  ): Promise<RepositoryContributionStats[]> {
    const { rawAuthored, rawReviewed } = await this.getContributorSummary(identifier, dateOptions);
    return MetricCalculator.aggregateRepositories(rawAuthored, rawReviewed);
  }

  /**
   * Retrieves normalized changes for inspection.
   */
  async getNormalizedChanges(
    identifier: string | number,
    dateOptions?: { preset?: string; startDate?: string; endDate?: string },
    type: 'authored' | 'reviewed' = 'authored'
  ): Promise<NormalizedChange[]> {
    const { rawAuthored, rawReviewed, summary } = await this.getContributorSummary(identifier, dateOptions);
    const target = type === 'authored' ? rawAuthored : rawReviewed;
    return MetricCalculator.normalizeChanges(target, summary.contributor.accountId);
  }
}

export const contributorService = new ContributorService();
