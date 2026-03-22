import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme, useTheme } from '../theme';

export function FeedComposerCard() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const options = [
    { label: 'Building', icon: 'hammer-outline', tone: theme.colors.building },
    { label: 'Learning', icon: 'book-outline', tone: theme.colors.learning },
    { label: 'Struggling', icon: 'construct-outline', tone: theme.colors.struggling },
  ] as const;

  return (
    <LinearGradient
      colors={[theme.colors.night, theme.colors.nightSoft, '#46564B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.kicker}>Start Here</Text>
        <View style={styles.orbital} />
      </View>
      <Text style={styles.title}>Share a signal</Text>
      <Text style={styles.copy}>
        Start with what is true today. The app handles the structure.
      </Text>

      <View style={styles.row}>
        {options.map((option) => (
          <TouchableOpacity key={option.label} style={styles.option}>
            <View style={[styles.optionIcon, { backgroundColor: `${option.tone}18` }]}>
              <Ionicons name={option.icon} size={18} color={option.tone} />
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      marginHorizontal: 20,
      marginTop: -10,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? '#324036' : theme.colors.line,
      padding: 22,
      ...theme.shadows.float,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    kicker: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.amber,
    },
    orbital: {
      height: 12,
      width: 12,
      borderRadius: 999,
      backgroundColor: theme.colors.amber,
    },
    title: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 17,
      color: theme.colors.card,
      marginBottom: 8,
    },
    copy: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 24,
      color: theme.colors.heroSubtleText,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    option: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: theme.colors.overlay,
      borderWidth: 1,
      borderColor: theme.colors.overlayStrong,
      padding: 14,
      gap: 12,
    },
    optionIcon: {
      height: 34,
      width: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionLabel: {
      fontFamily: theme.fonts.sansMedium,
      color: theme.colors.card,
      fontSize: 13,
    },
  });
}
