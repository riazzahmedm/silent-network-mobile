import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme, useTheme } from '../theme';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>;

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthShellProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={[theme.colors.blush, theme.colors.paper, theme.colors.paperDeep]}
            style={styles.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </LinearGradient>

          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.paper,
    },
    keyboard: {
      flex: 1,
    },
    content: {
      padding: 24,
      paddingBottom: 56,
      gap: 22,
    },
    hero: {
      borderRadius: 30,
      padding: 28,
      gap: 12,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.moss,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 40,
      lineHeight: 44,
      color: theme.colors.ink,
    },
    subtitle: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 26,
      color: theme.colors.muted,
      maxWidth: 320,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 24,
      gap: 18,
      ...theme.shadows.soft,
    },
  });
}
