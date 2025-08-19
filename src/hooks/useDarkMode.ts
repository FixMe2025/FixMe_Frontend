'use client';

import { useCallback, useEffect, useState } from 'react';

// 다크 모드 상태를 관리하는 커스텀 훅
const STORAGE_KEY = 'theme';

function getPreferredTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  const stored: string | null = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  const prefersDark: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function useDarkMode(): {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
} {
  const [isDark, setIsDark] = useState<boolean>(false);

  // 초기 적용
  useEffect((): void => {
    const theme: 'dark' | 'light' = getPreferredTheme();
    const root: HTMLElement = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const setDark = useCallback((dark: boolean): void => {
    const root: HTMLElement = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      window.localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem(STORAGE_KEY, 'light');
    }
    setIsDark(dark);
  }, []);

  const toggle = useCallback((): void => {
    setDark(!isDark);
  }, [isDark, setDark]);

  return { isDark, toggle, setDark };
}
