// Thin adapter over next-themes, keeping the {isDarkMode, toggleTheme} API the
// rest of the app consumes. next-themes' blocking inline script sets the .dark
// class before first paint, so there is no light-mode flash.
'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

import type { ReactNode } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    {children}
  </NextThemesProvider>
);

export const useTheme = () => {
  const { resolvedTheme, setTheme } = useNextTheme();
  const isDarkMode = resolvedTheme === 'dark';
  return {
    isDarkMode,
    toggleTheme: () => setTheme(isDarkMode ? 'light' : 'dark'),
  };
};
