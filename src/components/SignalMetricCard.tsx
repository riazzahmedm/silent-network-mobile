import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { SignalMetric as SignalMetricData } from '../types/signals';
import { AppTheme, useTheme } from '../theme';
import { layout } from '../ui/layout';

type SignalMetricTone = 'building' | 'learning' | 'struggling';

type SignalMetric = {
  title: string;
  value: number | string;
  subtitle: string;
  tone: SignalMetricTone;
  milestone?: string | null;
};

type SignalMetricCardProps = {
  signal: SignalMetric;
};

export function SignalMetricCard({ signal }: SignalMetricCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const toneMap = {
    building: theme.colors.building,
    learning: theme.colors.learning,
    struggling: theme.colors.struggling,
  } as const;
  const tone = toneMap[signal.tone];
  const iconMap = {
    building: 'hammer-outline',
    learning: 'book-outline',
    struggling: 'construct-outline',
  } as const;
  const icon = iconMap[signal.tone];

  return (
    <View style={[styles.card, { borderLeftColor: tone }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: `${tone}16` }]}>
          <Ionicons name={icon} size={18} color={tone} />
        </View>
        <Text style={styles.value}>
          {signal.value}
          <Text style={styles.subtitle}> {signal.subtitle}</Text>
        </Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.title}>{signal.title}</Text>
        <Text style={styles.milestone}>{signal.milestone || 'In Progress'}</Text>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: layout.radiusCard - 2,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
      borderLeftWidth: 4,
      paddingHorizontal: 16,
      paddingVertical: layout.itemGap,
      gap: 12,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 10,
    },
    iconBadge: {
      height: 38,
      width: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 12,
    },
    title: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.muted,
      flex: 1,
    },
    value: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 24,
      color: theme.colors.ink,
    },
    subtitle: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 13,
      color: theme.colors.muted,
    },
    milestone: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 10,
      color: theme.colors.plum,
      textTransform: 'uppercase',
      letterSpacing: 1.6,
      flexShrink: 1,
      textAlign: 'right',
    },
  });
}

export function toSignalCardMetric(
  signal: SignalMetricData,
  tone: SignalMetricTone,
): SignalMetric {
  return {
    title: signal.label,
    value: signal.value,
    subtitle: signal.unit,
    tone,
    milestone: signal.title,
  };
}
