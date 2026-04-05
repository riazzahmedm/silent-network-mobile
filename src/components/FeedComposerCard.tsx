import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import type { PostType } from '../types/feed';
import { AppTheme, useTheme } from '../theme';
import { layout } from '../ui/layout';

type FeedComposerCardProps = {
  onSelectType?: (type: PostType) => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function FeedComposerCard({
  onSelectType,
  disabled,
  fullWidth = false,
}: FeedComposerCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const options = [
    {
      label: 'Building',
      icon: 'hammer-outline',
      tone: theme.colors.building,
      type: 'BUILDING' as const,
    },
    {
      label: 'Learning',
      icon: 'book-outline',
      tone: theme.colors.learning,
      type: 'LEARNING' as const,
    },
    {
      label: 'Struggling',
      icon: 'construct-outline',
      tone: theme.colors.struggling,
      type: 'STRUGGLING' as const,
    },
  ] as const;

  return (
    <View style={[styles.wrapper, fullWidth && styles.wrapperFullWidth]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>Share a Signal</Text>
          <Text style={styles.title}>Choose the kind of update you want to log.</Text>
        </View>
        <View style={styles.orbital} />
      </View>

      <View style={styles.row}>
        {options.map((option) => (
          <AnimatedPressable
            key={option.label}
            style={[
              styles.option,
              { borderTopColor: option.tone },
              disabled && styles.optionDisabled,
            ]}
            disabled={disabled}
            scaleTo={0.975}
            onPress={() => onSelectType?.(option.type)}
          >
            <LinearGradient
              colors={[`${option.tone}22`, `${option.tone}08`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGlow}
            />
            <View style={[styles.optionIcon, { backgroundColor: `${option.tone}18` }]}>
              <Ionicons name={option.icon} size={18} color={option.tone} />
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      marginHorizontal: layout.screenPadding,
      marginTop: -10,
      gap: layout.itemGap,
    },
    wrapperFullWidth: {
      marginHorizontal: layout.screenPadding - 4,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    kicker: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.plum,
      marginBottom: 6,
    },
    orbital: {
      height: 12,
      width: 12,
      borderRadius: 999,
      backgroundColor: theme.colors.amber,
      marginTop: 6,
    },
    title: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 15,
      lineHeight: 24,
      color: theme.colors.ink,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    option: {
      flex: 1,
      borderRadius: layout.radiusCard - 2,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: `${theme.colors.line}B8`,
      borderTopWidth: 3,
      paddingVertical: layout.itemGap,
      paddingHorizontal: 14,
      gap: 12,
      overflow: 'hidden'
    },
    optionGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    optionDisabled: {
      opacity: 0.65,
    },
    optionIcon: {
      height: 34,
      width: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.ink,
      fontSize: 13,
    },
  });
}
