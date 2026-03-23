import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthContext';
import { AuthButton } from '../../src/components/AuthButton';
import { AuthField } from '../../src/components/AuthField';
import { AuthShell } from '../../src/components/AuthShell';
import { AppTheme, useTheme } from '../../src/theme';

export default function LoginScreen() {
  const { login, error, clearError, isLoading } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleLogin() {
    clearError();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setLocalError('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (!password) {
      setLocalError('Password is required.');
      return;
    }

    setLocalError(null);

    try {
      await login({
        email: trimmedEmail,
        password,
      });
      router.replace('/(tabs)');
    } catch {}
  }

  return (
    <AuthShell
      eyebrow="Log In"
      title="Return to the code."
      subtitle="Pick up where you left off. Your developer signals and conversations stay quiet and intact."
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (localError) {
            setLocalError(null);
          }
        }}
        placeholder="riaz@example.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (localError) {
            setLocalError(null);
          }
        }}
        placeholder="Your password"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />

      {localError ? <Text style={styles.error}>{localError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AuthButton
        label="Log in"
        onPress={handleLogin}
        loading={isLoading}
        disabled={!email.trim() || !password}
      />

      <View style={styles.links}>
        <Link href="/(auth)/signup" style={styles.link}>
          Need an account? Sign up
        </Link>
      </View>
    </AuthShell>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    error: {
      fontFamily: theme.fonts.sansMedium,
      color: '#A84E3B',
      fontSize: 13,
      lineHeight: 20,
    },
    links: {
      paddingTop: 4,
    },
    link: {
      textAlign: 'center',
      fontFamily: theme.fonts.sansMedium,
      color: theme.colors.accentBlue,
      fontSize: 14,
    },
  });
}
