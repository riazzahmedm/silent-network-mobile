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

  async function handleLogin() {
    clearError();
    await login({
      email: email.trim(),
      password,
    });
    router.replace('/(tabs)');
  }

  return (
    <AuthShell
      eyebrow="Log In"
      title="Return to the work."
      subtitle="Pick up where you left off. Your signals and conversations stay quiet and intact."
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="riaz@example.com"
        keyboardType="email-address"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
      />

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
