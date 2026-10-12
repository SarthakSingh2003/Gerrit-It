<template>
  <div class="wgt-date-picker" role="region" aria-label="Days-Wise Analysis and Time Range Filtering">
    <div class="wgt-preset-header">
      <span class="wgt-preset-title">📅 Days-Wise Analysis:</span>
    </div>
    <div class="wgt-preset-chips" role="group" aria-label="Days-wise Analysis Presets">
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        :class="['wgt-chip-btn', { 'wgt-chip-selected': selectedPreset === p.id }]"
        @click="selectPreset(p.id)"
        :aria-pressed="selectedPreset === p.id"
      >
        {{ p.label }}
      </button>
    </div>

    <div v-if="selectedPreset === 'custom'" class="wgt-custom-range-inputs">
      <div class="wgt-date-field">
        <label for="wgt-start-date">Start Date</label>
        <input
          id="wgt-start-date"
          type="date"
          v-model="customStart"
          class="wgt-input"
          @change="emitCustomRange"
        />
      </div>
      <div class="wgt-date-field">
        <label for="wgt-end-date">End Date</label>
        <input
          id="wgt-end-date"
          type="date"
          v-model="customEnd"
          class="wgt-input"
          @change="emitCustomRange"
        />
      </div>
      <button
        type="button"
        class="wgt-apply-btn"
        @click="emitCustomRange"
      >
        Apply Range
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  initialPreset?: string;
  initialStart?: string;
  initialEnd?: string;
}>();

const emit = defineEmits<{
  (e: 'change', payload: { preset: string; startDate?: string; endDate?: string }): void;
}>();

const selectedPreset = ref(props.initialPreset || 'lifetime');
const customStart = ref(props.initialStart || '');
const customEnd = ref(props.initialEnd || '');

const presets = [
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_14_days', label: 'Last 14 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'last_60_days', label: 'Last 60 Days' },
  { id: 'last_90_days', label: 'Last 90 Days' },
  { id: 'last_180_days', label: 'Last 180 Days' },
  { id: 'last_365_days', label: 'Last 365 Days' },
  { id: 'lifetime', label: 'All Time (Lifetime)' },
  { id: 'custom', label: 'Custom Days Range...' }
];

const selectPreset = (presetId: string) => {
  selectedPreset.value = presetId;
  if (presetId !== 'custom') {
    emit('change', { preset: presetId });
  }
};

const emitCustomRange = () => {
  if (selectedPreset.value === 'custom') {
    emit('change', {
      preset: 'custom',
      startDate: customStart.value || undefined,
      endDate: customEnd.value || undefined
    });
  }
};
</script>

<style scoped>
.wgt-date-picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wgt-preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.wgt-chip-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--wgt-border-subtle);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.wgt-chip-btn:hover {
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-primary);
  border-color: var(--wgt-border-base);
}

.wgt-chip-selected {
  background-color: var(--wgt-color-primary) !important;
  color: #ffffff !important;
  border-color: var(--wgt-color-primary) !important;
  font-weight: 600;
}

.wgt-custom-range-inputs {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--wgt-bg-subtle);
  border-radius: var(--wgt-radius);
  flex-wrap: wrap;
}

.wgt-date-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wgt-date-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--wgt-text-secondary);
}

.wgt-input {
  padding: 0.4rem 0.6rem;
  border-radius: var(--wgt-radius);
  border: 1px solid var(--wgt-border-base);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
  font-family: inherit;
  font-size: 0.85rem;
}

.wgt-apply-btn {
  padding: 0.45rem 0.9rem;
  border-radius: var(--wgt-radius);
  border: 1px solid var(--wgt-color-primary);
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.wgt-apply-btn:hover {
  background-color: var(--wgt-color-primary-hover);
}
</style>
