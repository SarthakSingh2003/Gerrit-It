import { describe, it, expect } from 'vitest';
import { stripXSSIPrefix, parseGerritResponse } from '../src/gerrit/parser.js';

describe('Gerrit Parser & XSSI Stripper', () => {
  it('strips magic prefix )]}\'\n safely from Gerrit responses', () => {
    const raw = ")]}'\n[{\"id\": 123}]";
    const cleaned = stripXSSIPrefix(raw);
    expect(cleaned).toBe('[{"id": 123}]');
  });

  it('strips prefix when preceded by whitespace', () => {
    const raw = "   )]}'\n{\"status\": \"ok\"}";
    const cleaned = stripXSSIPrefix(raw);
    expect(cleaned).toBe('{"status": "ok"}');
  });

  it('leaves payload intact if no XSSI prefix is present', () => {
    const raw = '{"_account_id": 458}';
    expect(stripXSSIPrefix(raw)).toBe(raw);
  });

  it('parses valid Gerrit JSON correctly after removing XSSI', () => {
    const raw = ")]}'\n[{\"_account_id\": 458, \"name\": \"Legoktm\"}]";
    const result = parseGerritResponse<Array<{ _account_id: number; name: string }>>(raw);
    expect(result).toHaveLength(1);
    expect(result[0]._account_id).toBe(458);
    expect(result[0].name).toBe('Legoktm');
  });

  it('throws descriptive error on malformed JSON payload', () => {
    const malformed = ")]}'\n{ bad_json_content ";
    expect(() => parseGerritResponse(malformed)).toThrowError(/Failed to parse Gerrit JSON response/);
  });

  it('throws descriptive error on empty payload', () => {
    expect(() => parseGerritResponse('')).toThrowError(/Empty or invalid Gerrit response payload/);
  });
});
