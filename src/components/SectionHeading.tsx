import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  detail?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  detail,
}: SectionHeadingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 16,
  },
  eyebrow: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: theme.colors.moss,
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    lineHeight: 32,
    color: theme.colors.ink,
    marginBottom: 8,
  },
  detail: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
    maxWidth: 330,
  },
});
