import { StyleSheet, Text, View } from 'react-native';
import type { MilestoneBadge } from '../types/feed';
import { AppTheme, useTheme } from '../theme';

type MilestoneBadgePillProps = {
  badge: MilestoneBadge;
  compact?: boolean;
};

export function MilestoneBadgePill({
  badge,
  compact = false,
}: MilestoneBadgePillProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme, compact);
  const tone = getBadgeTone(theme, badge.kind);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${tone}16`,
          borderColor: `${tone}30`,
        },
      ]}
    >
      <Text style={[styles.label, { color: tone }]} numberOfLines={1}>
        {badge.label}
      </Text>
    </View>
  );
}

function getBadgeTone(theme: AppTheme, kind: MilestoneBadge['kind']) {
  switch (kind) {
    case 'BUILDING':
      return theme.colors.building;
    case 'LEARNING':
      return theme.colors.learning;
    case 'STRUGGLING':
      return theme.colors.struggling;
    default:
      return theme.colors.amber;
  }
}

function createStyles(theme: AppTheme, compact: boolean) {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: compact ? 10 : 12,
      paddingVertical: compact ? 5 : 8,
      maxWidth: '100%',
    },
    label: {
      fontFamily: theme.fonts.sansBold,
      fontSize: compact ? 10 : 12,
      letterSpacing: compact ? 0.8 : 0.4,
      textTransform: compact ? 'uppercase' : 'none',
    },
  });
}
