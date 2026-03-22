import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuildMapCard } from '../../src/components/BuildMapCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { SignalMetricCard } from '../../src/components/SignalMetricCard';
import { profileSignals } from '../../src/mock-data';
import { theme } from '../../src/theme';

export default function SignalsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Signals</Text>
          <Text style={styles.title}>Progress you can feel, not perform.</Text>
          <Text style={styles.copy}>
            Quiet indicators of consistency, learning, and honesty. No vanity metrics.
          </Text>
        </View>

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

const styles = StyleSheet.create({
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
    paddingVertical: 12,
  },
  eyebrow: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: theme.colors.accentBlue,
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
