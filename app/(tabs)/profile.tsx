import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { BuildMapMiniCard } from '../../src/components/BuildMapMiniCard';
import { profileHighlights, profileSignals } from '../../src/mock-data';
import { theme } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FFF7EF', '#F1ECE1', '#E7EEE9']}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          >
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 18,
  },
  hero: {
    borderRadius: 30,
    padding: 24,
    gap: 8,
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
    fontSize: 36,
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
    lineHeight: 24,
    color: theme.colors.muted,
    maxWidth: 300,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricTile: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    gap: 6,
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
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    gap: 14,
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
    backgroundColor: '#FBF7F1',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutLabel: {
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.ink,
    fontSize: 14,
  },
});
