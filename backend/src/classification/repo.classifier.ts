import { CLASSIFICATION_RULES, ClassificationRule, RepoCategory } from './rules.js';

export interface ClassifiedRepository {
  originalName: string;
  category: RepoCategory;
  displayLabel: string;
  ruleId: string;
  gerritUrl: string;
}

/**
 * Classifies a Gerrit repository/project name into a standardized category and display label.
 * Preserves the original project identifier, handles empty or unexpected input safely,
 * and matches deterministic rules in strict order.
 */
export function classifyRepository(
  rawProjectName: string | null | undefined,
  customRules: ClassificationRule[] = CLASSIFICATION_RULES
): ClassifiedRepository {
  const safeName = (rawProjectName ?? '').trim();

  if (!safeName) {
    return {
      originalName: '',
      category: 'Other',
      displayLabel: 'Unknown Repository',
      ruleId: 'empty_fallback',
      gerritUrl: 'https://gerrit.wikimedia.org/r/admin/repos'
    };
  }

  for (const rule of customRules) {
    const match = safeName.match(rule.pattern);
    if (match) {
      return {
        originalName: safeName,
        category: rule.category,
        displayLabel: rule.getLabel(safeName, match),
        ruleId: rule.id,
        gerritUrl: `https://gerrit.wikimedia.org/r/admin/repos/${encodeURIComponent(safeName)}`
      };
    }
  }

  // Fallback for "Other"
  return {
    originalName: safeName,
    category: 'Other',
    displayLabel: safeName,
    ruleId: 'other_fallback',
    gerritUrl: `https://gerrit.wikimedia.org/r/admin/repos/${encodeURIComponent(safeName)}`
  };
}

/**
 * Returns all available classification categories and their descriptions.
 */
export function getAvailableCategories(): Array<{ category: RepoCategory; description: string }> {
  return [
    { category: 'Core', description: 'MediaWiki Core engine' },
    { category: 'Extension', description: 'MediaWiki Extensions' },
    { category: 'Skin', description: 'MediaWiki Skins and Frontends' },
    { category: 'Bot ecosystem', description: 'Pywikibot automation and bot frameworks' },
    { category: 'Design system', description: 'Codex design system components and tokens' },
    { category: 'Infrastructure', description: 'Wikimedia operations, puppet, and deployment tools' },
    { category: 'Other', description: 'All other Wikimedia technical repositories' }
  ];
}
