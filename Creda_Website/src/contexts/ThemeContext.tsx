import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    localStorage.setItem('theme', theme);

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    // Always default to light unless the user explicitly selects dark.
    // Treat `system` as `light` to avoid following OS dark mode automatically.
    if (theme === 'dark') {
      root.classList.add('dark');
      setCurrentTheme('dark');
    } else {
      root.classList.add('light');
      setCurrentTheme('light');
    }
  }, [theme]);

  useEffect(() => {
    // No-op: we intentionally do not follow the OS-level prefers-color-scheme
    // so we don't add a media listener. The app will remain in light mode
    // unless the user explicitly switches to dark.
    return;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};