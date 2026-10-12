import { ref } from 'vue';

const isDarkMode = ref(false);

export function useTheme() {
  const initTheme = () => {
    const savedTheme = localStorage.getItem('wgt_theme');
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (localStorage.getItem('wgt_dir')) {
      localStorage.removeItem('wgt_dir');
    }

    applyTheme();
  };

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    document.documentElement.setAttribute('dir', 'ltr');
  };

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('wgt_theme', isDarkMode.value ? 'dark' : 'light');
    applyTheme();
  };

  return {
    isDarkMode,
    initTheme,
    toggleTheme
  };
}
