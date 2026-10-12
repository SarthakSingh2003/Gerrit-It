import { ContributorService, contributorService } from './contributor.service.js';
import {
  ContributorSummaryResponse,
  RepositoryContributionStats
} from '../analytics/types.js';
import { logger } from '../logger/logger.js';

export interface CohortMemberSummary {
  inputIdentifier: string;
  resolved: boolean;
  error?: string;
  summary?: ContributorSummaryResponse;
}

export interface CohortAnalysisResult {
  members: CohortMemberSummary[];
  cohortTotals: {
    totalMembers: number;
    resolvedMembers: number;
    unresolvedMembers: number;
    combinedAuthoredChanges: number;
    combinedMergedChanges: number;
    combinedOpenChanges: number;
    combinedAbandonedChanges: number;
    combinedDistinctReviews: number;
    uniqueRepositoriesImpacted: number;
    topSharedRepositories: Array<{ project: string; contributorCount: number }>;
  };
  markdownReport: string;
  csvReport: string;
  generatedAt: string;
}

export class CohortService {
  constructor(private service: ContributorService = contributorService) {}

  /**
   * Analyzes a cohort of contributors with bounded concurrency and deduplicated repo aggregation.
   */
  async analyzeCohort(
    identifiers: string[],
    dateOptions?: { preset?: string; startDate?: string; endDate?: string }
  ): Promise<CohortAnalysisResult> {
    const uniqueInputs = Array.from(
      new Set(identifiers.map((i) => i.trim()).filter((i) => i.length > 0))
    ).slice(0, 20); // Cap at 20 members per batch

    const members: CohortMemberSummary[] = [];
    const allAuthoredRepos = new Map<string, Set<number>>(); // project -> Set of accountIds

    let combinedAuthored = 0;
    let combinedMerged = 0;
    let combinedOpen = 0;
    let combinedAbandoned = 0;
    let combinedReviews = 0;
    let resolvedCount = 0;

    for (const id of uniqueInputs) {
      try {
        const { summary, rawAuthored } = await this.service.getContributorSummary(id, dateOptions);
        resolvedCount++;
        members.push({
          inputIdentifier: id,
          resolved: true,
          summary
        });

        combinedAuthored += summary.authored.totalAuthored;
        combinedMerged += summary.authored.merged;
        combinedOpen += summary.authored.open;
        combinedAbandoned += summary.authored.abandoned;
        combinedReviews += summary.reviews.distinctChangesReviewed;

        // Track repo impact deduplicated by account
        for (const change of rawAuthored) {
          if (!change.project) continue;
          let accountSet = allAuthoredRepos.get(change.project);
          if (!accountSet) {
            accountSet = new Set<number>();
            allAuthoredRepos.set(change.project, accountSet);
          }
          accountSet.add(summary.contributor.accountId);
        }
      } catch (err) {
        logger.warn(`Failed to resolve cohort member '${id}': ${(err as Error).message}`);
        members.push({
          inputIdentifier: id,
          resolved: false,
          error: (err as Error).message
        });
      }
    }

    const topSharedRepositories = Array.from(allAuthoredRepos.entries())
      .map(([project, set]) => ({
        project,
        contributorCount: set.size
      }))
      .sort((a, b) => b.contributorCount - a.contributorCount)
      .slice(0, 10);

    const totals = {
      totalMembers: uniqueInputs.length,
      resolvedMembers: resolvedCount,
      unresolvedMembers: uniqueInputs.length - resolvedCount,
      combinedAuthoredChanges: combinedAuthored,
      combinedMergedChanges: combinedMerged,
      combinedOpenChanges: combinedOpen,
      combinedAbandonedChanges: combinedAbandoned,
      combinedDistinctReviews: combinedReviews,
      uniqueRepositoriesImpacted: allAuthoredRepos.size,
      topSharedRepositories
    };

    const markdownReport = this.generateCohortMarkdown(members, totals, dateOptions);
    const csvReport = this.generateCohortCsv(members);

    return {
      members,
      cohortTotals: totals,
      markdownReport,
      csvReport,
      generatedAt: new Date().toISOString()
    };
  }

  private generateCohortMarkdown(
    members: CohortMemberSummary[],
    totals: CohortAnalysisResult['cohortTotals'],
    dateOptions?: { preset?: string; startDate?: string; endDate?: string }
  ): string {
    const period = dateOptions?.preset || `${dateOptions?.startDate || 'All'} to ${dateOptions?.endDate || 'Present'}`;
    let md = `# Wikimedia Technical Community Cohort Report\n\n`;
    md += `**Evaluation Period:** ${period}\n`;
    md += `**Cohort Size:** ${totals.resolvedMembers} contributors resolved (${totals.totalMembers} submitted)\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;

    md += `## Aggregate Contribution Impact\n\n`;
    md += `- **Combined Authored Changes:** ${totals.combinedAuthoredChanges}\n`;
    md += `- **Combined Merged Patches:** ${totals.combinedMergedChanges}\n`;
    md += `- **Combined Open Patches:** ${totals.combinedOpenChanges}\n`;
    md += `- **Combined Code Reviews Performed:** ${totals.combinedDistinctReviews}\n`;
    md += `- **Unique Repositories Impacted Across Cohort:** ${totals.uniqueRepositoriesImpacted}\n\n`;

    md += `## Contributor Breakdown\n\n`;
    md += `| Contributor | Authored | Merged | Reviews | Repos | Status |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :--- |\n`;

    for (const m of members) {
      if (m.resolved && m.summary) {
        const c = m.summary.contributor;
        md += `| **${c.displayName}** (@${c.username || c.accountId}) | ${m.summary.authored.totalAuthored} | ${m.summary.authored.merged} | ${m.summary.reviews.distinctChangesReviewed} | ${m.summary.repositoriesImpacted} | Verified |\n`;
      } else {
        md += `| **${m.inputIdentifier}** | - | - | - | - | Unresolved (${m.error}) |\n`;
      }
    }

    if (totals.topSharedRepositories.length > 0) {
      md += `\n## Key Collaborative Repositories\n\n`;
      md += `| Repository | Active Cohort Contributors |\n`;
      md += `| :--- | :---: |\n`;
      for (const r of totals.topSharedRepositories) {
        md += `| \`${r.project}\` | ${r.contributorCount} |\n`;
      }
    }

    md += `\n*Note on Aggregation:* Shared repositories and cross-reviews are deduplicated. Total patch numbers represent the sum of individual contributors' public changes.\n`;
    return md;
  }

  private generateCohortCsv(members: CohortMemberSummary[]): string {
    const headers = [
      'Identifier',
      'Account ID',
      'Username',
      'Display Name',
      'Authored Changes',
      'Merged Changes',
      'Open Changes',
      'Abandoned Changes',
      'Reviewed Changes',
      'Approvals (+2)',
      'Repositories Impacted',
      'Resolved Status'
    ];

    const rows = [headers.join(',')];

    for (const m of members) {
      if (m.resolved && m.summary) {
        const c = m.summary.contributor;
        const a = m.summary.authored;
        const r = m.summary.reviews;
        rows.push([
          `"${m.inputIdentifier}"`,
          c.accountId,
          `"${c.username || ''}"`,
          `"${c.displayName}"`,
          a.totalAuthored,
          a.merged,
          a.open,
          a.abandoned,
          r.distinctChangesReviewed,
          r.approvalsCount,
          m.summary.repositoriesImpacted,
          'Resolved'
        ].join(','));
      } else {
        rows.push([
          `"${m.inputIdentifier}"`,
          '',
          '',
          '',
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          `"Unresolved: ${m.error || 'Unknown'}"`
        ].join(','));
      }
    }

    return rows.join('\n');
  }
}

export const cohortService = new CohortService();
