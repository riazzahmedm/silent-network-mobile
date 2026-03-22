import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

const options = [
  { label: 'Building', icon: 'hammer-outline', tone: theme.colors.building },
  { label: 'Learning', icon: 'book-outline', tone: theme.colors.learning },
  { label: 'Struggling', icon: 'construct-outline', tone: theme.colors.struggling },
] as const;

export function FeedComposerCard() {
  return (
    <View style={styles.card}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: -18,
    borderRadius: 26,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    ...theme.shadows.soft,
  },
  title: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.ink,
    marginBottom: 6,
  },
  copy: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  option: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FAF6F0',
    padding: 12,
    gap: 10,
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
    color: theme.colors.ink,
    fontSize: 13,
  },
});
