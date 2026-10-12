export type RepoCategory =
  | 'Extension'
  | 'Skin'
  | 'Core'
  | 'Bot ecosystem'
  | 'Design system'
  | 'Infrastructure'
  | 'Other';

export interface ClassificationRule {
  id: string;
  category: RepoCategory;
  pattern: RegExp;
  getLabel: (projectName: string, match: RegExpMatchArray) => string;
}

export const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    id: 'core',
    category: 'Core',
    pattern: /^mediawiki\/core$/,
    getLabel: () => 'MediaWiki Core'
  },
  {
    id: 'extension',
    category: 'Extension',
    pattern: /^mediawiki\/extensions\/(.+)$/,
    getLabel: (_projectName, match) => `Extension: ${match[1]}`
  },
  {
    id: 'skin',
    category: 'Skin',
    pattern: /^mediawiki\/skins\/(.+)$/,
    getLabel: (_projectName, match) => `Skin: ${match[1]}`
  },
  {
    id: 'bot_ecosystem',
    category: 'Bot ecosystem',
    pattern: /^pywikibot\/(.+)$/,
    getLabel: (_projectName, match) => `Pywikibot: ${match[1]}`
  },
  {
    id: 'design_system',
    category: 'Design system',
    pattern: /^design\/codex.*$/,
    getLabel: () => 'Codex'
  },
  {
    id: 'infrastructure',
    category: 'Infrastructure',
    pattern: /^operations\/(.+)$/,
    getLabel: (_projectName, match) => `Operations: ${match[1]}`
  }
];
