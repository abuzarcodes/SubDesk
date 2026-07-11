'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PageConfig, themeToCSS } from '@/lib/theme';

interface ThemeContextType {
  config: PageConfig | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a SubscribeThemeProvider');
  }
  return context;
}

interface SubscribeThemeProviderProps {
  initialConfig?: PageConfig;
  children: ReactNode;
}

export function SubscribeThemeProvider({ initialConfig, children }: SubscribeThemeProviderProps) {
  const [config, setConfig] = useState<PageConfig | undefined>(initialConfig);

  useEffect(() => {
    // Listener for live preview from the customizer dashboard
    const handleMessage = (event: MessageEvent) => {
      // Security check: in production, verify origin
      // if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (data && data.type === 'SUBDESK_PREVIEW_UPDATE' && data.payload) {
        setConfig(data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const themeVars = themeToCSS(config?.theme);
  const mode = config?.theme?.mode || 'light';

  return (
    <ThemeContext.Provider value={{ config }}>
      <div 
        className={mode === 'dark' ? 'dark' : ''} 
        style={themeVars}
      >
        <div className="min-h-screen bg-[var(--sub-background)] text-[var(--sub-text)] transition-colors duration-300 font-[family-name:var(--sub-font)]">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
