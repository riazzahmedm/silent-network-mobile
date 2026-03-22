import { StyleSheet, Text, View } from 'react-native';
import { buildMapRows } from '../mock-data';
import { theme } from '../theme';

const toneMap = {
  building: theme.colors.building,
  learning: theme.colors.learning,
  struggling: theme.colors.struggling,
  mixed: 'linear',
  empty: theme.colors.empty,
} as const;

function MapCell({ tone }: { tone: keyof typeof toneMap }) {
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

export function BuildMapCard() {
  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        {buildMapRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((tone, columnIndex) => (
              <MapCell
                key={`cell-${rowIndex}-${columnIndex}`}
                tone={tone as keyof typeof toneMap}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <LegendItem label="Building" color={theme.colors.building} />
        <LegendItem label="Learning" color={theme.colors.learning} />
        <LegendItem label="Struggling" color={theme.colors.struggling} />
        <LegendItem label="Mixed" color={theme.colors.ink} />
      </View>

      <Text style={styles.note}>Progress &gt; perfection</Text>
    </View>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
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
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.ink,
  },
});
