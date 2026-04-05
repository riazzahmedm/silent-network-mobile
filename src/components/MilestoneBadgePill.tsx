import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const icon = getBadgeIcon(badge.kind);
  const descriptor = getBadgeDescriptor(badge);

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
      {!compact ? (
        <View style={styles.patternLayer} pointerEvents="none">
          {renderBadgePattern(badge.kind, tone, styles)}
        </View>
      ) : null}
      <LinearGradient
        colors={[`${tone}22`, `${tone}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glow}
      />
      <View style={styles.innerRow}>
        <View
          style={[
            styles.iconShell,
            getIconShellStyle(badge.kind, styles),
            {
              backgroundColor: `${tone}18`,
              borderColor: `${tone}38`,
            },
          ]}
        >
          <Ionicons name={icon} size={compact ? 12 : 16} color={tone} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: tone }]} numberOfLines={1}>
            {badge.label}
          </Text>
          {!compact ? <Text style={styles.meta}>{descriptor}</Text> : null}
        </View>
      </View>
      {!compact ? (
        <View
          style={[
            styles.thresholdChip,
            {
              backgroundColor: `${tone}14`,
              borderColor: `${tone}28`,
            },
          ]}
        >
          <Text style={[styles.thresholdLabel, { color: tone }]}>
            {badge.threshold}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function renderBadgePattern(
  kind: MilestoneBadge['kind'],
  tone: string,
  styles: ReturnType<typeof createStyles>,
) {
  switch (kind) {
    case 'BUILDING':
      return (
        <>
          <View
            style={[
              styles.beamVertical,
              {
                backgroundColor: `${tone}14`,
              },
            ]}
          />
          <View
            style={[
              styles.beamDiagonal,
              {
                backgroundColor: `${tone}10`,
              },
            ]}
          />
        </>
      );
    case 'LEARNING':
      return (
        <>
          <View
            style={[
              styles.pageArcLarge,
              {
                borderColor: `${tone}18`,
              },
            ]}
          />
          <View
            style={[
              styles.pageArcSmall,
              {
                borderColor: `${tone}12`,
              },
            ]}
          />
        </>
      );
    case 'STRUGGLING':
      return (
        <>
          <View style={[styles.dot, styles.dotOne, { backgroundColor: `${tone}18` }]} />
          <View style={[styles.dot, styles.dotTwo, { backgroundColor: `${tone}14` }]} />
          <View
            style={[
              styles.ring,
              {
                borderColor: `${tone}14`,
              },
            ]}
          />
        </>
      );
    default:
      return null;
  }
}

function getIconShellStyle(
  kind: MilestoneBadge['kind'],
  styles: ReturnType<typeof createStyles>,
) {
  switch (kind) {
    case 'BUILDING':
      return styles.iconShellBuilding;
    case 'LEARNING':
      return styles.iconShellLearning;
    case 'STRUGGLING':
      return styles.iconShellStruggling;
    default:
      return null;
  }
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

function getBadgeIcon(kind: MilestoneBadge['kind']) {
  switch (kind) {
    case 'BUILDING':
      return 'hammer-outline' as const;
    case 'LEARNING':
      return 'book-outline' as const;
    case 'STRUGGLING':
      return 'construct-outline' as const;
    default:
      return 'ribbon-outline' as const;
  }
}

function getBadgeDescriptor(badge: MilestoneBadge) {
  switch (badge.kind) {
    case 'BUILDING':
      return `${badge.threshold}+ build days`;
    case 'LEARNING':
      return `${badge.threshold}+ learnings`;
    case 'STRUGGLING':
      return `${badge.threshold}+ shared blockers`;
    default:
      return `${badge.threshold}+ milestones`;
  }
}

function createStyles(theme: AppTheme, compact: boolean) {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      minWidth: compact ? undefined : 164,
      borderRadius: compact ? 999 : 22,
      borderWidth: 1,
      paddingHorizontal: compact ? 10 : 14,
      paddingVertical: compact ? 5 : 12,
      maxWidth: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    glow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    patternLayer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 6 : 10,
      paddingRight: compact ? 0 : 28,
    },
    iconShell: {
      height: compact ? 22 : 34,
      width: compact ? 22 : 34,
      borderRadius: compact ? 11 : 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    iconShellBuilding: {
      borderRadius: 10,
      transform: [{ rotate: '-8deg' }],
    },
    iconShellLearning: {
      borderRadius: 9,
    },
    iconShellStruggling: {
      borderRadius: 18,
    },
    copy: {
      gap: compact ? 0 : 3,
      minWidth: 0,
    },
    label: {
      fontFamily: theme.fonts.sansBold,
      fontSize: compact ? 10 : 12,
      letterSpacing: compact ? 0.8 : 0.4,
      textTransform: compact ? 'uppercase' : 'none',
    },
    meta: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 11,
      lineHeight: 15,
      color: theme.colors.muted,
    },
    thresholdChip: {
      position: 'absolute',
      top: 8,
      right: 8,
      minWidth: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    thresholdLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 0.3,
    },
    beamVertical: {
      position: 'absolute',
      top: -10,
      right: 32,
      width: 54,
      height: 120,
      borderRadius: 18,
      transform: [{ rotate: '18deg' }],
    },
    beamDiagonal: {
      position: 'absolute',
      top: 18,
      right: -12,
      width: 72,
      height: 36,
      borderRadius: 18,
      transform: [{ rotate: '-22deg' }],
    },
    pageArcLarge: {
      position: 'absolute',
      top: -24,
      right: -10,
      width: 108,
      height: 108,
      borderRadius: 54,
      borderWidth: 1,
    },
    pageArcSmall: {
      position: 'absolute',
      top: 4,
      right: 18,
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 1,
    },
    dot: {
      position: 'absolute',
      borderRadius: 999,
    },
    dotOne: {
      top: 14,
      right: 48,
      width: 10,
      height: 10,
    },
    dotTwo: {
      top: 32,
      right: 18,
      width: 16,
      height: 16,
    },
    ring: {
      position: 'absolute',
      top: -18,
      right: -14,
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 1,
    },
  });
}
