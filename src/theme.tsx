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
    paper: '#F4F1EA',
    paperDeep: '#E6DED2',
    card: '#FCFAF6',
    cardMuted: '#EEE7DD',
    ink: '#1F2328',
    muted: '#6C6A66',
    line: '#D7CFC3',
    moss: '#64756F',
    accentBlue: '#B07139',
    amber: '#B07139',
    blush: '#E7DCD0',
    plum: '#7D6A57',
    building: '#5F8A72',
    learning: '#B77B3F',
    struggling: '#C76B4E',
    empty: '#E9E1D5',
    night: '#20252A',
    nightSoft: '#313941',
    mist: '#F9F6F0',
    overlay: 'rgba(252,250,246,0.10)',
    overlayStrong: 'rgba(252,250,246,0.18)',
    heroText: '#FCFAF6',
    heroSubtleText: '#D9D1C5',
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
    paper: '#161A1E',
    paperDeep: '#1D2329',
    card: '#1F252B',
    cardMuted: '#283038',
    ink: '#F4F1EA',
    muted: '#ACA7A0',
    line: '#353D45',
    moss: '#8CA39A',
    accentBlue: '#D09558',
    amber: '#D09558',
    blush: '#554A3F',
    plum: '#C4B09A',
    building: '#86B198',
    learning: '#D29A5A',
    struggling: '#D88266',
    empty: '#2B3239',
    night: '#101418',
    nightSoft: '#181E24',
    mist: '#181D22',
    overlay: 'rgba(244,241,234,0.06)',
    overlayStrong: 'rgba(244,241,234,0.12)',
    heroText: '#F4F1EA',
    heroSubtleText: '#BDB5AB',
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
