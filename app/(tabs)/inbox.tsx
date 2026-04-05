import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { ConversationPreviewCard } from '../../src/components/ConversationPreviewCard';
import { api, ApiError } from '../../src/lib/api';
import { layout } from '../../src/ui/layout';
import type { ConversationListItem } from '../../src/types/messaging';
import { AppTheme, useTheme } from '../../src/theme';

export default function InboxScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { accessToken, user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError('You must be logged in to view the inbox.');
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
        const response = await api.getConversations(accessToken);
        setConversations(response);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : 'Failed to load conversations.',
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const threadPreviews = useMemo(() => {
    return conversations.map((conversation) => {
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
  }, [conversations, user?.id]);

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
            onRefresh={() => loadConversations(true)}
            tintColor={theme.colors.ink}
          />
        }
      >
        <LinearGradient
          colors={[theme.colors.blush, theme.colors.paper, theme.colors.paperDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>Inbox</Text>
          <Text style={styles.title}>Quiet developer conversations, started by useful intent.</Text>
          <Text style={styles.copy}>
            Interactions like “I can help debug this” open direct threads. No public comment theater.
          </Text>
        </LinearGradient>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={theme.colors.ink} />
            <Text style={styles.stateText}>Loading inbox…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Inbox unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadConversations(true)}
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : threadPreviews.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No conversations yet</Text>
            <Text style={styles.stateText}>
              Private replies from developer posts will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.threadColumn}>
            {threadPreviews.map((thread) => (
              <ConversationPreviewCard
                key={thread.id}
                thread={thread}
                onPress={() => router.push(`/${'conversations'}/${thread.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function inferConversationTitle(content: string) {
  const value = content.toLowerCase();
  if (value.includes('learned this too')) {
    return 'I Learned This Too';
  }
  if (value.includes('shipped something similar') || value.includes('built something similar')) {
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
      paddingHorizontal: layout.screenPadding,
      paddingTop: 8,
    },
    hero: {
      borderRadius: layout.radiusHero,
      padding: layout.modalPadding,
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? theme.colors.line : 'rgba(255,255,255,0.7)',
      ...theme.shadows.soft,
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
      fontFamily: theme.fonts.sansBold,
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.5,
      color: theme.colors.ink,
      marginBottom: 8,
    },
    copy: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 24,
      color: theme.colors.muted,
      maxWidth: 330,
    },
    threadColumn: {
      gap: layout.itemGap,
      marginTop: layout.heroPadding,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.line,
    },
    stateCard: {
      marginTop: layout.heroPadding,
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
  });
}
