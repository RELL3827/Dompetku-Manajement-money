import { useEffect, useState } from 'react';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { ThemeMode } from '../types';

export function applyThemeToDOM(mode: ThemeMode) {
  const root = document.documentElement;
  let isDark = false;

  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else {
    // System preference
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export function useTheme() {
  const settingsRecord = useLiveQuery(() => db.settings.get('app_settings'));
  const currentSavedTheme: ThemeMode = settingsRecord?.value?.theme || 'system';

  const [theme, setThemeState] = useState<ThemeMode>(currentSavedTheme);

  useEffect(() => {
    if (settingsRecord?.value?.theme) {
      setThemeState(settingsRecord.value.theme);
      applyThemeToDOM(settingsRecord.value.theme);
    } else {
      applyThemeToDOM('system');
    }
  }, [settingsRecord]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const activeTheme = settingsRecord?.value?.theme || 'system';
      if (activeTheme === 'system') {
        applyThemeToDOM('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settingsRecord]);

  async function setTheme(newTheme: ThemeMode) {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    await db.updateSettings({ theme: newTheme });
  }

  return { theme, setTheme };
}
