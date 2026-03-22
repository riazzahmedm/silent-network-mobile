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
    paper: '#F5F1EA',
    paperDeep: '#E8DED2',
    card: '#FFFDF9',
    cardMuted: '#F3ECE2',
    ink: '#222222',
    muted: '#6E6A64',
    line: '#DDD3C6',
    moss: '#857F76',
    accentBlue: '#B7793E',
    amber: '#B7793E',
    blush: '#EAD8C6',
    plum: '#8B7461',
    building: '#7B8B6F',
    learning: '#A67C52',
    struggling: '#C08A4B',
    empty: '#ECE4D8',
    night: '#2A2825',
    nightSoft: '#413B35',
    mist: '#FBF7F1',
    overlay: 'rgba(255,253,249,0.10)',
    overlayStrong: 'rgba(255,253,249,0.18)',
    heroText: '#FFFDF9',
    heroSubtleText: '#D8CEC2',
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
    paper: '#171513',
    paperDeep: '#201D1A',
    card: '#211E1B',
    cardMuted: '#2A2622',
    ink: '#F5F1EA',
    muted: '#AAA39B',
    line: '#3A342E',
    moss: '#9A9185',
    accentBlue: '#D39A5B',
    amber: '#D39A5B',
    blush: '#5A4A3C',
    plum: '#C7B39E',
    building: '#8D9A82',
    learning: '#C39463',
    struggling: '#D49A59',
    empty: '#322D28',
    night: '#12100F',
    nightSoft: '#1A1715',
    mist: '#1A1715',
    overlay: 'rgba(245,241,234,0.06)',
    overlayStrong: 'rgba(245,241,234,0.12)',
    heroText: '#F5F1EA',
    heroSubtleText: '#B8B0A6',
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
