'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from './icons';
import { Button } from './button';

/** Current theme and a setter. Toggles the `dark` class on <html> and remembers the choice in localStorage under "theme". */
export function useTheme() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains('dark'));
  const set = React.useCallback((next: boolean) => {
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* private mode */ }
    setDark(next);
  }, []);
  return { dark, setDark: set, toggle: () => set(!dark) };
}

/** Icon button that flips light and dark mode. Drop it in a Topbar. */
export function ThemeToggle({ className }: { className?: string }) {
  const { dark, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon-sm" className={className} onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
