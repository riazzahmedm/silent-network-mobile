import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '../src/theme';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Silent Network</Text>
      <Text style={styles.title}>This page does not exist.</Text>
      <Link href="/(tabs)" style={styles.link}>
        Go back home
      </Link>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.paper,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 12,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.moss,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 34,
      color: theme.colors.ink,
    },
    link: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.accentBlue,
      fontSize: 16,
    },
  });
}
