import { Ionicons } from '@expo/vector-icons';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { FeedComposerCard } from '../../src/components/FeedComposerCard';
import { FeedPostCard } from '../../src/components/FeedPostCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { api, ApiError } from '../../src/lib/api';
import type { FeedPost, PostType } from '../../src/types/feed';
import { AppTheme, useTheme } from '../../src/theme';

export default function FeedScreen() {
  const { accessToken } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selectedType, setSelectedType] = useState<PostType | undefined>();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<PostType>('BUILDING');
  const [composerContent, setComposerContent] = useState('');
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filters = useMemo(
    () => [
      { label: 'All Signals', value: undefined },
      { label: 'Building', value: 'BUILDING' as PostType },
      { label: 'Learning', value: 'LEARNING' as PostType },
      { label: 'Struggling', value: 'STRUGGLING' as PostType },
    ],
    [],
  );

  const loadFeed = useCallback(
    async (options?: { refresh?: boolean; cursor?: string | null }) => {
      const isRefresh = !!options?.refresh;
      const cursor = options?.cursor;

      if (isRefresh) {
        setIsRefreshing(true);
      } else if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
      }

      try {
        setFeedError(null);
        const response = await api.getFeed({
          type: selectedType,
          limit: 10,
          cursor: cursor ?? undefined,
        });

        setPosts((current) =>
          cursor ? [...current, ...response.items] : response.items,
        );
        setHasMore(response.page.hasMore);
        setNextCursor(response.page.nextCursor ?? null);
      } catch (error) {
        setFeedError(
          error instanceof ApiError ? error.message : 'Failed to load the feed.',
        );
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [selectedType],
  );

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  function openComposer(type?: PostType) {
    setComposerType(type ?? selectedType ?? 'BUILDING');
    setComposerContent('');
    setComposerError(null);
    setIsComposerOpen(true);
  }

  async function handleSubmitPost() {
    if (!accessToken) {
      setComposerError('You must be logged in to post.');
      return;
    }

    const trimmedContent = composerContent.trim();
    if (!trimmedContent) {
      setComposerError('Write a short progress update.');
      return;
    }

    setIsSubmitting(true);
    setComposerError(null);

    try {
      await api.createPost(
        {
          type: composerType,
          content: trimmedContent,
        },
        accessToken,
      );
      setIsComposerOpen(false);
      setComposerContent('');
      await loadFeed({ refresh: true });
    } catch (error) {
      setComposerError(
        error instanceof ApiError ? error.message : 'Failed to publish post.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadFeed({ refresh: true })}
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
          <View style={styles.heroAuraOne} />
          <View style={styles.heroAuraTwo} />
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.eyebrow}>Signal Over Noise</Text>
              <Text style={styles.heroTitle}>A calm feed for the real work.</Text>
            </View>
            <TouchableOpacity style={styles.composeButton} onPress={() => openComposer()}>
              <Ionicons name="add" color={theme.colors.card} size={24} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroCopy}>
            No likes. No follower counts. Just builders sharing what they are building,
            learning, and struggling with.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((filter) => {
              const isActive = filter.value === selectedType || (!filter.value && !selectedType);

              return (
              <Pressable
                key={filter.label}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedType(filter.value)}
              >
                <Text
                  style={[styles.filterLabel, isActive && styles.filterLabelActive]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            )})}
          </ScrollView>
        </LinearGradient>

        <FeedComposerCard
          onSelectType={(type) => openComposer(type)}
          disabled={isSubmitting}
        />

        <SectionHeading
          eyebrow="Today"
          title="Builders sharing the actual work"
          detail="Private responses turn posts into conversations, not performances."
        />

        {isInitialLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={theme.colors.ink} />
            <Text style={styles.stateText}>Loading feed…</Text>
          </View>
        ) : feedError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Feed unavailable</Text>
            <Text style={styles.stateText}>{feedError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadFeed({ refresh: true })}
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Nothing here yet</Text>
            <Text style={styles.stateText}>
              Switch the filter or publish the first signal.
            </Text>
          </View>
        ) : (
          <View style={styles.postsColumn}>
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}

            {hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => loadFeed({ cursor: nextCursor })}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color={theme.colors.ink} />
                ) : (
                  <Text style={styles.loadMoreLabel}>Load more</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isComposerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsComposerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share a signal</Text>
              <Pressable onPress={() => setIsComposerOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.ink} />
              </Pressable>
            </View>

            <View style={styles.modalTypeRow}>
              {(['BUILDING', 'LEARNING', 'STRUGGLING'] as PostType[]).map((type) => {
                const active = composerType === type;

                return (
                  <Pressable
                    key={type}
                    style={[styles.modalTypeChip, active && styles.modalTypeChipActive]}
                    onPress={() => setComposerType(type)}
                  >
                    <Text
                      style={[
                        styles.modalTypeLabel,
                        active && styles.modalTypeLabelActive,
                      ]}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={composerContent}
              onChangeText={(value) => {
                setComposerContent(value);
                if (composerError) {
                  setComposerError(null);
                }
              }}
              placeholder="What are you building, learning, or struggling with today?"
              placeholderTextColor={theme.mode === 'dark' ? '#8E8A84' : '#8C968E'}
              multiline
              textAlignVertical="top"
              maxLength={2000}
              style={styles.modalInput}
            />

            <View style={styles.modalFooter}>
              <Text style={styles.characterCount}>{composerContent.trim().length}/2000</Text>
              <TouchableOpacity
                style={[
                  styles.publishButton,
                  (isSubmitting || !composerContent.trim()) && styles.publishButtonDisabled,
                ]}
                disabled={isSubmitting || !composerContent.trim()}
                onPress={handleSubmitPost}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.colors.card} />
                ) : (
                  <Text style={styles.publishLabel}>Publish</Text>
                )}
              </TouchableOpacity>
            </View>

            {composerError ? <Text style={styles.composerError}>{composerError}</Text> : null}
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
      paddingBottom: 148,
    },
    hero: {
      paddingHorizontal: 24,
      paddingTop: 22,
      paddingBottom: 42,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      overflow: 'hidden',
    },
    heroAuraOne: {
      position: 'absolute',
      top: -30,
      right: -20,
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor:
        theme.mode === 'dark' ? 'rgba(197,141,61,0.14)' : 'rgba(243,216,199,0.60)',
    },
    heroAuraTwo: {
      position: 'absolute',
      bottom: -80,
      left: -40,
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor:
        theme.mode === 'dark' ? 'rgba(79,124,130,0.12)' : 'rgba(79,124,130,0.10)',
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 20,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      color: theme.colors.moss,
      marginBottom: 8,
    },
    heroTitle: {
      fontFamily: theme.fonts.serif,
      fontSize: 40,
      lineHeight: 44,
      color: theme.colors.ink,
      maxWidth: 280,
    },
    heroCopy: {
      marginTop: 20,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 26,
      color: theme.colors.muted,
      maxWidth: 320,
    },
    composeButton: {
      height: 52,
      width: 52,
      borderRadius: 18,
      backgroundColor: theme.colors.ink,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.ink,
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    filterRow: {
      gap: 12,
      paddingTop: 24,
    },
    filterChip: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 999,
      backgroundColor:
        theme.mode === 'dark' ? theme.colors.overlay : 'rgba(255,255,255,0.66)',
      borderWidth: 1,
      borderColor:
        theme.mode === 'dark'
          ? theme.colors.overlayStrong
          : 'rgba(53, 64, 52, 0.08)',
    },
    filterChipActive: {
      backgroundColor: theme.colors.ink,
    },
    filterLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    filterLabelActive: {
      color: theme.colors.card,
    },
    postsColumn: {
      gap: 20,
      paddingHorizontal: 20,
    },
    stateCard: {
      marginHorizontal: 20,
      borderRadius: 24,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 10,
      alignItems: 'flex-start',
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
      marginTop: 4,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.ink,
    },
    retryLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.card,
      fontSize: 13,
    },
    loadMoreButton: {
      minHeight: 52,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadMoreLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.ink,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.32)',
      justifyContent: 'center',
      padding: 20,
    },
    modalCard: {
      borderRadius: 28,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 18,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontFamily: theme.fonts.serif,
      fontSize: 28,
      color: theme.colors.ink,
    },
    modalTypeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    modalTypeChip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    modalTypeChipActive: {
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    modalTypeLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    modalTypeLabelActive: {
      color: theme.colors.card,
    },
    modalInput: {
      minHeight: 160,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 24,
      color: theme.colors.ink,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    characterCount: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.muted,
    },
    publishButton: {
      minHeight: 48,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.ink,
    },
    publishButtonDisabled: {
      opacity: 0.6,
    },
    publishLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.card,
    },
    composerError: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      lineHeight: 20,
      color: '#A84E3B',
    },
  });
}
