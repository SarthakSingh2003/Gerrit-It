import { ref } from 'vue';

const consentGiven = ref<boolean>(localStorage.getItem('wgt_consent_history') === 'true');
const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('wgt_search_history') || '[]'));

export function useSearchHistory() {
  const setConsent = (granted: boolean) => {
    consentGiven.value = granted;
    localStorage.setItem('wgt_consent_history', String(granted));
    if (!granted) {
      clearHistory();
    }
  };

  const addSearch = (username: string) => {
    const clean = username.trim();
    if (!clean || !consentGiven.value) return;

    const filtered = searchHistory.value.filter((u) => u.toLowerCase() !== clean.toLowerCase());
    filtered.unshift(clean);
    searchHistory.value = filtered.slice(0, 8); // Keep last 8 searches
    localStorage.setItem('wgt_search_history', JSON.stringify(searchHistory.value));
  };

  const clearHistory = () => {
    searchHistory.value = [];
    localStorage.removeItem('wgt_search_history');
  };

  return {
    consentGiven,
    searchHistory,
    setConsent,
    addSearch,
    clearHistory
  };
}
