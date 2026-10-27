export function sanitizeQueryValue(value: string | number): string {
  if (typeof value === 'number') {
    return String(Math.floor(value));
  }

  const str = String(value).trim();
  const safeStr = str.replace(/[\r\n\t]/g, ' ').replace(/"/g, '\\"');

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
  after?: string;
  before?: string;
  customClauses?: string[];
}

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

export function encodeGerritQueryParam(query: string): string {
  return encodeURIComponent(query);
}
