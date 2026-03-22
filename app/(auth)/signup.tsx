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

  async function handleSignup() {
    clearError();
    await signup({
      name: name.trim() || undefined,
      username: username.trim(),
      email: email.trim(),
      password,
    });
    router.replace('/(tabs)');
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
        onChangeText={setName}
        placeholder="Riaz Ahmed"
        autoCapitalize="words"
      />
      <AuthField
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="riaz_builder"
      />
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
        placeholder="Minimum 8 characters"
        secureTextEntry
      />

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
