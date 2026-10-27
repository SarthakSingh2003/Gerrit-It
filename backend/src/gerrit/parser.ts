export function stripXSSIPrefix(raw: string): string {
  if (typeof raw !== 'string') {
    throw new TypeError(`Expected string payload, received ${typeof raw}`);
  }

  const trimmed = raw.trimStart();
  if (trimmed.startsWith(")]}'")) {
    return trimmed.slice(4).trimStart();
  }

  return raw;
}

export function parseGerritResponse<T = unknown>(rawResponse: string): T {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('Empty or invalid Gerrit response payload');
  }

  const cleanJson = stripXSSIPrefix(rawResponse);

  try {
    return JSON.parse(cleanJson) as T;
  } catch (error) {
    const preview = rawResponse.length > 150 ? rawResponse.slice(0, 150) + '...' : rawResponse;
    throw new Error(`Failed to parse Gerrit JSON response: ${(error as Error).message}. Payload preview: ${preview}`);
  }
}
