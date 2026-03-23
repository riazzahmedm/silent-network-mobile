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
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { ThemeProvider, useTheme } from '../src/theme';
import { ToastProvider } from '../src/toast/ToastContext';

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
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { isLoading, user } = useAuth();
  const { theme, isDark } = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.paper,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.colors.ink} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.paper,
          },
          animation: 'fade',
        }}
      >
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
