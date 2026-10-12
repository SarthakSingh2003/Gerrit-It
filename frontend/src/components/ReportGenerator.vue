<template>
  <div class="wgt-report-gen-card" role="region" aria-label="Contribution Report Generator">
    <div class="wgt-report-gen-header wgt-no-print">
      <div>
        <h2 class="wgt-report-title">Contribution Report Workspace</h2>
        <p class="wgt-report-desc">
          Generate an independently verifiable contribution report with days-wise activity breakdown, patch review statistics, and repository impact.
        </p>
      </div>

      <div class="wgt-report-toolbar">
        <button
          type="button"
          class="wgt-tool-btn"
          @click="copyMarkdown"
          :disabled="isGenerating || !markdownContent"
        >
          <span>{{ copied ? '✓ Copied!' : '📋 Copy Markdown' }}</span>
        </button>

        <button
          type="button"
          class="wgt-tool-btn"
          @click="downloadMarkdown"
          :disabled="isGenerating || !markdownContent"
        >
          <span>💾 Download .md</span>
        </button>

        <button
          type="button"
          class="wgt-tool-btn btn-primary"
          @click="triggerPrintPdf"
          :disabled="isGenerating || !markdownContent"
        >
          <span>🖨️ Print / Save PDF</span>
        </button>
      </div>
    </div>

    <!-- Controls for evaluation window -->
    <div class="wgt-report-config wgt-no-print">
      <div class="wgt-config-header">
        <span class="wgt-config-label">1. Select Days-Wise Window:</span>
      </div>
      <DateRangePicker
        :initial-preset="selectedPreset"
        @change="handleDateChange"
      />

      <div class="wgt-config-options">
        <label class="wgt-checkbox-label">
          <input type="checkbox" v-model="includeRepoTable" @change="fetchReport" />
          <span>Include top impacted repositories table</span>
        </label>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isGenerating" class="wgt-report-loading wgt-no-print">
      <span class="wgt-spinner-lg" aria-hidden="true"></span>
      <p>Compiling verifiable metrics and independent Gerrit links...</p>
    </div>

    <!-- The Report Content / Preview -->
    <div v-else-if="markdownContent" class="wgt-report-preview wgt-print-container">
      <div class="wgt-markdown-rendered" v-html="renderedHtml"></div>
    </div>

    <div v-else class="wgt-report-empty wgt-no-print">
      <p>Select a contributor to generate a contribution report.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { apiClient } from '../services/api.client.js';
import { useContributor } from '../composables/useContributor.js';
import DateRangePicker from './DateRangePicker.vue';

const { currentIdentifier } = useContributor();

const isGenerating = ref(false);
const markdownContent = ref('');
const copied = ref(false);
const selectedPreset = ref('last_30_days');
const customStart = ref('');
const customEnd = ref('');
const includeRepoTable = ref(true);

const fetchReport = async () => {
  if (!currentIdentifier.value) return;

  isGenerating.value = true;
  try {
    const resp = await apiClient.getReport(currentIdentifier.value, {
      preset: selectedPreset.value !== 'custom' ? selectedPreset.value : undefined,
      startDate: selectedPreset.value === 'custom' ? customStart.value : undefined,
      endDate: selectedPreset.value === 'custom' ? customEnd.value : undefined,
      includeRepositories: includeRepoTable.value
    });

    markdownContent.value = resp.data.markdown;
  } catch (err) {
    console.error('Failed to generate report', err);
  } finally {
    isGenerating.value = false;
  }
};

const handleDateChange = (payload: { preset: string; startDate?: string; endDate?: string }) => {
  selectedPreset.value = payload.preset;
  if (payload.preset === 'custom') {
    customStart.value = payload.startDate || '';
    customEnd.value = payload.endDate || '';
  }
  fetchReport();
};

const copyMarkdown = async () => {
  if (!markdownContent.value) return;
  try {
    await navigator.clipboard.writeText(markdownContent.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Copy failed', err);
  }
};

const downloadMarkdown = () => {
  if (!markdownContent.value) return;
  const blob = new Blob([markdownContent.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wikimedia-contribution-report-${currentIdentifier.value || 'contributor'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const triggerPrintPdf = () => {
  window.print();
};

// Simple safe markdown to HTML parser for report preview
const renderedHtml = computed(() => {
  if (!markdownContent.value) return '';

  const raw = markdownContent.value;
  const lines = raw.split('\n');
  const htmlLines: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Escape basic html
    line = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    if (line.startsWith('# ')) {
      htmlLines.push(`<h1>${line.slice(2)}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      htmlLines.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      htmlLines.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      htmlLines.push('<hr />');
      continue;
    }

    // Blockquote
    if (line.startsWith('&gt; ')) {
      htmlLines.push(`<blockquote>${line.slice(5)}</blockquote>`);
      continue;
    }

    // Table rows
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        htmlLines.push('<div class="wgt-table-wrap"><table>');
        inTable = true;
      }

      // Check if separator line
      if (line.includes('---')) {
        continue;
      }

      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      const rowHtml = cells
        .map((c) => {
          // Format bold and links in cells
          const fmt = formatInline(c);
          return `<td>${fmt}</td>`;
        })
        .join('');

      htmlLines.push(`<tr>${rowHtml}</tr>`);
      continue;
    } else if (inTable) {
      htmlLines.push('</table></div>');
      inTable = false;
    }

    // List items
    if (line.trim().startsWith('- ')) {
      const itemContent = formatInline(line.trim().slice(2));
      htmlLines.push(`<ul><li>${itemContent}</li></ul>`);
      continue;
    }

    if (line.trim().match(/^\d+\.\s/)) {
      const itemContent = formatInline(line.trim().replace(/^\d+\.\s/, ''));
      htmlLines.push(`<ol><li>${itemContent}</li></ol>`);
      continue;
    }

    // Paragraph
    if (line.trim().length > 0) {
      htmlLines.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inTable) {
    htmlLines.push('</table></div>');
  }

  return htmlLines.join('\n');
});

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

watch(currentIdentifier, () => {
  if (currentIdentifier.value) {
    fetchReport();
  }
});

onMounted(() => {
  if (currentIdentifier.value) {
    fetchReport();
  }
});
</script>

<style scoped>
.wgt-report-gen-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2.25rem 2.5rem;
  box-shadow: var(--wgt-shadow-card);
  width: 100%;
}

.wgt-report-gen-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.25rem;
  border-bottom: 1px solid var(--wgt-border-light);
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
}

.wgt-report-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
  margin-bottom: 0.3rem;
}

.wgt-report-desc {
  font-size: 0.88rem;
  color: var(--wgt-text-secondary);
}

.wgt-report-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.wgt-tool-btn {
  padding: 0.45rem 0.9rem;
  border-radius: var(--wgt-radius);
  border: 1px solid var(--wgt-border-base);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.wgt-tool-btn:hover:not(:disabled) {
  border-color: var(--wgt-color-primary);
  color: var(--wgt-color-primary);
}

.wgt-tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--wgt-color-primary) !important;
  color: #ffffff !important;
  border-color: var(--wgt-color-primary) !important;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--wgt-color-primary-hover) !important;
}

.wgt-report-config {
  background-color: var(--wgt-bg-subtle);
  border-radius: var(--wgt-radius);
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wgt-config-header {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--wgt-text-primary);
}

.wgt-config-options {
  margin-top: 0.25rem;
  font-size: 0.85rem;
}

.wgt-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.wgt-report-loading {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--wgt-text-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.wgt-spinner-lg {
  width: 32px;
  height: 32px;
  border: 3px solid var(--wgt-border-subtle);
  border-top-color: var(--wgt-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.wgt-report-preview {
  background-color: var(--wgt-bg-base);
  border: 1px solid var(--wgt-border-light);
  border-radius: var(--wgt-radius);
  padding: 2rem;
  font-family: inherit;
  line-height: 1.6;
}

.wgt-markdown-rendered :deep(h1) {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: var(--wgt-text-primary);
  border-bottom: 2px solid var(--wgt-border-subtle);
  padding-bottom: 0.4rem;
}

.wgt-markdown-rendered :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--wgt-text-primary);
}

.wgt-markdown-rendered :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.4rem;
}

.wgt-markdown-rendered :deep(p) {
  margin-bottom: 0.75rem;
}

.wgt-markdown-rendered :deep(hr) {
  border: none;
  border-top: 1px solid var(--wgt-border-light);
  margin: 1.25rem 0;
}

.wgt-markdown-rendered :deep(blockquote) {
  border-left: 4px solid var(--wgt-color-primary);
  padding: 0.6rem 1rem;
  background-color: var(--wgt-bg-subtle);
  margin: 1rem 0;
  font-style: italic;
  font-size: 0.9rem;
}

.wgt-markdown-rendered :deep(ul),
.wgt-markdown-rendered :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.wgt-markdown-rendered :deep(li) {
  margin-bottom: 0.25rem;
}

.wgt-markdown-rendered :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.88rem;
}

.wgt-markdown-rendered :deep(th),
.wgt-markdown-rendered :deep(td) {
  border: 1px solid var(--wgt-border-light);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.wgt-markdown-rendered :deep(th) {
  background-color: var(--wgt-bg-subtle);
  font-weight: 600;
}

.wgt-markdown-rendered :deep(code) {
  font-family: var(--wgt-font-mono);
  background-color: var(--wgt-bg-subtle);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85em;
}

.wgt-report-empty {
  text-align: center;
  padding: 3rem;
  color: var(--wgt-text-subtle);
}
</style>
