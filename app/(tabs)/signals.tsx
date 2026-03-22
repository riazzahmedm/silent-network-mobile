import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuildMapCard } from '../../src/components/BuildMapCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { SignalMetricCard } from '../../src/components/SignalMetricCard';
import { profileSignals } from '../../src/mock-data';
import { AppTheme, useTheme } from '../../src/theme';

export default function SignalsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.blush, theme.colors.paper, theme.colors.paperDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.eyebrow}>Signals</Text>
          <Text style={styles.title}>Progress you can feel, not perform.</Text>
          <Text style={styles.copy}>
            Quiet indicators of consistency, learning, and honesty. No vanity metrics.
          </Text>
        </LinearGradient>

        <View style={styles.grid}>
          {profileSignals.map((signal) => (
            <SignalMetricCard key={signal.title} signal={signal} />
          ))}
        </View>

        <SectionHeading
          eyebrow="Journey"
          title="Your build map"
          detail="Multiple signals on one day become layered color tiles instead of a single flattened status."
        />

        <BuildMapCard />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.paper,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 120,
    },
    header: {
      padding: 22,
      borderRadius: 28,
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
      fontSize: 34,
      lineHeight: 39,
      color: theme.colors.ink,
      marginBottom: 10,
    },
    copy: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 24,
      color: theme.colors.muted,
      maxWidth: 330,
    },
    grid: {
      gap: 14,
      marginTop: 20,
    },
  });
}
