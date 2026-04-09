export interface ThemeConfig {
  colors: {
    primary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
  };
  font: 'sans' | 'mono' | 'serif' | 'display';
  radius: string;
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  mode: 'light' | 'dark';
}

export interface LayoutConfig {
  type: 'grid' | 'list';
  columns: 1 | 2 | 3 | 4;
}

export interface ComponentsConfig {
  cardStyle: 'solid' | 'glass' | 'outlined';
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  highlightPopular?: number; // index of the plan to highlight
}

export interface PageConfig {
  theme: ThemeConfig;
  layout: LayoutConfig;
  components: ComponentsConfig;
}

export interface BusinessProfile {
  display_name: string;
  slug?: string;
  logo_url?: string;
  tagline?: string;
  support_email?: string;
}

export const DEFAULT_CONFIG: PageConfig = {
  theme: {
    colors: {
      primary: 'oklch(0.55 0.2 275)', // Default purple
      accent: 'oklch(0.6 0.25 200)',
      background: 'oklch(0.98 0.001 0)', // Light background
      card: 'oklch(1 0 0)',
      text: 'oklch(0.2 0.01 275)',
      muted: 'oklch(0.5 0.01 0)',
      border: 'oklch(0.9 0.01 0)',
    },
    font: 'sans',
    radius: '0.625rem',
    shadow: 'md',
    mode: 'light',
  },
  layout: {
    type: 'grid',
    columns: 3,
  },
  components: {
    cardStyle: 'outlined',
    buttonStyle: 'rounded',
  },
};

const FONT_MAP = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
  serif: 'ui-serif, Georgia, serif',
  display: 'system-ui, sans-serif'
};

const SHADOW_MAP = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

export function themeToCSS(theme: ThemeConfig | undefined): React.CSSProperties {
  const activeTheme = theme || DEFAULT_CONFIG.theme;
  
  return {
    '--sub-primary': activeTheme.colors.primary,
    '--sub-accent': activeTheme.colors.accent,
    '--sub-background': activeTheme.colors.background,
    '--sub-card': activeTheme.colors.card,
    '--sub-text': activeTheme.colors.text,
    '--sub-muted': activeTheme.colors.muted,
    '--sub-border': activeTheme.colors.border || 'oklch(0.9 0.01 0)',
    '--sub-radius': activeTheme.radius,
    '--sub-shadow': SHADOW_MAP[activeTheme.shadow || 'md'],
    '--sub-font': FONT_MAP[activeTheme.font as keyof typeof FONT_MAP] || FONT_MAP.sans,
  } as React.CSSProperties;
}
