// src/app/components/ThemeToggle.tsx
'use client';

import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';

const KEY: string = 'theme';

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false;
  const saved: string | null = window.localStorage.getItem(KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function ThemeToggle(): JSX.Element {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect((): void => {
    const d: boolean = getInitialDark();
    const root: HTMLElement = document.documentElement;
    d ? root.classList.add('dark') : root.classList.remove('dark');
    setIsDark(d);
  }, []);

  const toggle = useCallback((): void => {
    const root: HTMLElement = document.documentElement;
    const next: boolean = !isDark;
    next ? root.classList.add('dark') : root.classList.remove('dark');
    window.localStorage.setItem(KEY, next ? 'dark' : 'light');
    setIsDark(next);
  }, [isDark]);

  return (
    <button type="button" onClick={toggle} className="rounded-lg border px-3 py-1 text-sm">
      {isDark ? '라이트 모드' : '다크 모드'}
    </button>
  );
}
