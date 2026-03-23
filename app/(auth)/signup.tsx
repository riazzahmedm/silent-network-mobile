import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthContext';
import { AuthButton } from '../../src/components/AuthButton';
import { AuthField } from '../../src/components/AuthField';
import { AuthShell } from '../../src/components/AuthShell';
import { AppTheme, useTheme } from '../../src/theme';

export default function SignupScreen() {
  const { signup, error, clearError, isLoading } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSignup() {
    clearError();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername) {
      setLocalError('Username is required.');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      setLocalError('Username can only use lowercase letters, numbers, and underscores.');
      return;
    }

    if (trimmedUsername.length < 3) {
      setLocalError('Username must be at least 3 characters.');
      return;
    }

    if (!trimmedEmail) {
      setLocalError('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    setLocalError(null);

    try {
      await signup({
        name: trimmedName || undefined,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });
      router.replace('/(tabs)');
    } catch {}
  }

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Start a quieter kind of social profile."
      subtitle="No followers. No likes. Just a place to document real progress and talk privately with people who can help."
    >
      <AuthField
        label="Name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (localError) {
            setLocalError(null);
          }
        }}
        placeholder="Riaz Ahmed"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
      <AuthField
        label="Username"
        value={username}
        onChangeText={(value) => {
          setUsername(value);
          if (localError) {
            setLocalError(null);
          }
        }}
        placeholder="riaz_builder"
        autoComplete="username"
        textContentType="username"
      />
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
        placeholder="Minimum 8 characters"
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
      />

      {localError ? <Text style={styles.error}>{localError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AuthButton
        label="Create account"
        onPress={handleSignup}
        loading={isLoading}
        disabled={
          !username.trim() || !email.trim() || password.length < 8
        }
      />

      <View style={styles.links}>
        <Link href="/(auth)/login" style={styles.link}>
          Already have an account? Log in
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
