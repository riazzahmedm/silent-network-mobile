import { StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '../theme';
import { layout } from '../ui/layout';

type BuildMapMiniCardProps = {
  rows: Array<Array<'building' | 'learning' | 'struggling' | 'mixed' | 'empty'>>;
};

export function BuildMapMiniCard({ rows }: BuildMapMiniCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const colorMap = {
    building: theme.colors.building,
    learning: theme.colors.learning,
    struggling: theme.colors.struggling,
    mixed: theme.colors.ink,
    empty: theme.colors.empty,
  } as const;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.eyebrow}>Your Journey</Text>
      <Text style={styles.title}>A visual diary of recent coding days</Text>

      <View style={styles.gridShell}>
        <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`mini-row-${rowIndex}`} style={styles.row}>
            {row.map((tone, columnIndex) => (
              <View
                key={`mini-cell-${rowIndex}-${columnIndex}`}
                style={[
                  styles.cell,
                  { backgroundColor: colorMap[tone as keyof typeof colorMap] },
                ]}
              />
            ))}
          </View>
        ))}
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      paddingHorizontal: layout.screenPadding,
      gap: 10,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.colors.plum,
    },
    title: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 15,
      color: theme.colors.ink,
    },
    gridShell: {
      borderRadius: layout.radiusCard,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 16,
    },
    grid: {
      gap: 6,
    },
    row: {
      flexDirection: 'row',
      gap: 6,
    },
    cell: {
      flex: 1,
      height: 18,
      borderRadius: 6,
    },
  });
}
