import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

const fonts = {
  serif: 'DmSerifDisplay_400Regular',
  sansRegular: 'SpaceGrotesk_400Regular',
  sansMedium: 'SpaceGrotesk_500Medium',
  sansBold: 'SpaceGrotesk_700Bold',
} as const;

const lightTheme = {
  mode: 'light' as const,
  colors: {
    paper: '#F3F5F7',
    paperDeep: '#E7EBF0',
    card: '#FFFFFF',
    cardMuted: '#EEF2F6',
    ink: '#12161B',
    muted: '#69727D',
    line: '#D8E0E8',
    moss: '#66727E',
    accentBlue: '#5E7388',
    amber: '#5E7388',
    blush: '#E2E8EF',
    plum: '#5F6A76',
    building: '#4F7CFF',
    learning: '#1FA37A',
    struggling: '#D46A4C',
    empty: '#E3E9EF',
    night: '#1A2027',
    nightSoft: '#2A333D',
    mist: '#F8FAFC',
    overlay: 'rgba(255,255,255,0.14)',
    overlayStrong: 'rgba(255,255,255,0.22)',
    heroText: '#F8FAFC',
    heroSubtleText: '#B9C3CD',
  },
  fonts,
  shadows: {
    soft: {
      shadowColor: '#222222',
      shadowOpacity: 0.08,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    float: {
      shadowColor: '#222222',
      shadowOpacity: 0.14,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 16 },
      elevation: 7,
    },
  },
} as const;

const darkTheme = {
  mode: 'dark' as const,
  colors: {
    paper: '#0F1419',
    paperDeep: '#151B22',
    card: '#1A222B',
    cardMuted: '#222D38',
    ink: '#F3F6FA',
    muted: '#95A0AC',
    line: '#313C47',
    moss: '#8A98A6',
    accentBlue: '#93A8BD',
    amber: '#93A8BD',
    blush: '#202A34',
    plum: '#A8B4C0',
    building: '#7FA6FF',
    learning: '#4CC79B',
    struggling: '#F08A6E',
    empty: '#28323C',
    night: '#0B1015',
    nightSoft: '#131920',
    mist: '#161D24',
    overlay: 'rgba(243,246,250,0.07)',
    overlayStrong: 'rgba(243,246,250,0.12)',
    heroText: '#F3F6FA',
    heroSubtleText: '#AEB8C3',
  },
  fonts,
  shadows: {
    soft: {
      shadowColor: '#000000',
      shadowOpacity: 0.22,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4,
    },
    float: {
      shadowColor: '#000000',
      shadowOpacity: 0.30,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 16 },
      elevation: 7,
    },
  },
} as const;

export type AppTheme = typeof lightTheme | typeof darkTheme;

type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [isDark, setIsDark] = useState(false);
  const activeTheme: AppTheme = isDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme: activeTheme,
      isDark,
      toggleTheme: () => setIsDark((value) => !value),
    }),
    [activeTheme, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

export const theme = lightTheme;
