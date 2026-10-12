import { describe, it, expect } from 'vitest';
import { ReportService } from '../src/services/report.service.js';
import { SAMPLE_CONTRIBUTOR_SUMMARY, SAMPLE_REPOSITORIES } from '../src/routes/fixture.routes.js';

describe('Report Service', () => {
  it('generates a complete, verifiable Markdown report with Gerrit links', () => {
    const markdown = ReportService.generateMarkdownReport(
      SAMPLE_CONTRIBUTOR_SUMMARY,
      SAMPLE_REPOSITORIES,
      { includeRepositories: true, maxRepositoriesInTable: 5 }
    );

    expect(markdown).toContain('# Wikimedia Technical Contribution Report');
    expect(markdown).toContain('Legoktm');
    expect(markdown).toContain('Gerrit Account ID: 458');
    expect(markdown).toContain('https://gerrit.wikimedia.org/r/q/owner:458');
    expect(markdown).toContain('MediaWiki Core');
    expect(markdown).toContain('Extension: MassMessage');
    expect(markdown).toContain('**Verified Approvals (Code-Review +2):** 38');
    expect(markdown).toContain('Technical Collaboration Note');
    expect(markdown).toContain('GPL-3.0-or-later');
  });

  it('respects repository table limit option in markdown generation', () => {
    const markdown = ReportService.generateMarkdownReport(
      SAMPLE_CONTRIBUTOR_SUMMARY,
      SAMPLE_REPOSITORIES,
      { includeRepositories: true, maxRepositoriesInTable: 2 }
    );

    expect(markdown).toContain('Showing top 2 of 6 impacted repositories');
  });
});
