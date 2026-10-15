<template>
  <div v-if="change" class="wgt-modal-backdrop" @click.self="$emit('close')">
    <div class="wgt-modal-content" role="dialog" aria-modal="true" :aria-label="`Change #${change.changeNumber}`">
      <div class="wgt-modal-header">
        <div>
          <span class="wgt-modal-eyebrow">Gerrit Change #{{ change.changeNumber }}</span>
          <h2 class="wgt-modal-title">{{ change.subject }}</h2>
        </div>
        <button type="button" class="wgt-modal-close" @click="$emit('close')" aria-label="Close modal">×</button>
      </div>

      <div class="wgt-modal-body">
        <div class="wgt-modal-field">
          <span class="field-label">Repository:</span>
          <span class="field-value">
            <code>{{ change.project }}</code>
            <CategoryBadge :category="change.category" />
          </span>
        </div>

        <div class="wgt-modal-field">
          <span class="field-label">Status:</span>
          <span class="field-value">
            <StatusBadge :status="change.status" />
          </span>
        </div>

        <div class="wgt-modal-field">
          <span class="field-label">Created:</span>
          <span class="field-value">{{ change.created }}</span>
        </div>

        <div v-if="change.submitted" class="wgt-modal-field">
          <span class="field-label">Merged / Submitted:</span>
          <span class="field-value font-bold text-merged">{{ change.submitted }}</span>
        </div>

        <div class="wgt-modal-field">
          <span class="field-label">Diff Size:</span>
          <span class="field-value font-mono">
            <span class="text-merged">+{{ change.insertions }}</span> /
            <span class="text-abandoned">-{{ change.deletions }}</span> lines
          </span>
        </div>

        <div v-if="change.userReviewScore !== undefined" class="wgt-modal-field">
          <span class="field-label">Your Review Vote:</span>
          <span class="field-value font-bold">
            {{ change.userReviewScore > 0 ? `+${change.userReviewScore}` : change.userReviewScore }}
          </span>
        </div>

        <div class="wgt-modal-field">
          <span class="field-label">Change-Id:</span>
          <span class="field-value font-mono text-break"><code>{{ change.changeId }}</code></span>
        </div>
      </div>

      <div class="wgt-modal-footer">
        <a
          :href="change.gerritUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="wgt-gerrit-btn"
        >
          Open in Wikimedia Gerrit
        </a>
        <button type="button" class="wgt-close-btn" @click="$emit('close')">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NormalizedChange } from '../types/index.js';
import StatusBadge from './StatusBadge.vue';
import CategoryBadge from './CategoryBadge.vue';

defineProps<{
  change: NormalizedChange | null;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.wgt-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.wgt-modal-content {
  background-color: var(--wgt-bg-surface);
  border-radius: var(--wgt-radius-lg);
  border: 1px solid var(--wgt-border-subtle);
  width: 100%;
  max-width: 600px;
  box-shadow: var(--wgt-shadow-elevated);
  overflow: hidden;
}

.wgt-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--wgt-border-light);
}

.wgt-modal-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--wgt-color-primary);
  letter-spacing: 0.05em;
}

.wgt-modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--wgt-text-primary);
  margin-top: 0.2rem;
}

.wgt-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--wgt-text-subtle);
}

.wgt-modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.wgt-modal-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--wgt-border-light);
  padding-bottom: 0.4rem;
}

.field-label {
  color: var(--wgt-text-subtle);
  font-weight: 500;
}

.field-value {
  color: var(--wgt-text-primary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.text-break {
  word-break: break-all;
}

.font-mono {
  font-family: var(--wgt-font-mono);
}

.wgt-modal-footer {
  padding: 1rem 1.5rem;
  background-color: var(--wgt-bg-subtle);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.wgt-gerrit-btn {
  padding: 0.5rem 1rem;
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  border-radius: var(--wgt-radius);
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.15s ease;
}

.wgt-gerrit-btn:hover {
  background-color: var(--wgt-color-primary-hover);
  text-decoration: none;
}

[data-theme="dark"] .wgt-gerrit-btn {
  background-color: #3b5270;
  border: 1px solid #5c7ca8;
  color: #e8edf5;
}

[data-theme="dark"] .wgt-gerrit-btn:hover {
  background-color: #496386;
}

.wgt-close-btn {
  padding: 0.5rem 1rem;
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  color: var(--wgt-text-primary);
  border-radius: var(--wgt-radius);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.wgt-close-btn:hover {
  border-color: var(--wgt-color-primary);
  color: var(--wgt-color-primary);
}
</style>
