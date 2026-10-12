<template>
  <div class="wgt-changelist-wrapper" role="region" aria-label="Individual Patch Changes">
    <div class="wgt-changelist-header">
      <div>
        <h3 class="wgt-changelist-title">{{ title }}</h3>
        <p class="wgt-changelist-subtitle">{{ subtitle }}</p>
      </div>

      <div class="wgt-changelist-actions">
        <!-- Status filter buttons -->
        <div class="wgt-status-filters">
          <button
            type="button"
            :class="['wgt-filter-pill', { active: statusFilter === 'all' }]"
            @click="statusFilter = 'all'"
          >
            All ({{ changes.length }})
          </button>
          <button
            type="button"
            :class="['wgt-filter-pill', { active: statusFilter === 'merged' }]"
            @click="statusFilter = 'merged'"
          >
            Merged ({{ countMerged }})
          </button>
          <button
            type="button"
            :class="['wgt-filter-pill', { active: statusFilter === 'open' }]"
            @click="statusFilter = 'open'"
          >
            Open ({{ countOpen }})
          </button>
          <button
            type="button"
            :class="['wgt-filter-pill', { active: statusFilter === 'abandoned' }]"
            @click="statusFilter = 'abandoned'"
          >
            Abandoned ({{ countAbandoned }})
          </button>
        </div>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by subject or repo..."
          class="wgt-change-search"
          aria-label="Filter changes"
        />
      </div>
    </div>

    <div class="wgt-changes-table-container">
      <table class="wgt-changes-table">
        <thead>
          <tr>
            <th scope="col" style="width: 80px;">#</th>
            <th scope="col">Subject</th>
            <th scope="col">Repository</th>
            <th scope="col" style="width: 110px;">Status</th>
            <th scope="col" style="width: 110px;">Date</th>
            <th scope="col" style="width: 90px; text-align: center;">Verify</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredChanges.length === 0">
            <td colspan="6" class="wgt-empty">
              No patch changes match the selected filter.
            </td>
          </tr>
          <tr
            v-for="c in pagedChanges"
            :key="c.changeNumber"
            class="wgt-change-row"
            @click="inspectChange(c)"
          >
            <td class="font-mono text-subtle">
              #{{ c.changeNumber }}
            </td>
            <td class="wgt-subject-cell">
              <span class="wgt-subject-text">{{ c.subject }}</span>
              <span v-if="c.userReviewScore !== undefined" class="wgt-review-vote-tag">
                Vote: {{ c.userReviewScore > 0 ? `+${c.userReviewScore}` : c.userReviewScore }}
              </span>
            </td>
            <td>
              <span class="wgt-repo-pill">{{ c.project }}</span>
            </td>
            <td>
              <StatusBadge :status="c.status" />
            </td>
            <td class="font-compact text-subtle">
              {{ (c.submitted || c.created || '').split(' ')[0] }}
            </td>
            <td style="text-align: center;" @click.stop>
              <a
                :href="c.gerritUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="wgt-inspect-btn"
                title="Inspect on Wikimedia Gerrit"
              >
                Gerrit ↗
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="wgt-pagination-bar">
      <span>Showing {{ (page - 1) * pageSize + 1 }} - {{ Math.min(page * pageSize, filteredChanges.length) }} of {{ filteredChanges.length }} changes</span>
      <div class="wgt-page-nav">
        <button type="button" :disabled="page === 1" @click="page--">Prev</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button type="button" :disabled="page === totalPages" @click="page++">Next</button>
      </div>
    </div>

    <!-- Inspection Modal -->
    <ChangeDetailModal :change="inspectedChange" @close="inspectedChange = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NormalizedChange } from '../types/index.js';
import StatusBadge from './StatusBadge.vue';
import ChangeDetailModal from './ChangeDetailModal.vue';

const props = withDefaults(
  defineProps<{
    changes: NormalizedChange[];
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: 'Individual Patch Records',
    subtitle: 'Inspect individual Gerrit changes, diff sizes, and review statuses'
  }
);

const statusFilter = ref<'all' | 'merged' | 'open' | 'abandoned'>('all');
const searchQuery = ref('');
const page = ref(1);
const pageSize = 15;
const inspectedChange = ref<NormalizedChange | null>(null);

const countMerged = computed(() => props.changes.filter((c) => c.status === 'merged').length);
const countOpen = computed(() => props.changes.filter((c) => c.status === 'open').length);
const countAbandoned = computed(() => props.changes.filter((c) => c.status === 'abandoned').length);

const filteredChanges = computed(() => {
  return props.changes.filter((c) => {
    const matchesStatus =
      statusFilter.value === 'all' || c.status === statusFilter.value;
    const matchesSearch =
      !searchQuery.value ||
      c.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.project.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      String(c.changeNumber).includes(searchQuery.value);

    return matchesStatus && matchesSearch;
  });
});

const totalPages = computed(() => Math.ceil(filteredChanges.value.length / pageSize) || 1);

const pagedChanges = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredChanges.value.slice(start, start + pageSize);
});

const inspectChange = (change: NormalizedChange) => {
  inspectedChange.value = change;
};
</script>

<style scoped>
.wgt-changelist-wrapper {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2rem;
  box-shadow: var(--wgt-shadow-card);
  margin-top: 1.5rem;
  width: 100%;
}

.wgt-changelist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.wgt-changelist-title {
  font-size: 1.25rem;
  font-weight: 750;
  color: var(--wgt-text-primary);
  margin-bottom: 0.2rem;
}

.wgt-changelist-subtitle {
  font-size: 0.88rem;
  color: var(--wgt-text-subtle);
}

.wgt-changelist-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.wgt-status-filters {
  display: flex;
  gap: 0.35rem;
}

.wgt-filter-pill {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  border: 1px solid var(--wgt-border-subtle);
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.wgt-filter-pill.active {
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  border-color: var(--wgt-color-primary);
  font-weight: 600;
}

.wgt-change-search {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid var(--wgt-border-base);
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-base);
  color: var(--wgt-text-primary);
  width: 220px;
}

.wgt-changes-table-container {
  overflow-x: auto;
}

.wgt-changes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.wgt-changes-table th,
.wgt-changes-table td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--wgt-border-light);
  text-align: left;
}

.wgt-changes-table th {
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
}

.wgt-change-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.wgt-change-row:hover {
  background-color: var(--wgt-bg-subtle);
}

.wgt-subject-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.wgt-subject-text {
  font-weight: 600;
  color: var(--wgt-text-primary);
}

.wgt-review-vote-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: #7b1fa2;
}

.wgt-repo-pill {
  font-size: 0.78rem;
  font-family: var(--wgt-font-mono);
  color: var(--wgt-text-secondary);
}

.font-mono {
  font-family: var(--wgt-font-mono);
}

.font-compact {
  font-size: 0.82rem;
}

.text-subtle {
  color: var(--wgt-text-subtle);
}

.wgt-inspect-btn {
  font-size: 0.8rem;
  color: var(--wgt-color-primary);
  font-weight: 600;
}

.wgt-empty {
  text-align: center;
  padding: 2rem !important;
  color: var(--wgt-text-subtle);
}

.wgt-pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.82rem;
  color: var(--wgt-text-subtle);
}

.wgt-page-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wgt-page-nav button {
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.wgt-page-nav button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
