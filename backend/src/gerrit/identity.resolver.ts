import { env } from '../config/env.js';
import { parseGerritResponse } from './parser.js';
import { GerritAccount } from '../analytics/types.js';
import { getCacheService, buildCacheKey } from '../cache/index.js';

export interface DisambiguationCandidate {
  _account_id: number;
  name?: string;
  username?: string;
  email?: string;
  status?: string;
}

export class AccountResolutionError extends Error {
  public code: string;
  public candidates?: DisambiguationCandidate[];

  constructor(message: string, code = 'ACCOUNT_RESOLUTION_ERROR', candidates?: DisambiguationCandidate[]) {
    super(message);
    this.name = 'AccountResolutionError';
    this.code = code;
    this.candidates = candidates;
  }
}

export async function resolveCanonicalAccount(
  rawIdentifier: string | number,
  fetchFn: typeof fetch = fetch
): Promise<GerritAccount> {
  const cache = getCacheService();
  const trimmed = String(rawIdentifier).trim();

  if (!trimmed) {
    throw new AccountResolutionError('Account identifier cannot be empty', 'INVALID_IDENTIFIER');
  }

  const cacheKey = buildCacheKey('contributor', trimmed);
  const cached = await cache.get<GerritAccount>(cacheKey);
  if (cached) {
    return cached;
  }

  const requestHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'Gerrit-It/1.0 (https://gerrit.wikimedia.org; community-tool)'
  };

  if (/^\d+$/.test(trimmed)) {
    const accountId = parseInt(trimmed, 10);
    const detailUrl = `${env.GERRIT_BASE_URL}/accounts/${accountId}/detail`;
    try {
      const resp = await fetchFn(detailUrl, { headers: requestHeaders });
      if (resp.status === 404) {
        throw new AccountResolutionError(`Gerrit account #${accountId} not found`, 'ACCOUNT_NOT_FOUND');
      }
      if (!resp.ok) {
        throw new AccountResolutionError(`Upstream error resolving account #${accountId}: HTTP ${resp.status}`, 'UPSTREAM_ERROR');
      }
      const text = await resp.text();
      const account = parseGerritResponse<GerritAccount>(text);
      await cache.set(cacheKey, account);
      return account;
    } catch (err) {
      if (err instanceof AccountResolutionError) throw err;
      throw new AccountResolutionError(`Failed to fetch account detail: ${(err as Error).message}`, 'UPSTREAM_ERROR');
    }
  }

  const safeQuery = encodeURIComponent(trimmed);
  const searchUrl = `${env.GERRIT_BASE_URL}/accounts/?q=${safeQuery}&n=5`;

  let candidates: GerritAccount[] = [];
  try {
    const resp = await fetchFn(searchUrl, { headers: requestHeaders });
    if (!resp.ok) {
      throw new AccountResolutionError(`Gerrit accounts search returned HTTP ${resp.status}`, 'UPSTREAM_ERROR');
    }
    const text = await resp.text();
    candidates = parseGerritResponse<GerritAccount[]>(text);
  } catch (err) {
    if (err instanceof AccountResolutionError) throw err;
    throw new AccountResolutionError(`Error contacting Gerrit account registry: ${(err as Error).message}`, 'UPSTREAM_ERROR');
  }

  if (!candidates || candidates.length === 0) {
    throw new AccountResolutionError(`No Gerrit account found matching '${trimmed}'`, 'ACCOUNT_NOT_FOUND');
  }

  let targetAccountId: number;
  if (candidates.length === 1) {
    targetAccountId = candidates[0]._account_id;
  } else {
    const exactUsername = candidates.find(
      (c) => c.username && c.username.toLowerCase() === trimmed.toLowerCase()
    );
    if (exactUsername) {
      targetAccountId = exactUsername._account_id;
    } else {
      const safeCandidates: DisambiguationCandidate[] = candidates.map((c) => ({
        _account_id: c._account_id,
        name: c.name,
        username: c.username,
        status: c.status
      }));

      throw new AccountResolutionError(
        `Multiple Gerrit accounts match '${trimmed}'. Please select your exact account.`,
        'AMBIGUOUS_ACCOUNT_RESOLUTION',
        safeCandidates
      );
    }
  }

  const detailUrl = `${env.GERRIT_BASE_URL}/accounts/${targetAccountId}/detail`;
  try {
    const detailResp = await fetchFn(detailUrl, { headers: requestHeaders });
    if (!detailResp.ok) {
      throw new AccountResolutionError(`Failed to fetch details for account #${targetAccountId}`, 'UPSTREAM_ERROR');
    }
    const detailText = await detailResp.text();
    const resolvedAccount = parseGerritResponse<GerritAccount>(detailText);
    await cache.set(cacheKey, resolvedAccount);
    await cache.set(buildCacheKey('contributor', resolvedAccount._account_id), resolvedAccount);
    return resolvedAccount;
  } catch (err) {
    if (err instanceof AccountResolutionError) throw err;
    throw new AccountResolutionError(`Error loading account details: ${(err as Error).message}`, 'UPSTREAM_ERROR');
  }
}
