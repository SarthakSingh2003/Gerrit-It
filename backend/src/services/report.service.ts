import {
  ContributorSummaryResponse,
  RepositoryContributionStats
} from '../analytics/types.js';

export interface ReportGenerationOptions {
  includeRepositories?: boolean;
  maxRepositoriesInTable?: number;
  includeReviewDetails?: boolean;
  includeVerificationLinks?: boolean;
}

export class ReportService {
  /**
   * Generates a verifiable Markdown scholarship/grant report from contributor summary data.
   */
  static generateMarkdownReport(
    summary: ContributorSummaryResponse,
    repositories: RepositoryContributionStats[] = [],
    options: ReportGenerationOptions = {}
  ): string {
    const { contributor, authored, reviews, categoryBreakdown, dateRange, metadata } = summary;
    const includeRepos = options.includeRepositories ?? true;
    const maxRepos = options.maxRepositoriesInTable ?? 10;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const periodStr =
      dateRange.type === 'lifetime'
        ? 'Lifetime (All recorded public contributions)'
        : `${dateRange.startDate || 'Beginning'} – ${dateRange.endDate || 'Present'}`;

    const profileUrl = contributor.gerritProfileUrl;
    const authoredSearchUrl = `https://gerrit.wikimedia.org/r/q/owner:${contributor.accountId}`;
    const mergedSearchUrl = `https://gerrit.wikimedia.org/r/q/owner:${contributor.accountId}+status:merged`;
    const reviewSearchUrl = `https://gerrit.wikimedia.org/r/q/reviewer:${contributor.accountId}+-owner:${contributor.accountId}`;

    const catMap = new Map(categoryBreakdown.map((c) => [c.category, c.count]));

    let md = `# Wikimedia Technical Contribution Report\n\n`;
    md += `**Contributor:** ${contributor.displayName}${contributor.username ? ` (@${contributor.username})` : ''} (Gerrit Account ID: ${contributor.accountId})\n`;
    md += `**Reporting period:** ${periodStr}\n`;
    md += `**Data source:** Wikimedia Gerrit REST API (https://gerrit.wikimedia.org/r/)\n`;
    md += `**Generated at:** ${nowStr}\n\n`;

    md += `---\n\n`;

    md += `## Authored Contributions\n\n`;
    md += `During the selected reporting period, the contributor authored **${authored.totalAuthored}** changes, of which **${authored.merged}** were merged, **${authored.open}** remain open, and **${authored.abandoned}** were abandoned, according to retrieved Gerrit records.\n\n`;

    md += `- **Merged Patches:** ${authored.merged}\n`;
    md += `- **Open / In Review Patches:** ${authored.open}\n`;
    md += `- **Abandoned Patches:** ${authored.abandoned}\n`;
    md += `- **Total Lines Added:** +${authored.totalInsertions.toLocaleString()}\n`;
    md += `- **Total Lines Removed:** -${authored.totalDeletions.toLocaleString()}\n`;
    if (authored.firstRecordedDate) {
      md += `- **First Recorded Authored Contribution:** ${authored.firstRecordedDate}\n`;
    }
    if (authored.lastRecordedDate) {
      md += `- **Most Recent Recorded Activity:** ${authored.lastRecordedDate}\n`;
    }
    md += `\n`;

    md += `## Repository Impact\n\n`;
    md += `The contributor's code contributions span **${authored.uniqueRepositories}** unique repositories across the Wikimedia ecosystem:\n\n`;
    md += `- **MediaWiki Core:** ${catMap.get('Core') || 0} patches\n`;
    md += `- **MediaWiki Extensions:** ${catMap.get('Extension') || 0} patches\n`;
    md += `- **MediaWiki Skins:** ${catMap.get('Skin') || 0} patches\n`;
    md += `- **Codex & Design Systems:** ${catMap.get('Design system') || 0} patches\n`;
    md += `- **Pywikibot & Bot Ecosystem:** ${catMap.get('Bot ecosystem') || 0} patches\n`;
    md += `- **Infrastructure & Operations:** ${catMap.get('Infrastructure') || 0} patches\n`;
    md += `- **Other Wikimedia Repositories:** ${catMap.get('Other') || 0} patches\n\n`;

    if (includeRepos && repositories.length > 0) {
      const topRepos = repositories.slice(0, maxRepos);
      md += `### Top Impacted Repositories\n\n`;
      md += `| Repository | Category | Merged | Open | Reviewed | Direct Verification |\n`;
      md += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;
      for (const r of topRepos) {
        md += `| \`${r.project}\` | ${r.categoryLabel} | ${r.mergedCount} | ${r.openCount} | ${r.reviewedCount} | [Inspect on Gerrit](${r.gerritUrl}) |\n`;
      }
      if (repositories.length > maxRepos) {
        md += `\n*Showing top ${maxRepos} of ${repositories.length} impacted repositories.*\n`;
      }
      md += `\n`;
    }

    md += `## Code Review Contributions\n\n`;
    md += `The contributor reviewed **${reviews.distinctChangesReviewed}** distinct changes across **${reviews.uniqueReviewRepositories}** repositories during the reporting period.\n\n`;
    md += `- **Verified Approvals (Code-Review +2):** ${reviews.approvalsCount}\n`;
    md += `- **Review Recommendations (Code-Review +1):** ${reviews.recommendationsCount}\n`;
    md += `- **Automated/Verified Checks (Verified +1/+2):** ${reviews.verifiedCount}\n`;
    if (reviews.critiquesCount > 0) {
      md += `- **Actionable Critiques / Needs Improvement (Code-Review -1/-2):** ${reviews.critiquesCount}\n`;
    }
    md += `\n`;
    md += `> **Technical Collaboration Note:** ${reviews.mentorshipDisclaimer}\n\n`;

    md += `## Independent Verification Links\n\n`;
    md += `All metrics presented in this report are public and can be independently verified on Wikimedia Gerrit:\n\n`;
    md += `1. **Contributor Profile:** [${profileUrl}](${profileUrl})\n`;
    md += `2. **All Authored Patches:** [Gerrit Search Query](${authoredSearchUrl})\n`;
    md += `3. **Merged Patches:** [Gerrit Merged Query](${mergedSearchUrl})\n`;
    md += `4. **Code Review Activity:** [Gerrit Review Query](${reviewSearchUrl})\n\n`;

    md += `## Data Limitations & Completeness\n\n`;
    md += `- **Pagination Status:** ${metadata.complete ? 'Complete result set retrieved within query scope.' : metadata.warnings.join(' ')}\n`;
    md += `- **Cached Record:** ${metadata.cached ? 'Served from validated cache' : 'Live query executed'} (Latency: ${metadata.queryExecutionMs}ms)\n`;
    md += `- **Attribution Notice:** Metrics are calculated based on canonical Gerrit Account ID \`${contributor.accountId}\`.\n`;
    md += `- **Legal & Community Notice:** This report is an analytical summary generated by WikiGerritTracker under the GPL-3.0-or-later license. It is derived from public Gerrit records and does not constitute an official endorsement or certification by the Wikimedia Foundation.\n`;

    return md;
  }
}
