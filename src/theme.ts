import { useState } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'pia-docs-theme';

function current(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(current);
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode: theme just isn't remembered */
    }
    setTheme(next);
  };
  return [theme, toggle];
}
