import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type SignalMetric = {
  title: string;
  value: string;
  subtitle: string;
  tone: 'building' | 'learning' | 'struggling';
  milestone: string;
};

type SignalMetricCardProps = {
  signal: SignalMetric;
};

const toneMap = {
  building: theme.colors.building,
  learning: theme.colors.learning,
  struggling: theme.colors.struggling,
} as const;

export function SignalMetricCard({ signal }: SignalMetricCardProps) {
  const tone = toneMap[signal.tone];

  return (
    <View style={styles.card}>
      <View style={[styles.iconBadge, { backgroundColor: `${tone}16` }]}>
        <View style={[styles.iconDot, { backgroundColor: tone }]} />
      </View>
      <Text style={styles.title}>{signal.title}</Text>
      <Text style={styles.value}>
        {signal.value}
        <Text style={styles.subtitle}> {signal.subtitle}</Text>
      </Text>
      <Text style={styles.milestone}>{signal.milestone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    gap: 10,
  },
  iconBadge: {
    height: 38,
    width: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    height: 14,
    width: 14,
    borderRadius: 999,
  },
  title: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    color: theme.colors.muted,
  },
  value: {
    fontFamily: theme.fonts.serif,
    fontSize: 30,
    color: theme.colors.ink,
  },
  subtitle: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 13,
    color: theme.colors.muted,
  },
  milestone: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.ink,
  },
});
