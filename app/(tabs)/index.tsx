import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { AnimatedEntrance } from '../../src/components/AnimatedEntrance';
import { AnimatedPressable } from '../../src/components/AnimatedPressable';
import { buildMapRowsFromDays } from '../../src/components/BuildMapCard';
import { BuildMapMiniCard } from '../../src/components/BuildMapMiniCard';
import { ConversationPreviewCard } from '../../src/components/ConversationPreviewCard';
import { FeedComposerCard } from '../../src/components/FeedComposerCard';
import { SignalMetricCard, toSignalCardMetric } from '../../src/components/SignalMetricCard';
import { api, ApiError } from '../../src/lib/api';
import { layout } from '../../src/ui/layout';
import type { ConversationListItem } from '../../src/types/messaging';
import type { BuildMapResponse, SignalsResponse } from '../../src/types/signals';
import { AppTheme, useTheme } from '../../src/theme';

type DashboardState = {
  signals: SignalsResponse | null;
  buildMap: BuildMapResponse | null;
  conversations: ConversationListItem[];
};

export default function HomeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { accessToken, user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [data, setData] = useState<DashboardState>({
    signals: null,
    buildMap: null,
    conversations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError('You must be logged in to view home.');
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
        const [signals, buildMap, conversations] = await Promise.all([
          api.getMySignals(accessToken),
          api.getMyBuildMap(accessToken, 21),
          api.getConversations(accessToken),
        ]);

        setData({ signals, buildMap, conversations });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load home.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const signalCards = useMemo(() => {
    if (!data.signals) {
      return [];
    }

    return [
      toSignalCardMetric(data.signals.builderSignal, 'building'),
      toSignalCardMetric(data.signals.learningSignal, 'learning'),
      toSignalCardMetric(data.signals.struggleSignal, 'struggling'),
    ];
  }, [data.signals]);

  const buildMapRows = useMemo(
    () => buildMapRowsFromDays(data.buildMap?.days ?? []),
    [data.buildMap],
  );

  const threadPreviews = useMemo(() => {
    return data.conversations.slice(0, 2).map((conversation) => {
      const otherParticipant =
        conversation.participants.find((participant) => participant.id !== user?.id) ??
        conversation.participants[0];
      const title = inferConversationTitle(conversation.lastMessage?.content ?? '');

      return {
        id: conversation.id,
        title,
        name: otherParticipant?.name || otherParticipant?.username || 'Conversation',
        snippet: conversation.lastMessage?.content || 'No messages yet',
        time: formatRelativeTime(
          conversation.lastMessage?.createdAt ?? conversation.createdAt,
        ),
        accent: inferAccent(title),
      };
    });
  }, [data.conversations, user?.id]);

  const firstName =
    data.signals?.user.name?.split(' ')[0] ||
    user?.name?.split(' ')[0] ||
    user?.username ||
    'Developer';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 34 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={theme.colors.ink}
          />
        }
      >
        <AnimatedEntrance delay={20}>
          <LinearGradient
            colors={[theme.colors.blush, theme.colors.paper, theme.colors.paperDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.eyebrow}>Home</Text>
            <Text style={styles.heroTitle}>Welcome back, {firstName}.</Text>
            <Text style={styles.heroCopy}>
              Your developer dashboard for shipping, learning, debugging, and keeping
              conversations moving.
            </Text>

            <View style={styles.quickRow}>
              <QuickAction
                label="Open Feed"
                icon="flash-outline"
                onPress={() => router.push('/(tabs)/feed')}
              />
              <QuickAction
                label="Inbox"
                icon="chatbubble-ellipses-outline"
                onPress={() => router.push('/(tabs)/inbox')}
              />
              <QuickAction
                label="Profile"
                icon="person-outline"
                onPress={() => router.push('/(tabs)/profile')}
              />
            </View>
          </LinearGradient>
        </AnimatedEntrance>

        <AnimatedEntrance delay={60}>
          <FeedComposerCard
            fullWidth
            onSelectType={(type) =>
              router.push({
                pathname: '/(tabs)/feed',
                params: {
                  compose: '1',
                  type,
                },
              })
            }
          />
        </AnimatedEntrance>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={theme.colors.ink} />
            <Text style={styles.stateText}>Loading home…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Home unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadDashboard(true)}
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Today</Text>
              <Text style={styles.sectionTitle}>Your developer signals</Text>
            </View>

            <AnimatedEntrance delay={90} style={styles.signalGrid}>
              {signalCards.map((signal) => (
                <SignalMetricCard key={signal.title} signal={signal} />
              ))}
            </AnimatedEntrance>

            <AnimatedEntrance delay={120}>
              <BuildMapMiniCard rows={buildMapRows} />
            </AnimatedEntrance>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Inbox</Text>
              <Text style={styles.sectionTitle}>Recent private threads</Text>
            </View>

            {threadPreviews.length > 0 ? (
              <AnimatedEntrance delay={150} style={styles.threadColumn}>
                {threadPreviews.map((thread) => (
                  <ConversationPreviewCard
                    key={thread.id}
                    thread={thread}
                    onPress={() => router.push(`/conversations/${thread.id}`)}
                  />
                ))}
              </AnimatedEntrance>
            ) : (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>No conversations yet</Text>
                <Text style={styles.stateText}>
                  Private replies from the feed will start appearing here.
                </Text>
              </View>
            )}

            <AnimatedPressable
              style={styles.primaryButton}
              scaleTo={0.98}
              onPress={() => router.push('/(tabs)/feed')}
            >
              <Text style={styles.primaryButtonLabel}>Go to Feed</Text>
            </AnimatedPressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <AnimatedPressable style={styles.quickAction} scaleTo={0.97} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={16} color={theme.colors.ink} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

function inferConversationTitle(content: string) {
  const value = content.toLowerCase();
  if (value.includes('learned this too')) {
    return 'I Learned This Too';
  }
  if (
    value.includes('shipped something similar') ||
    value.includes('built something similar')
  ) {
    return 'I Shipped Something Similar';
  }
  if (value.includes('help debug') || value.includes('help')) {
    return 'I Can Help Debug This';
  }
  return 'Direct Message';
}

function inferAccent(title: string): 'building' | 'learning' | 'struggling' {
  if (title === 'I Learned This Too') {
    return 'learning';
  }
  if (title === 'I Shipped Something Similar') {
    return 'building';
  }
  return 'struggling';
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return '';
  }

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) {
    return 'now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.paper,
    },
    content: {
      gap: layout.sectionGap,
    },
    hero: {
      marginHorizontal: layout.screenPadding - 4,
      paddingHorizontal: layout.heroPadding,
      paddingTop: layout.heroPadding,
      paddingBottom: layout.heroPadding + 4,
      borderRadius: layout.radiusHero + 2,
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? theme.colors.line : 'rgba(255,255,255,0.7)',
      overflow: 'hidden',
      gap: 10,
      ...theme.shadows.soft,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.plum,
    },
    heroTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 34,
      lineHeight: 38,
      letterSpacing: -0.6,
      color: theme.colors.ink,
    },
    heroCopy: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 26,
      color: theme.colors.muted,
      maxWidth: 330,
    },
    quickRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    quickAction: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: theme.mode === 'dark' ? theme.colors.overlay : 'rgba(255,255,255,0.58)',
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? theme.colors.overlayStrong : 'rgba(255,255,255,0.7)',
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionIcon: {
      height: 28,
      width: 28,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.mode === 'dark' ? theme.colors.cardMuted : theme.colors.card,
    },
    quickActionLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.ink,
    },
    sectionHeader: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: 12,
      gap: 6,
    },
    sectionEyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.colors.plum,
    },
    sectionTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 24,
      lineHeight: 29,
      letterSpacing: -0.4,
      color: theme.colors.ink,
    },
    signalGrid: {
      paddingHorizontal: layout.screenPadding,
      gap: layout.itemGap,
    },
    threadColumn: {
      paddingHorizontal: layout.screenPadding,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.line,
    },
    stateCard: {
      marginHorizontal: layout.screenPadding,
      borderRadius: layout.radiusCard + 2,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: layout.modalPadding,
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
    primaryButton: {
      marginHorizontal: layout.screenPadding,
      minHeight: 52,
      borderRadius: layout.radiusTile,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.ink,
      marginTop: 4,
    },
    primaryButtonLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.card,
    },
  });
}
