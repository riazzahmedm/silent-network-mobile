import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '../theme';
import { layout } from '../ui/layout';

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
  onPress?: () => void;
};

export function ConversationPreviewCard({
  thread,
  onPress,
}: ConversationPreviewCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const accentMap = {
    building: theme.colors.building,
    learning: theme.colors.learning,
    struggling: theme.colors.struggling,
  } as const;
  const accent = accentMap[thread.accent];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.accentDot, { backgroundColor: accent }]} />
          <Text style={[styles.badge, { color: accent }]}>{thread.title}</Text>
        </View>
        <Text style={styles.time}>{thread.time}</Text>
      </View>
      <Text style={styles.name}>{thread.name}</Text>
      <Text style={styles.snippet}>{thread.snippet}</Text>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      paddingVertical: layout.itemGap + 2,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.line,
      gap: 8,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      paddingRight: 12,
    },
    accentDot: {
      height: 8,
      width: 8,
      borderRadius: 999,
    },
    badge: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.5,
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
}
