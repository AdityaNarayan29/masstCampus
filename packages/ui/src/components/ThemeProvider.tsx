'use client';

import * as React from 'react';
import type { TenantTheme } from '@school-crm/types';

export interface ThemeProviderProps {
  theme: TenantTheme;
  children: React.ReactNode;
}

/**
 * ThemeProvider applies tenant-specific theme to the app
 * by injecting CSS variables into the document root
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  React.useEffect(() => {
    if (!theme?.colors) return;

    const root = document.documentElement;

    // Parse HSL values from theme.colors
    // Expected format: "hsl(222.2 47.4% 11.2%)" -> "222.2 47.4% 11.2%"
    const parseHsl = (hslString: string): string => {
      const match = hslString.match(/hsl\(([\d.\s%]+)\)/);
      return match ? match[1] : hslString;
    };

    // Apply CSS variables
    root.style.setProperty('--primary', parseHsl(theme.colors.primary));
    root.style.setProperty('--secondary', parseHsl(theme.colors.secondary));
    root.style.setProperty('--accent', parseHsl(theme.colors.accent));
    root.style.setProperty('--background', parseHsl(theme.colors.background));
    root.style.setProperty('--foreground', parseHsl(theme.colors.foreground));
    root.style.setProperty('--muted', parseHsl(theme.colors.muted));
    root.style.setProperty('--muted-foreground', parseHsl(theme.colors.mutedForeground));
    root.style.setProperty('--border', parseHsl(theme.colors.border));

    // Apply fonts if provided
    if (theme.fonts?.body) {
      root.style.setProperty('font-family', theme.fonts.body);
    }

    return () => {
      // Cleanup on unmount (optional)
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--border');
    };
  }, [theme]);

  return <>{children}</>;
};
