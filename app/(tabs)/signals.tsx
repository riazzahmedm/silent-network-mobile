import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { buildMapRowsFromDays, BuildMapCard } from '../../src/components/BuildMapCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { SignalMetricCard, toSignalCardMetric } from '../../src/components/SignalMetricCard';
import { api, ApiError } from '../../src/lib/api';
import type { BuildMapResponse, SignalsResponse } from '../../src/types/signals';
import { AppTheme, useTheme } from '../../src/theme';

export default function SignalsScreen() {
  const { accessToken } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [signals, setSignals] = useState<SignalsResponse | null>(null);
  const [buildMap, setBuildMap] = useState<BuildMapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError('You must be logged in to view signals.');
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setError(null);
        const [signalsResponse, buildMapResponse] = await Promise.all([
          api.getMySignals(accessToken),
          api.getMyBuildMap(accessToken, 28),
        ]);
        setSignals(signalsResponse);
        setBuildMap(buildMapResponse);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : 'Failed to load your signals.',
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const signalCards = useMemo(() => {
    if (!signals) {
      return [];
    }

    return [
      toSignalCardMetric(signals.builderSignal, 'building'),
      toSignalCardMetric(signals.learningSignal, 'learning'),
      toSignalCardMetric(signals.struggleSignal, 'struggling'),
    ];
  }, [signals]);

  const buildMapRows = useMemo(
    () => buildMapRowsFromDays(buildMap?.days ?? []),
    [buildMap],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            tintColor={theme.colors.ink}
          />
        }
      >
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

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={theme.colors.ink} />
            <Text style={styles.stateText}>Loading signals…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Signals unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadData(true)}
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {signalCards.map((signal) => (
                <SignalMetricCard key={signal.title} signal={signal} />
              ))}
            </View>

            <SectionHeading
              eyebrow="Journey"
              title="Your build map"
              detail="Multiple signals on one day become layered color tiles instead of a single flattened status."
            />

            <BuildMapCard rows={buildMapRows} />
          </>
        )}
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
    stateCard: {
      marginTop: 20,
      borderRadius: 24,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 10,
    },
    stateTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 16,
      color: theme.colors.ink,
    },
    stateText: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 23,
      color: theme.colors.muted,
    },
    retryButton: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.ink,
    },
    retryLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 13,
      color: theme.colors.card,
    },
  });
}
