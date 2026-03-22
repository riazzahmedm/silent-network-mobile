import { StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '../theme';

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
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 38,
      paddingBottom: 22,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.plum,
      marginBottom: 8,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 31,
      lineHeight: 36,
      color: theme.colors.ink,
      marginBottom: 10,
    },
    detail: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 24,
      color: theme.colors.muted,
      maxWidth: 320,
    },
  });
}
