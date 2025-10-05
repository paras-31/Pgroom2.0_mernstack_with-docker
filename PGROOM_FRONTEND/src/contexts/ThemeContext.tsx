import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Create a context for theme-related functionality
export const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: 'system',
  setTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Props for the ThemeProvider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

// ThemeProvider component that wraps next-themes
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="property-hub-theme"
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
