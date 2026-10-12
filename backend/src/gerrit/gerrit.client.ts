import pLimit from 'p-limit';
import { env } from '../config/env.js';
import { parseGerritResponse } from './parser.js';
import { GerritChange } from '../analytics/types.js';
import { logger } from '../logger/logger.js';
import { requestCoalescer } from '../cache/coalescing.js';

export interface GerritFetchResult<T> {
  data: T;
  complete: boolean;
  truncatedReason?: string;
  totalFetched: number;
}

export class GerritClient {
  private limiter = pLimit(env.GERRIT_MAX_CONCURRENCY);
  private baseUrl: string;
  private timeoutMs: number;
  private maxPages: number;
  private pageLimit: number;

  constructor(
    baseUrl = env.GERRIT_BASE_URL,
    timeoutMs = env.GERRIT_TIMEOUT_MS,
    maxPages = env.GERRIT_MAX_PAGES,
    pageLimit = env.GERRIT_PAGE_LIMIT
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
    this.maxPages = maxPages;
    this.pageLimit = pageLimit;
  }

  /**
   * Performs an upstream HTTP request with retry, backoff, and timeout.
   */
  async requestWithRetry(
    endpoint: string,
    retries = 3,
    fetchFn: typeof fetch = fetch
  ): Promise<string> {
    return this.limiter(async () => {
      const url = `${this.baseUrl}${endpoint}`;
      let attempt = 0;

      while (attempt <= retries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
          logger.debug(`Gerrit request [attempt ${attempt}/${retries + 1}]: ${url}`);
          const resp = await fetchFn(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'WikiGerritTracker/1.0 (https://gerrit.wikimedia.org; community-tool)'
            }
          });

          clearTimeout(timeoutId);

          if (resp.ok) {
            return await resp.text();
          }

          // Handle 429 Too Many Requests or 503/504 Gateway errors
          const isRetryable = resp.status === 429 || resp.status === 503 || resp.status === 504;
          if (isRetryable && attempt <= retries) {
            let delayMs = 500 * Math.pow(2, attempt - 1);
            const retryAfter = resp.headers.get('Retry-After');
            if (retryAfter) {
              const seconds = parseInt(retryAfter, 10);
              if (!isNaN(seconds)) delayMs = seconds * 1000;
            } else {
              // Add jitter +/- 20%
              delayMs += Math.random() * (delayMs * 0.2);
            }

            logger.warn(`Upstream returned HTTP ${resp.status}. Retrying in ${Math.round(delayMs)}ms`, {
              url,
              status: resp.status,
              attempt
            });
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          throw new Error(`Gerrit upstream returned HTTP ${resp.status}: ${resp.statusText}`);
        } catch (err) {
          clearTimeout(timeoutId);
          const isAbort = (err as Error).name === 'AbortError';
          if (attempt <= retries && (isAbort || (err as Error).message.includes('fetch failed'))) {
            const delayMs = 1000 * Math.pow(2, attempt - 1) + Math.random() * 200;
            logger.warn(`Network/Timeout error on Gerrit request. Retrying in ${Math.round(delayMs)}ms`, {
              url,
              error: (err as Error).message,
              attempt
            });
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          throw err;
        }
      }

      throw new Error(`Exceeded maximum retries for Gerrit endpoint: ${endpoint}`);
    });
  }

  /**
   * Fetches paginated change records for a Gerrit query with safety limits and deduplication.
   */
  async fetchChanges(
    queryString: string,
    options: {
      includeLabels?: boolean;
      maxPages?: number;
      fetchFn?: typeof fetch;
    } = {}
  ): Promise<GerritFetchResult<GerritChange[]>> {
    const coalescingKey = `query:${queryString}:${options.includeLabels ? 'labels' : 'nolabels'}`;

    return requestCoalescer.coalesce(coalescingKey, async () => {
      const allChanges: GerritChange[] = [];
      const seenIds = new Set<string | number>();
      let startOffset = 0;
      let pageCount = 0;
      let hasMore = true;
      let truncatedReason: string | undefined;
      const effectiveMaxPages = options.maxPages ?? this.maxPages;

      const extraParams = options.includeLabels ? '&o=LABELS' : '';

      while (hasMore && pageCount < effectiveMaxPages) {
        pageCount++;
        const endpoint = `/changes/?q=${encodeURIComponent(queryString)}&n=${this.pageLimit}&start=${startOffset}${extraParams}`;

        const rawText = await this.requestWithRetry(endpoint, 2, options.fetchFn);
        const pageRecords = parseGerritResponse<GerritChange[]>(rawText);

        if (!Array.isArray(pageRecords) || pageRecords.length === 0) {
          hasMore = false;
          break;
        }

        // Deduplicate records by change number / id
        for (const change of pageRecords) {
          const key = change._number || change.id;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            allChanges.push(change);
          }
        }

        // Inspect _more_changes on last record
        const lastChange = pageRecords[pageRecords.length - 1];
        if (!lastChange || !lastChange._more_changes) {
          hasMore = false;
        } else {
          startOffset += pageRecords.length;
        }
      }

      if (hasMore && pageCount >= effectiveMaxPages) {
        truncatedReason = `Result capped at safety budget of ${effectiveMaxPages} pages (${allChanges.length} changes). Complete lifetime total may be larger.`;
        logger.warn(truncatedReason, { queryString, total: allChanges.length });
      }

      return {
        data: allChanges,
        complete: !hasMore,
        truncatedReason,
        totalFetched: allChanges.length
      };
    });
  }
}

export const gerritClient = new GerritClient();
