import React, { createContext, useContext, useState, useMemo } from 'react';
import { colors, spacing, fontSize, borderRadius } from './tokens';

type ThemeMode = 'dark' | 'light';

interface Theme {
  mode: ThemeMode;
  colors: typeof colors & { bg: string; surface: string; surfaceElevated: string; border: string; text: string; textSecondary: string; textMuted: string };
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  borderRadius: typeof borderRadius;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const theme = useMemo<Theme>(() => {
    const modeColors = mode === 'dark' ? colors.dark : colors.light;
    return {
      mode,
      colors: { ...colors, ...modeColors },
      spacing,
      fontSize,
      borderRadius,
    };
  }, [mode]);

  const toggleTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
