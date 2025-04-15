import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import Colors from '@/constants/colors';

type Theme = 'light' | 'dark';
type ThemeColors = typeof Colors.light | typeof Colors.dark;

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

// Create context with default values to prevent null checks
const defaultTheme: Theme = 'light';
const defaultColors = Colors.light;

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  colors: defaultColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme: storedTheme, updateTheme } = useSettingsStore();
  const systemTheme = useColorScheme() as Theme || 'light';
  const [isReady, setIsReady] = useState(false);
  
  // Determine active theme based on settings and system
  const activeTheme: Theme = storedTheme === 'system' ? systemTheme : (storedTheme as Theme) || defaultTheme;
  
  // Get colors based on active theme
  const colors = activeTheme === 'dark' ? Colors.dark : Colors.light;
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    updateTheme(activeTheme === 'dark' ? 'light' : 'dark');
  };

  // Ensure store is initialized before rendering
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  // Use default theme while loading to prevent errors
  if (!isReady) {
    return (
      <ThemeContext.Provider 
        value={{ 
          theme: defaultTheme, 
          colors: defaultColors, 
          toggleTheme 
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }
  
  return (
    <ThemeContext.Provider value={{ theme: activeTheme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};