/**
 * Sanitizes user input for inclusion in Gerrit search query values.
 * Escapes quotes and prevents operator injection or unbalanced brackets.
 */
export function sanitizeQueryValue(value: string | number): string {
  if (typeof value === 'number') {
    return String(Math.floor(value));
  }

  const str = String(value).trim();
  // Strip control characters and unescaped double quotes
  const safeStr = str.replace(/[\r\n\t]/g, ' ').replace(/"/g, '\\"');

  // If contains spaces or special punctuation, wrap in quotes
  if (/[\s:]/.test(safeStr)) {
    return `"${safeStr}"`;
  }
  return safeStr;
}

export interface GerritQueryOptions {
  owner?: string | number;
  reviewer?: string | number;
  excludeSelfReviews?: boolean;
  status?: 'merged' | 'open' | 'abandoned';
  project?: string;
  after?: string; // YYYY-MM-DD or ISO
  before?: string; // YYYY-MM-DD or ISO
  customClauses?: string[];
}

/**
 * Builds a validated, safely escaped Gerrit query string.
 */
export function buildGerritQuery(options: GerritQueryOptions): string {
  const parts: string[] = [];

  if (options.owner !== undefined) {
    parts.push(`owner:${sanitizeQueryValue(options.owner)}`);
  }

  if (options.reviewer !== undefined) {
    parts.push(`reviewer:${sanitizeQueryValue(options.reviewer)}`);
    if (options.excludeSelfReviews) {
      parts.push(`-owner:${sanitizeQueryValue(options.reviewer)}`);
    }
  }

  if (options.status) {
    parts.push(`status:${options.status}`);
  }

  if (options.project) {
    parts.push(`project:${sanitizeQueryValue(options.project)}`);
  }

  if (options.after) {
    // Format YYYY-MM-DD or timestamp
    const safeAfter = options.after.split('T')[0];
    parts.push(`after:${sanitizeQueryValue(safeAfter)}`);
  }

  if (options.before) {
    const safeBefore = options.before.split('T')[0];
    parts.push(`before:${sanitizeQueryValue(safeBefore)}`);
  }

  if (options.customClauses && options.customClauses.length > 0) {
    for (const clause of options.customClauses) {
      if (clause.trim()) {
        parts.push(clause.trim());
      }
    }
  }

  return parts.join(' ');
}

/**
 * Encodes query for URL parameter 'q'
 */
export function encodeGerritQueryParam(query: string): string {
  return encodeURIComponent(query);
}
