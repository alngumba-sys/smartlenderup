import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, getThemeById, themes } from '../data/themes';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  refreshTheme: () => void;
  mode: ThemeMode;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // ALWAYS default to light mode - ignore saved preferences
    // Clear any dark mode saved in localStorage
    localStorage.removeItem('bvfunguo-theme-mode');
    return 'light';
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Load theme from localStorage or use default (coral theme)
    const savedThemeId = localStorage.getItem('bvfunguo-theme-id');
    return getThemeById(savedThemeId || 'theme-1-light'); // Coral Reef theme as default
  });

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    localStorage.setItem('bvfunguo-theme-id', themeId);
  };

  const refreshTheme = () => {
    const themeId = localStorage.getItem('bvfunguo-theme-id') || 'theme-1-light'; // Coral Reef theme as default
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
  };

  const toggleMode = () => {
    // Temporarily disabled - platform is in light mode only
    // const newMode = mode === 'light' ? 'dark' : 'light';
    // setMode(newMode);
    // localStorage.setItem('bvfunguo-theme-mode', newMode);
    console.log('Theme toggle disabled - light mode only');
  };

  // Force light mode on every mount
  useEffect(() => {
    // Remove any dark mode preference from localStorage
    localStorage.removeItem('bvfunguo-theme-mode');
    // Ensure we're in light mode
    setMode('light');
    // Remove dark class from document
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    // Apply theme mode to document
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply CSS variables to root
    const root = document.documentElement;
    const colors = mode === 'dark' ? currentTheme.darkColors : currentTheme.colors;
    
    Object.entries(colors).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle chartColors array
        value.forEach((color, index) => {
          root.style.setProperty(`--color-${key}-${index}`, color);
        });
      } else {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
  }, [currentTheme, mode]);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      themes,
      setTheme, 
      refreshTheme,
      mode, 
      toggleMode,
      isDark: mode === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}