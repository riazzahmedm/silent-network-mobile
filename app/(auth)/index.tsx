import { Link, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../../src/components/AuthButton';
import { AuthShell } from '../../src/components/AuthShell';
import { useAuth } from '../../src/auth/AuthContext';
import { api } from '../../src/lib/api';
import { AppTheme, useTheme } from '../../src/theme';

export default function WelcomeScreen() {
  const { loginWithOAuth, isLoading, error } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <AuthShell
      eyebrow="The Silent Network"
      title="A social network without vanity metrics."
      subtitle="Signal over noise. Builders share progress, learning, and struggle without performing for an audience."
    >
      <View style={styles.copyBlock}>
        <Text style={styles.copy}>
          Interaction happens through private conversations like “I can help” and
          “I built something similar”, not public comment ladders.
        </Text>
        <Text style={styles.endpoint}>API: {api.baseUrl}</Text>
      </View>

      <AuthButton
        label="Continue with email"
        onPress={() => router.push('/(auth)/login')}
      />

      <View style={styles.oauthColumn}>
        <AuthButton
          label="Continue with Google"
          variant="secondary"
          onPress={() => loginWithOAuth('google')}
          loading={isLoading}
        />
        <AuthButton
          label="Continue with GitHub"
          variant="secondary"
          onPress={() => loginWithOAuth('github')}
          loading={isLoading}
        />
        <AuthButton
          label="Continue with Apple"
          variant="secondary"
          onPress={() => loginWithOAuth('apple')}
          loading={isLoading}
        />
      </View>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Log in
      </Link>
      <Link href="/(auth)/signup" style={styles.linkSecondary}>
        New here? Create your account
      </Link>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </AuthShell>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
  copyBlock: {
    gap: 8,
  },
  copy: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
  },
  endpoint: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.muted,
  },
  oauthColumn: {
    gap: 10,
  },
  link: {
    textAlign: 'center',
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.accentBlue,
    fontSize: 14,
  },
  linkSecondary: {
    textAlign: 'center',
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.muted,
    fontSize: 14,
  },
  error: {
    textAlign: 'center',
    fontFamily: theme.fonts.sansMedium,
    color: '#A84E3B',
    fontSize: 13,
    lineHeight: 20,
  },
  });
}
