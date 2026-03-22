import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type ThreadPreview = {
  id: string;
  title: string;
  name: string;
  snippet: string;
  time: string;
  accent: 'building' | 'learning' | 'struggling';
};

type ConversationPreviewCardProps = {
  thread: ThreadPreview;
};

const accentMap = {
  building: theme.colors.building,
  learning: theme.colors.learning,
  struggling: theme.colors.struggling,
} as const;

export function ConversationPreviewCard({
  thread,
}: ConversationPreviewCardProps) {
  const accent = accentMap[thread.accent];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.badge, { color: accent }]}>{thread.title}</Text>
        <Text style={styles.time}>{thread.time}</Text>
      </View>
      <Text style={styles.name}>{thread.name}</Text>
      <Text style={styles.snippet}>{thread.snippet}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 12,
    color: theme.colors.muted,
  },
  name: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    color: theme.colors.ink,
  },
  snippet: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
  },
});
