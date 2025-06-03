import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeColors {
  // Background colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  // Border colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  // Brand colors
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Interactive colors
  interactive: {
    hover: string;
    active: string;
    disabled: string;
  };
}

const lightTheme: ThemeColors = {
  bg: {
    primary: 'rgb(255, 255, 255)',
    secondary: 'rgb(249, 250, 251)',
    tertiary: 'rgb(243, 244, 246)',
    elevated: 'rgb(255, 255, 255)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: 'rgb(17, 24, 39)',
    secondary: 'rgb(75, 85, 99)',
    tertiary: 'rgb(156, 163, 175)',
    inverse: 'rgb(255, 255, 255)',
  },
  border: {
    primary: 'rgb(229, 231, 235)',
    secondary: 'rgb(209, 213, 219)',
    focus: 'rgb(59, 130, 246)',
  },
  brand: {
    primary: 'rgb(99, 102, 241)',
    secondary: 'rgb(139, 92, 246)',
    accent: 'rgb(236, 72, 153)',
  },
  status: {
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    info: 'rgb(59, 130, 246)',
  },
  interactive: {
    hover: 'rgb(243, 244, 246)',
    active: 'rgb(229, 231, 235)',
    disabled: 'rgb(156, 163, 175)',
  },
};

const darkTheme: ThemeColors = {
  bg: {
    primary: 'rgb(3, 7, 18)',
    secondary: 'rgb(15, 23, 42)',
    tertiary: 'rgb(30, 41, 59)',
    elevated: 'rgb(51, 65, 85)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  text: {
    primary: 'rgb(248, 250, 252)',
    secondary: 'rgb(203, 213, 225)',
    tertiary: 'rgb(148, 163, 184)',
    inverse: 'rgb(15, 23, 42)',
  },
  border: {
    primary: 'rgb(51, 65, 85)',
    secondary: 'rgb(71, 85, 105)',
    focus: 'rgb(96, 165, 250)',
  },
  brand: {
    primary: 'rgb(129, 140, 248)',
    secondary: 'rgb(167, 139, 250)',
    accent: 'rgb(244, 114, 182)',
  },
  status: {
    success: 'rgb(74, 222, 128)',
    warning: 'rgb(251, 191, 36)',
    error: 'rgb(248, 113, 113)',
    info: 'rgb(96, 165, 250)',
  },
  interactive: {
    hover: 'rgb(51, 65, 85)',
    active: 'rgb(71, 85, 105)',
    disabled: 'rgb(100, 116, 139)',
  },
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Apply CSS custom properties for the current theme
    const root = document.documentElement;
    Object.entries(colors.bg).forEach(([key, value]) => {
      root.style.setProperty(`--color-bg-${key}`, value);
    });
    Object.entries(colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    Object.entries(colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--color-border-${key}`, value);
    });
    Object.entries(colors.brand).forEach(([key, value]) => {
      root.style.setProperty(`--color-brand-${key}`, value);
    });
    Object.entries(colors.status).forEach(([key, value]) => {
      root.style.setProperty(`--color-status-${key}`, value);
    });
    Object.entries(colors.interactive).forEach(([key, value]) => {
      root.style.setProperty(`--color-interactive-${key}`, value);
    });
  }, [theme, colors]);

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;