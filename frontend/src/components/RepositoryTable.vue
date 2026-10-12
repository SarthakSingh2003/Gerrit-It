<template>
  <div class="wgt-repo-table-card" role="region" aria-label="Repository Contribution Table">
    <div class="wgt-table-header-row">
      <div>
        <h3 class="wgt-table-title">Repository Footprint</h3>
        <p class="wgt-table-desc">All Wikimedia technical repositories touched by authored code or reviews</p>
      </div>

      <!-- Search input within repositories -->
      <div class="wgt-table-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter repositories..."
          class="wgt-repo-search-input"
          aria-label="Filter repositories by name"
        />
      </div>
    </div>

    <!-- Category filter chips -->
    <div class="wgt-cat-chips-row">
      <button
        type="button"
        :class="['wgt-cat-filter-btn', { 'btn-active': selectedCategory === 'all' }]"
        @click="selectedCategory = 'all'"
      >
        All ({{ repositories.length }})
      </button>
      <button
        v-for="cat in availableCategories"
        :key="cat"
        type="button"
        :class="['wgt-cat-filter-btn', { 'btn-active': selectedCategory === cat }]"
        @click="selectedCategory = cat"
      >
        {{ cat }} ({{ getCategoryCount(cat) }})
      </button>
    </div>

    <!-- The Accessible Table -->
    <div class="wgt-table-container">
      <table class="wgt-data-table">
        <thead>
          <tr>
            <th scope="col" @click="toggleSort('project')" class="sortable">
              Repository Name
              <span class="sort-icon">{{ getSortIcon('project') }}</span>
            </th>
            <th scope="col" @click="toggleSort('category')" class="sortable">
              Category
              <span class="sort-icon">{{ getSortIcon('category') }}</span>
            </th>
            <th scope="col" @click="toggleSort('mergedCount')" class="sortable num-col">
              Merged
              <span class="sort-icon">{{ getSortIcon('mergedCount') }}</span>
            </th>
            <th scope="col" @click="toggleSort('openCount')" class="sortable num-col">
              Open
              <span class="sort-icon">{{ getSortIcon('openCount') }}</span>
            </th>
            <th scope="col" @click="toggleSort('abandonedCount')" class="sortable num-col">
              Abandoned
              <span class="sort-icon">{{ getSortIcon('abandonedCount') }}</span>
            </th>
            <th scope="col" @click="toggleSort('reviewedCount')" class="sortable num-col">
              Reviewed
              <span class="sort-icon">{{ getSortIcon('reviewedCount') }}</span>
            </th>
            <th scope="col" class="action-col">Verify Upstream</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRepos.length === 0">
            <td colspan="7" class="wgt-empty-cell">
              No repositories found matching filters.
            </td>
          </tr>
          <tr v-for="repo in pagedRepos" :key="repo.project">
            <td class="wgt-repo-name-cell">
              <span class="wgt-repo-display">{{ repo.categoryLabel }}</span>
              <span class="wgt-repo-raw">{{ repo.project }}</span>
            </td>
            <td>
              <CategoryBadge :category="repo.category" />
            </td>
            <td class="num-col font-bold text-merged">
              {{ repo.mergedCount > 0 ? repo.mergedCount : '0' }}
            </td>
            <td class="num-col text-open">
              {{ repo.openCount > 0 ? repo.openCount : '0' }}
            </td>
            <td class="num-col text-abandoned">
              {{ repo.abandonedCount > 0 ? repo.abandonedCount : '0' }}
            </td>
            <td class="num-col font-bold text-reviewed">
              {{ repo.reviewedCount > 0 ? repo.reviewedCount : '0' }}
            </td>
            <td class="action-col">
              <a
                :href="repo.gerritUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="wgt-table-link"
                :title="`Inspect changes in ${repo.project} on Gerrit`"
              >
                Inspect ↗
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Pagination Footer -->
    <div v-if="totalPages > 1" class="wgt-table-pagination">
      <span class="wgt-page-info">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredRepos.length) }} of {{ filteredRepos.length }} repositories
      </span>
      <div class="wgt-page-btns">
        <button
          type="button"
          class="wgt-page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>
        <span class="wgt-page-current">{{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="wgt-page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RepositoryContributionStats, RepoCategory } from '../types/index.js';
import CategoryBadge from './CategoryBadge.vue';

const props = defineProps<{
  repositories: RepositoryContributionStats[];
}>();

const searchQuery = ref('');
const selectedCategory = ref<string>('all');
const sortKey = ref<string>('mergedCount');
const sortOrder = ref<'asc' | 'desc'>('desc');
const currentPage = ref(1);
const pageSize = 12;

const availableCategories: RepoCategory[] = [
  'Core',
  'Extension',
  'Skin',
  'Bot ecosystem',
  'Design system',
  'Infrastructure',
  'Other'
];

const getCategoryCount = (cat: string) => {
  return props.repositories.filter((r) => r.category === cat).length;
};

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = key === 'project' || key === 'category' ? 'asc' : 'desc';
  }
};

const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return '↕';
  return sortOrder.value === 'asc' ? '↑' : '↓';
};

const filteredRepos = computed(() => {
  return props.repositories.filter((r) => {
    const matchesSearch =
      !searchQuery.value ||
      r.project.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.categoryLabel.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory =
      selectedCategory.value === 'all' || r.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const aVal = a[sortKey.value as keyof RepositoryContributionStats] ?? '';
    const bVal = b[sortKey.value as keyof RepositoryContributionStats] ?? '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const totalPages = computed(() => Math.ceil(filteredRepos.value.length / pageSize) || 1);

const pagedRepos = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredRepos.value.slice(start, start + pageSize);
});
</script>

<style scoped>
.wgt-repo-table-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2rem;
  box-shadow: var(--wgt-shadow-card);
  margin-top: 1.5rem;
  width: 100%;
}

.wgt-table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.wgt-table-title {
  font-size: 1.25rem;
  font-weight: 750;
  color: var(--wgt-text-primary);
  margin-bottom: 0.2rem;
}

.wgt-table-desc {
  font-size: 0.88rem;
  color: var(--wgt-text-subtle);
}

.wgt-repo-search-input {
  padding: 0.5rem 0.85rem;
  font-size: 0.88rem;
  border: 1px solid var(--wgt-border-base);
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-base);
  color: var(--wgt-text-primary);
  width: 280px;
}

.wgt-cat-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.wgt-cat-filter-btn {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--wgt-border-subtle);
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.wgt-cat-filter-btn:hover {
  border-color: var(--wgt-border-base);
  color: var(--wgt-text-primary);
}

.wgt-cat-filter-btn.btn-active {
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  border-color: var(--wgt-color-primary);
  font-weight: 600;
}

.wgt-table-container {
  overflow-x: auto;
}

.wgt-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  text-align: left;
}

.wgt-data-table th,
.wgt-data-table td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--wgt-border-light);
}

.wgt-data-table th {
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-secondary);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  user-select: none;
}

.wgt-data-table th.sortable {
  cursor: pointer;
}

.wgt-data-table th.sortable:hover {
  color: var(--wgt-text-primary);
}

.sort-icon {
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

.num-col {
  text-align: right;
}

.action-col {
  text-align: center;
  width: 110px;
}

.font-bold {
  font-weight: 700;
}

.wgt-repo-name-cell {
  display: flex;
  flex-direction: column;
}

.wgt-repo-display {
  font-weight: 600;
  color: var(--wgt-text-primary);
}

.wgt-repo-raw {
  font-size: 0.75rem;
  color: var(--wgt-text-subtle);
  font-family: var(--wgt-font-mono);
}

.wgt-table-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--wgt-color-primary);
}

.wgt-empty-cell {
  text-align: center;
  padding: 2rem !important;
  color: var(--wgt-text-subtle);
}

.wgt-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--wgt-text-subtle);
}

.wgt-page-btns {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wgt-page-btn {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.wgt-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wgt-page-current {
  font-weight: 600;
}
</style>
