import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
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
import { MilestoneBadgePill } from '../../src/components/MilestoneBadgePill';
import { SectionHeading } from '../../src/components/SectionHeading';
import { SignalMetricCard, toSignalCardMetric } from '../../src/components/SignalMetricCard';
import { api, ApiError } from '../../src/lib/api';
import type { BuildMapResponse, SignalsResponse } from '../../src/types/signals';
import { AppTheme, useTheme } from '../../src/theme';

export default function ProfileScreen() {
  const { accessToken, user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = createStyles(theme);
  const [signals, setSignals] = useState<SignalsResponse | null>(null);
  const [buildMap, setBuildMap] = useState<BuildMapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const loadData = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError('You must be logged in to view your profile.');
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
          err instanceof ApiError ? err.message : 'Failed to load your profile.',
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

  const buildMapRows = useMemo(
    () => buildMapRowsFromDays(buildMap?.days ?? []),
    [buildMap],
  );
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

  const profileName = signals?.user.name || user?.name || signals?.user.username || user?.username || 'Developer';
  const profileHandle = signals?.user.username || user?.username || 'dev';
  const heroInitials = profileName.slice(0, 2).toUpperCase();
  const highlights = useMemo(() => {
    const topTopic =
      signals?.topLearningTopics?.[0]
        ? signals.topLearningTopics[0]
            .split(/[\s_-]+/)
            .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
            .join(' ')
        : 'No topic yet';

    return [
      {
        title: 'Builder signal',
        value: `${signals?.builderSignal.value ?? 0} ${signals?.builderSignal.unit ?? 'days'}`,
      },
      {
        title: 'Top learning topic',
        value: topTopic,
      },
      {
        title: 'Journey window',
        value: `${buildMap?.range.days ?? 0} days`,
      },
    ];
  }, [buildMap?.range.days, signals]);

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
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipLabel}>Developer Profile</Text>
            </View>
            <Pressable style={styles.themeToggle} onPress={toggleTheme}>
              <Text style={styles.themeToggleLabel}>{isDark ? 'Light' : 'Dark'}</Text>
            </Pressable>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{heroInitials}</Text>
          </View>
          <Text style={styles.name}>{profileName}</Text>
          <Text style={styles.role}>@{profileHandle}</Text>
          <Text style={styles.bio}>
            {user?.email || 'Shipping calm software for developers who want signal, not status.'}
          </Text>
          {signals?.user.badges?.length ? (
            <View style={styles.badgesRow}>
              {signals.user.badges.map((badge) => (
                <MilestoneBadgePill
                  key={`${badge.kind}-${badge.label}`}
                  badge={badge}
                />
              ))}
            </View>
          ) : null}
        </LinearGradient>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={theme.colors.ink} />
            <Text style={styles.stateText}>Loading profile…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Profile unavailable</Text>
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
            <View style={styles.metricsRow}>
              {[
                signals?.builderSignal,
                signals?.learningSignal,
                signals?.struggleSignal,
              ].map((signal) => (
                <View key={signal?.label} style={styles.metricTile}>
                  <Text style={styles.metricValue}>{signal?.value ?? 0}</Text>
                  <Text style={styles.metricLabel}>{signal?.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>Highlights</Text>
              {highlights.map((highlight) => (
                <View key={highlight.title} style={styles.highlightRow}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightValue}>{highlight.value}</Text>
                </View>
              ))}
            </View>

            <SectionHeading
              eyebrow="Signals"
              title="Your developer signals"
              detail="Consistency, learning, and debugging history live inside your profile."
            />

            <View style={styles.signalGrid}>
              {signalCards.map((signal) => (
                <SignalMetricCard key={signal.title} signal={signal} />
              ))}
            </View>

            <SectionHeading
              eyebrow="Journey"
              title="Your developer map"
              detail="Multiple updates on one day become layered tiles instead of a single flattened status."
            />

            <BuildMapCard rows={buildMapRows} />
          </>
        )}

        <Pressable
          style={styles.logoutButton}
          onPress={() => setIsLogoutConfirmOpen(true)}
        >
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isLogoutConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutConfirmOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Log out?</Text>
            <Text style={styles.confirmText}>
              Your session will be cleared on this device. You can log back in anytime.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsLogoutConfirmOpen(false)}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.confirmButton}
                onPress={() => {
                  setIsLogoutConfirmOpen(false);
                  void logout();
                }}
              >
                <Text style={styles.confirmLabel}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
      paddingTop: 10,
      paddingBottom: 148,
      gap: 22,
    },
    hero: {
      borderRadius: 28,
      padding: 24,
      gap: 10,
    },
    heroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    heroChip: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor:
        theme.mode === 'dark' ? theme.colors.overlay : 'rgba(255,255,255,0.4)',
      borderWidth: 1,
      borderColor:
        theme.mode === 'dark'
          ? theme.colors.overlayStrong
          : 'rgba(255,255,255,0.45)',
    },
    heroChipLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.7,
      textTransform: 'uppercase',
      color: theme.colors.amber,
    },
    themeToggle: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.ink,
    },
    themeToggleLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.3,
      textTransform: 'uppercase',
      color: theme.colors.card,
    },
    avatar: {
      height: 68,
      width: 68,
      borderRadius: 20,
      backgroundColor: theme.colors.ink,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    avatarLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.card,
      fontSize: 24,
    },
    name: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 32,
      letterSpacing: -0.6,
      color: theme.colors.ink,
    },
    role: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 15,
      color: theme.colors.accentBlue,
    },
    bio: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 26,
      color: theme.colors.muted,
      maxWidth: 300,
      marginTop: 6,
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 14,
    },
    metricTile: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 6,
    },
    metricValue: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 22,
      color: theme.colors.ink,
    },
    metricLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.muted,
    },
    section: {
      borderRadius: 20,
      backgroundColor: theme.colors.cardMuted,
      padding: 18,
      gap: 16,
    },
    sectionEyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.colors.moss,
    },
    highlightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    highlightTitle: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 14,
      color: theme.colors.ink,
    },
    highlightValue: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      color: theme.colors.muted,
    },
    signalGrid: {
      gap: 14,
    },
    logoutButton: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.ink,
      fontSize: 14,
    },
    stateCard: {
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
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(17, 16, 14, 0.26)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    confirmCard: {
      width: '100%',
      borderRadius: 28,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 14,
      ...theme.shadows.float,
    },
    confirmTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 18,
      color: theme.colors.ink,
    },
    confirmText: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.muted,
    },
    confirmActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 4,
    },
    cancelButton: {
      minHeight: 46,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    cancelLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 14,
      color: theme.colors.ink,
    },
    confirmButton: {
      minHeight: 46,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.ink,
    },
    confirmLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.card,
    },
  });
}
