import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RepositoryTable from '../src/components/RepositoryTable.vue';
import { RepositoryContributionStats } from '../src/types/index.js';

const mockRepos: RepositoryContributionStats[] = [
  {
    project: 'mediawiki/core',
    category: 'Core',
    categoryLabel: 'MediaWiki Core',
    mergedCount: 30,
    openCount: 5,
    abandonedCount: 2,
    reviewedCount: 20,
    totalAuthored: 37,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:mediawiki/core'
  },
  {
    project: 'mediawiki/extensions/VisualEditor',
    category: 'Extension',
    categoryLabel: 'Extension: VisualEditor',
    mergedCount: 15,
    openCount: 2,
    abandonedCount: 1,
    reviewedCount: 10,
    totalAuthored: 18,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:mediawiki/extensions/VisualEditor'
  },
  {
    project: 'pywikibot/core',
    category: 'Bot ecosystem',
    categoryLabel: 'Pywikibot: core',
    mergedCount: 5,
    openCount: 1,
    abandonedCount: 0,
    reviewedCount: 8,
    totalAuthored: 6,
    gerritUrl: 'https://gerrit.wikimedia.org/r/q/project:pywikibot/core'
  }
];

describe('RepositoryTable Component', () => {
  it('renders repository rows with stats and upstream verification links', () => {
    const wrapper = mount(RepositoryTable, {
      props: { repositories: mockRepos }
    });

    expect(wrapper.text()).toContain('MediaWiki Core');
    expect(wrapper.text()).toContain('Extension: VisualEditor');
    expect(wrapper.text()).toContain('Pywikibot: core');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
  });

  it('filters repositories when searching by name', async () => {
    const wrapper = mount(RepositoryTable, {
      props: { repositories: mockRepos }
    });

    const searchInput = wrapper.find('.wgt-repo-search-input');
    await searchInput.setValue('VisualEditor');

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(wrapper.text()).toContain('Extension: VisualEditor');
    expect(wrapper.text()).not.toContain('Pywikibot: core');
  });

  it('filters repositories by category chip', async () => {
    const wrapper = mount(RepositoryTable, {
      props: { repositories: mockRepos }
    });

    const coreButton = wrapper.findAll('.wgt-cat-filter-btn').find((b) => b.text().includes('Core'));
    expect(coreButton).toBeDefined();

    await coreButton!.trigger('click');

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(wrapper.text()).toContain('MediaWiki Core');
    expect(wrapper.text()).not.toContain('Extension: VisualEditor');
  });
});
