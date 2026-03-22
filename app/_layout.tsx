import {
  DMSerifDisplay_400Regular,
  useFonts as useSerifFonts,
} from '@expo-google-fonts/dm-serif-display';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts as useSansFonts,
} from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [serifLoaded] = useSerifFonts({
    DMSerifDisplay_400Regular,
  });
  const [sansLoaded] = useSansFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (serifLoaded && sansLoaded) {
      SplashScreen.hideAsync();
    }
  }, [serifLoaded, sansLoaded]);

  if (!serifLoaded || !sansLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.paper,
          },
          animation: 'fade',
        }}
      />
    </>
  );
}
