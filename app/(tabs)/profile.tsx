import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { BuildMapMiniCard } from '../../src/components/BuildMapMiniCard';
import { profileHighlights, profileSignals } from '../../src/mock-data';
import { AppTheme, useTheme } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.blush, theme.colors.paper, theme.colors.paperDeep]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipLabel}>Private Profile</Text>
            </View>
            <Pressable style={styles.themeToggle} onPress={toggleTheme}>
              <Text style={styles.themeToggleLabel}>{isDark ? 'Light' : 'Dark'}</Text>
            </Pressable>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>
              {(user?.name || user?.username || 'SN').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || user?.username || 'Silent User'}</Text>
          <Text style={styles.role}>Builder</Text>
          <Text style={styles.bio}>
            {user?.email || 'Building calm software for people who want signal, not status.'}
          </Text>
        </LinearGradient>

        <View style={styles.metricsRow}>
          {profileSignals.map((signal) => (
            <View key={signal.title} style={styles.metricTile}>
              <Text style={styles.metricValue}>{signal.value}</Text>
              <Text style={styles.metricLabel}>{signal.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Highlights</Text>
          {profileHighlights.map((highlight) => (
            <View key={highlight.title} style={styles.highlightRow}>
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
              <Text style={styles.highlightValue}>{highlight.value}</Text>
            </View>
          ))}
        </View>

        <BuildMapMiniCard />

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.paper,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 148,
      gap: 22,
    },
    hero: {
      borderRadius: 34,
      padding: 28,
      gap: 10,
    },
    heroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    heroChip: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor:
        theme.mode === 'dark' ? theme.colors.overlay : 'rgba(255,255,255,0.4)',
      borderWidth: 1,
      borderColor:
        theme.mode === 'dark'
          ? theme.colors.overlayStrong
          : 'rgba(255,255,255,0.45)',
    },
    heroChipLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.7,
      textTransform: 'uppercase',
      color: theme.colors.amber,
    },
    themeToggle: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.ink,
    },
    themeToggleLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.3,
      textTransform: 'uppercase',
      color: theme.colors.card,
    },
    avatar: {
      height: 68,
      width: 68,
      borderRadius: 24,
      backgroundColor: theme.colors.ink,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    avatarLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.card,
      fontSize: 24,
    },
    name: {
      fontFamily: theme.fonts.serif,
      fontSize: 38,
      color: theme.colors.ink,
    },
    role: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 15,
      color: theme.colors.accentBlue,
    },
    bio: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 26,
      color: theme.colors.muted,
      maxWidth: 300,
      marginTop: 6,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 14,
    },
    metricTile: {
      flex: 1,
      borderRadius: 24,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 18,
      gap: 8,
    },
    metricValue: {
      fontFamily: theme.fonts.serif,
      fontSize: 26,
      color: theme.colors.ink,
    },
    metricLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.muted,
    },
    section: {
      borderRadius: 24,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 20,
      gap: 16,
    },
    sectionEyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.colors.moss,
    },
    highlightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    highlightTitle: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 14,
      color: theme.colors.ink,
    },
    highlightValue: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      color: theme.colors.muted,
    },
    logoutButton: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.ink,
      fontSize: 14,
    },
  });
}
