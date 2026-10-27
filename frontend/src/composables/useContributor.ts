import { ref, computed } from 'vue';
import { apiClient, ApiClientError } from '../services/api.client.js';
import {
  ContributorSummaryResponse,
  RepositoryContributionStats,
  NormalizedChange,
  DisambiguationCandidate
} from '../types/index.js';

const currentIdentifier = ref<string>('');
const summary = ref<ContributorSummaryResponse | null>(null);
const repositories = ref<RepositoryContributionStats[]>([]);
const authoredChanges = ref<NormalizedChange[]>([]);
const reviewedChanges = ref<NormalizedChange[]>([]);

const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const disambiguationCandidates = ref<DisambiguationCandidate[]>([]);

const selectedPreset = ref<string>('lifetime');
const customStartDate = ref<string>('');
const customEndDate = ref<string>('');

export function useContributor() {
  const isLoaded = computed(() => summary.value !== null);

  const loadContributor = async (identifier: string) => {
    if (!identifier || !identifier.trim()) return;

    currentIdentifier.value = identifier.trim();
    isLoading.value = true;
    error.value = null;
    disambiguationCandidates.value = [];

    try {
      const resp = await apiClient.getContributorSummary(identifier, {
        preset: selectedPreset.value !== 'custom' ? selectedPreset.value : undefined,
        startDate: selectedPreset.value === 'custom' ? customStartDate.value : undefined,
        endDate: selectedPreset.value === 'custom' ? customEndDate.value : undefined
      });

      summary.value = resp.data;
      loadRepositories(identifier);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'AMBIGUOUS_ACCOUNT_RESOLUTION' && err.details?.candidates) {
          disambiguationCandidates.value = err.details.candidates as DisambiguationCandidate[];
          error.value = err.message;
        } else {
          error.value = err.message;
        }
      } else {
        error.value = (err as Error).message;
      }
      summary.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const loadRepositories = async (identifier = currentIdentifier.value) => {
    if (!identifier) return;
    try {
      const resp = await apiClient.getRepositories(identifier, {
        preset: selectedPreset.value !== 'custom' ? selectedPreset.value : undefined,
        startDate: selectedPreset.value === 'custom' ? customStartDate.value : undefined,
        endDate: selectedPreset.value === 'custom' ? customEndDate.value : undefined
      });
      repositories.value = resp.data;
    } catch (err) {
      console.error('Failed to load repositories', err);
    }
  };

  const loadChanges = async (type: 'authored' | 'reviewed', limit = 100) => {
    if (!currentIdentifier.value) return;
    try {
      const resp = await apiClient.getChanges(currentIdentifier.value, {
        type,
        preset: selectedPreset.value !== 'custom' ? selectedPreset.value : undefined,
        startDate: selectedPreset.value === 'custom' ? customStartDate.value : undefined,
        endDate: selectedPreset.value === 'custom' ? customEndDate.value : undefined,
        limit
      });
      if (type === 'authored') {
        authoredChanges.value = resp.data.changes;
      } else {
        reviewedChanges.value = resp.data.changes;
      }
    } catch (err) {
      console.error(`Failed to load ${type} changes`, err);
    }
  };

  const setDateRange = async (preset: string, start?: string, end?: string) => {
    selectedPreset.value = preset;
    if (preset === 'custom') {
      customStartDate.value = start || '';
      customEndDate.value = end || '';
    } else {
      customStartDate.value = '';
      customEndDate.value = '';
    }

    if (currentIdentifier.value) {
      await loadContributor(currentIdentifier.value);
    }
  };

  const reset = () => {
    currentIdentifier.value = '';
    summary.value = null;
    repositories.value = [];
    authoredChanges.value = [];
    reviewedChanges.value = [];
    error.value = null;
    disambiguationCandidates.value = [];
  };

  return {
    currentIdentifier,
    summary,
    repositories,
    authoredChanges,
    reviewedChanges,
    isLoading,
    error,
    disambiguationCandidates,
    selectedPreset,
    customStartDate,
    customEndDate,
    isLoaded,
    loadContributor,
    loadRepositories,
    loadChanges,
    setDateRange,
    reset
  };
}
