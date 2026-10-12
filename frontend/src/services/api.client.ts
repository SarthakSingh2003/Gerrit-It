import {
  ApiResponse,
  ContributorSummaryResponse,
  RepositoryContributionStats,
  NormalizedChange,
  CohortAnalysisResult,
  ApiError
} from '../types/index.js';

export class ApiClientError extends Error {
  public code: string;
  public details?: ApiError['details'];

  constructor(message: string, code = 'API_ERROR', details?: ApiError['details']) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(resp: Response): Promise<ApiResponse<T>> {
  const json = await resp.json().catch(() => null);

  if (!resp.ok) {
    const errorInfo: ApiError = json?.error || {
      code: `HTTP_${resp.status}`,
      message: `Request failed with status ${resp.status}`
    };
    throw new ApiClientError(errorInfo.message, errorInfo.code, errorInfo.details);
  }

  return json as ApiResponse<T>;
}

export const apiClient = {
  /**
   * Fetches contributor summary with date filtering
   */
  async getContributorSummary(
    identifier: string | number,
    params?: { preset?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<ContributorSummaryResponse>> {
    const q = new URLSearchParams();
    if (params?.preset) q.set('preset', params.preset);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const resp = await fetch(`/api/contributors/${encodeURIComponent(identifier)}/summary${queryStr}`);
    return handleResponse<ContributorSummaryResponse>(resp);
  },

  /**
   * Fetches repository contribution stats
   */
  async getRepositories(
    identifier: string | number,
    params?: { preset?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<RepositoryContributionStats[]>> {
    const q = new URLSearchParams();
    if (params?.preset) q.set('preset', params.preset);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const resp = await fetch(`/api/contributors/${encodeURIComponent(identifier)}/repositories${queryStr}`);
    return handleResponse<RepositoryContributionStats[]>(resp);
  },

  /**
   * Fetches individual normalized changes
   */
  async getChanges(
    identifier: string | number,
    params?: {
      type?: 'authored' | 'reviewed';
      preset?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<{ changes: NormalizedChange[]; total: number; offset: number; limit: number; hasMore: boolean }>> {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.preset) q.set('preset', params.preset);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const resp = await fetch(`/api/contributors/${encodeURIComponent(identifier)}/changes${queryStr}`);
    return handleResponse<{ changes: NormalizedChange[]; total: number; offset: number; limit: number; hasMore: boolean }>(resp);
  },

  /**
   * Generates contribution report
   */
  async getReport(
    identifier: string | number,
    params?: { preset?: string; startDate?: string; endDate?: string; includeRepositories?: boolean }
  ): Promise<ApiResponse<{ markdown: string; summary: ContributorSummaryResponse; topRepositories: RepositoryContributionStats[] }>> {
    const q = new URLSearchParams();
    if (params?.preset) q.set('preset', params.preset);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.includeRepositories !== undefined) q.set('includeRepositories', String(params.includeRepositories));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const resp = await fetch(`/api/contributors/${encodeURIComponent(identifier)}/report${queryStr}`);
    return handleResponse<{ markdown: string; summary: ContributorSummaryResponse; topRepositories: RepositoryContributionStats[] }>(resp);
  },

  /**
   * Analyzes community cohort
   */
  async analyzeCohort(
    identifiers: string[],
    params?: { preset?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<CohortAnalysisResult>> {
    const resp = await fetch('/api/cohorts/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifiers,
        preset: params?.preset,
        startDate: params?.startDate,
        endDate: params?.endDate
      })
    });
    return handleResponse<CohortAnalysisResult>(resp);
  },

  /**
   * Load fixture for demo / offline use
   */
  async getFixture(name: string): Promise<ApiResponse<ContributorSummaryResponse>> {
    const resp = await fetch(`/api/fixtures/${encodeURIComponent(name)}`);
    return handleResponse<ContributorSummaryResponse>(resp);
  }
};
