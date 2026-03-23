import { StyleSheet, Text, View } from 'react-native';
import type { BuildMapDay } from '../types/signals';
import { AppTheme, useTheme } from '../theme';

function MapCell({
  tone,
  theme,
}: {
  tone: 'building' | 'learning' | 'struggling' | 'mixed' | 'empty';
  theme: AppTheme;
}) {
  const styles = createStyles(theme);
  const toneMap = {
    building: theme.colors.building,
    learning: theme.colors.learning,
    struggling: theme.colors.struggling,
    empty: theme.colors.empty,
  } as const;

  if (tone === 'mixed') {
    return (
      <View style={[styles.cell, styles.mixedCell]}>
        <View style={[styles.splitHalf, { backgroundColor: theme.colors.building }]} />
        <View style={[styles.splitHalf, { backgroundColor: theme.colors.learning }]} />
      </View>
    );
  }

  return <View style={[styles.cell, { backgroundColor: toneMap[tone] }]} />;
}

type BuildMapCardProps = {
  rows: Array<Array<'building' | 'learning' | 'struggling' | 'mixed' | 'empty'>>;
};

export function BuildMapCard({ rows }: BuildMapCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((tone, columnIndex) => (
              <MapCell
                key={`cell-${rowIndex}-${columnIndex}`}
                tone={tone as 'building' | 'learning' | 'struggling' | 'mixed' | 'empty'}
                theme={theme}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <LegendItem label="Building" color={theme.colors.building} theme={theme} />
        <LegendItem label="Learning" color={theme.colors.learning} theme={theme} />
        <LegendItem label="Struggling" color={theme.colors.struggling} theme={theme} />
        <LegendItem label="Mixed" color={theme.colors.ink} theme={theme} />
      </View>

      <Text style={styles.note}>Progress &gt; perfection</Text>
    </View>
  );
}

function LegendItem({
  label,
  color,
  theme,
}: {
  label: string;
  color: string;
  theme: AppTheme;
}) {
  const styles = createStyles(theme);

  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: 30,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 20,
      marginHorizontal: 20,
      gap: 16,
    },
    grid: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    cell: {
      height: 32,
      flex: 1,
      borderRadius: 10,
    },
    mixedCell: {
      flexDirection: 'row',
      overflow: 'hidden',
      backgroundColor: theme.colors.empty,
    },
    splitHalf: {
      flex: 1,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    legendLabel: {
      fontFamily: theme.fonts.sansRegular,
      color: theme.colors.muted,
      fontSize: 12,
    },
    note: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 12,
      color: theme.colors.plum,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
    },
  });
}

export function buildMapRowsFromDays(days: BuildMapDay[]) {
  const tones = days.map((day) => toCellTone(day));
  const rows: Array<
    Array<'building' | 'learning' | 'struggling' | 'mixed' | 'empty'>
  > = [];

  for (let index = 0; index < tones.length; index += 7) {
    rows.push(tones.slice(index, index + 7));
  }

  return rows;
}

function toCellTone(
  day: BuildMapDay,
): 'building' | 'learning' | 'struggling' | 'mixed' | 'empty' {
  if (!day.hasSignal || !day.entry) {
    return 'empty';
  }

  switch (day.entry.visualKind) {
    case 'BUILDING':
      return 'building';
    case 'LEARNING':
      return 'learning';
    case 'STRUGGLING':
      return 'struggling';
    case 'MIXED':
      return 'mixed';
    default:
      return 'empty';
  }
}
