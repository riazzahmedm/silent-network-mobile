export const theme = {
  colors: {
    paper: '#F4EFE8',
    card: '#FFFDF8',
    ink: '#233127',
    muted: '#5C695F',
    line: '#DFD7CA',
    moss: '#6C7C59',
    accentBlue: '#4F7C82',
    amber: '#C58D3D',
    blush: '#F3D8C7',
    building: '#7C9B6A',
    learning: '#4F7C82',
    struggling: '#D7A441',
    empty: '#ECE5DA',
  },
  fonts: {
    serif: 'DmSerifDisplay_400Regular',
    sansRegular: 'SpaceGrotesk_400Regular',
    sansMedium: 'SpaceGrotesk_500Medium',
    sansBold: 'SpaceGrotesk_700Bold',
  },
  shadows: {
    soft: {
      shadowColor: '#233127',
      shadowOpacity: 0.08,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
  },
} as const;
