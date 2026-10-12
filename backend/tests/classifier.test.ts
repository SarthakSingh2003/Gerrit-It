import { describe, it, expect } from 'vitest';
import { classifyRepository } from '../src/classification/repo.classifier.js';

describe('Repository Classification Engine', () => {
  it('classifies MediaWiki Core deterministically', () => {
    const res = classifyRepository('mediawiki/core');
    expect(res.category).toBe('Core');
    expect(res.displayLabel).toBe('MediaWiki Core');
    expect(res.originalName).toBe('mediawiki/core');
    expect(res.gerritUrl).toContain('mediawiki%2Fcore');
  });

  it('classifies MediaWiki Extensions and extracts extension name', () => {
    const res = classifyRepository('mediawiki/extensions/VisualEditor');
    expect(res.category).toBe('Extension');
    expect(res.displayLabel).toBe('Extension: VisualEditor');
    expect(res.originalName).toBe('mediawiki/extensions/VisualEditor');
  });

  it('classifies MediaWiki Skins and extracts skin name', () => {
    const res = classifyRepository('mediawiki/skins/Vector');
    expect(res.category).toBe('Skin');
    expect(res.displayLabel).toBe('Skin: Vector');
    expect(res.originalName).toBe('mediawiki/skins/Vector');
  });

  it('classifies Pywikibot ecosystem and extracts component name', () => {
    const res = classifyRepository('pywikibot/core');
    expect(res.category).toBe('Bot ecosystem');
    expect(res.displayLabel).toBe('Pywikibot: core');
  });

  it('classifies Codex design system repositories', () => {
    const res1 = classifyRepository('design/codex');
    expect(res1.category).toBe('Design system');
    expect(res1.displayLabel).toBe('Codex');

    const res2 = classifyRepository('design/codex-tokens');
    expect(res2.category).toBe('Design system');
    expect(res2.displayLabel).toBe('Codex');
  });

  it('classifies Operations and infrastructure repositories', () => {
    const res = classifyRepository('operations/puppet');
    expect(res.category).toBe('Infrastructure');
    expect(res.displayLabel).toBe('Operations: puppet');
  });

  it('falls back to Other for unrecognized repositories without altering name', () => {
    const res = classifyRepository('wikidata/query/gui');
    expect(res.category).toBe('Other');
    expect(res.displayLabel).toBe('wikidata/query/gui');
    expect(res.originalName).toBe('wikidata/query/gui');
  });

  it('handles empty, null, and undefined project names safely', () => {
    const resEmpty = classifyRepository('');
    expect(resEmpty.category).toBe('Other');
    expect(resEmpty.displayLabel).toBe('Unknown Repository');

    const resNull = classifyRepository(null as unknown as string);
    expect(resNull.category).toBe('Other');
    expect(resNull.displayLabel).toBe('Unknown Repository');

    const resUndefined = classifyRepository(undefined);
    expect(resUndefined.category).toBe('Other');
    expect(resUndefined.displayLabel).toBe('Unknown Repository');
  });
});
