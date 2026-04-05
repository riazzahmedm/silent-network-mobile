import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
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
import { AnimatedEntrance } from '../../src/components/AnimatedEntrance';
import { AnimatedPressable } from '../../src/components/AnimatedPressable';
import { FeedPostCard } from '../../src/components/FeedPostCard';
import { MarkdownComposer } from '../../src/components/MarkdownComposer';
import { api, ApiError } from '../../src/lib/api';
import { POST_CONTENT_MAX_LENGTH } from '../../src/posts/markdown';
import { usePostMutations } from '../../src/posts/PostMutationsContext';
import { layout } from '../../src/ui/layout';
import type { FeedPost, PostType, UploadableMediaType } from '../../src/types/feed';
import type { InteractionType } from '../../src/types/messaging';
import { AppTheme, useTheme } from '../../src/theme';
import { useToast } from '../../src/toast/ToastContext';

type PendingAttachment = {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  mediaType: UploadableMediaType;
};

export default function FeedScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<{ compose?: string; type?: PostType }>();
  const { accessToken, user } = useAuth();
  const { lastMutation } = usePostMutations();
  const { showToast } = useToast();
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
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [activeInteractionPostId, setActiveInteractionPostId] = useState<string | null>(null);

  const filters = useMemo(
    () => [
      { label: 'All Dev Logs', value: undefined },
      { label: 'Building', value: 'BUILDING' as PostType },
      { label: 'Learning', value: 'LEARNING' as PostType },
      { label: 'Debugging', value: 'STRUGGLING' as PostType },
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

  useEffect(() => {
    if (params.compose !== '1') {
      return;
    }

    openComposer(params.type);
    router.replace('/(tabs)/feed');
  }, [params.compose, params.type]);

  useEffect(() => {
    if (!lastMutation) {
      return;
    }

    setPosts((current) => {
      if (lastMutation.kind === 'deleted') {
        return current.filter((post) => post.id !== lastMutation.postId);
      }

      return current.flatMap((post) => {
        if (post.id !== lastMutation.post.id) {
          return [post];
        }

        if (selectedType && lastMutation.post.type !== selectedType) {
          return [];
        }

        return [lastMutation.post];
      });
    });
  }, [lastMutation, selectedType]);

  function openComposer(type?: PostType) {
    setComposerType(type ?? selectedType ?? 'BUILDING');
    setComposerContent('');
    setComposerError(null);
    setPendingAttachments([]);
    setIsComposerOpen(true);
  }

  async function handlePickLibraryMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setComposerError('Media library permission is required to attach images or videos.');
      showToast({
        title: 'Permission required',
        message: 'Allow photo library access to attach images or videos.',
        type: 'error',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const nextAttachments: PendingAttachment[] = result.assets
      .filter((asset) => asset.uri && asset.mimeType)
      .map((asset, index) => ({
        id: `${asset.assetId ?? asset.uri}-${index}`,
        uri: asset.uri,
        name: asset.fileName || `media-${Date.now()}-${index}`,
        mimeType: asset.mimeType || 'application/octet-stream',
        mediaType: asset.type === 'video' ? 'VIDEO' : 'IMAGE',
      }));

    setPendingAttachments((current) => [...current, ...nextAttachments]);
    setComposerError(null);
  }

  async function handlePickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const nextAttachments: PendingAttachment[] = result.assets
      .filter((asset) => asset.uri && asset.mimeType)
      .map((asset, index) => ({
        id: `${asset.uri}-${index}`,
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        mediaType: 'FILE',
      }));

    setPendingAttachments((current) => [...current, ...nextAttachments]);
    setComposerError(null);
  }

  function removePendingAttachment(id: string) {
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function handleSubmitPost() {
    if (!accessToken) {
      setComposerError('You must be logged in to post.');
      showToast({
        title: 'Login required',
        message: 'Sign in to publish a dev log.',
        type: 'error',
      });
      return;
    }

    const trimmedContent = composerContent.trim();
    if (!trimmedContent) {
      setComposerError('Write a developer update.');
      return;
    }

    setIsSubmitting(true);
    setComposerError(null);

    try {
      const createdPost = await api.createPost(
        {
          type: composerType,
          content: trimmedContent,
        },
        accessToken,
      );

      let uploadedCount = 0;
      for (const attachment of pendingAttachments) {
        await api.uploadMedia(
          {
            postId: createdPost.id,
            type: attachment.mediaType,
            file: {
              uri: attachment.uri,
              name: attachment.name,
              mimeType: attachment.mimeType,
            },
          },
          accessToken,
        );
        uploadedCount += 1;
      }

      setIsComposerOpen(false);
      setComposerContent('');
      setPendingAttachments([]);
      showToast({
        title: 'Signal published',
        message:
          uploadedCount > 0
            ? `Your update and ${uploadedCount} attachment${uploadedCount > 1 ? 's are' : ' is'} now in the feed.`
            : 'Your update is now in the feed.',
        type: 'success',
      });
      await loadFeed({ refresh: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to publish post.';
      setComposerError(message);
      showToast({
        title: 'Publish failed',
        message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleInteraction(post: FeedPost, type: InteractionType) {
    if (!accessToken) {
      setInteractionError('You must be logged in to respond privately.');
      showToast({
        title: 'Login required',
        message: 'Sign in to start a private conversation.',
        type: 'error',
      });
      return;
    }

    setActiveInteractionPostId(post.id);
    setInteractionError(null);

    try {
      const response = await api.createInteraction(
        {
          postId: post.id,
          type,
        },
        accessToken,
      );
      router.push(`/${'conversations'}/${response.conversation.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to open the private conversation.';
      setInteractionError(message);
      showToast({
        title: 'Conversation failed',
        message,
        type: 'error',
      });
    } finally {
      setActiveInteractionPostId(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 34 },
        ]}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadFeed({ refresh: true })}
            tintColor={theme.colors.ink}
          />
        }
      >
        <AnimatedEntrance delay={20}>
          <View style={styles.headerIntro}>
          <Text style={styles.eyebrow}>Feed</Text>
          <Text style={styles.headerTitle}>Developer feed</Text>
          <Text style={styles.headerDetail}>
            Real shipping notes, learnings, and debugging updates from developers.
          </Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={60}>
          <View style={styles.stickyBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickyRail}
          >
            {filters.map((filter) => {
              const isActive = filter.value === selectedType || (!filter.value && !selectedType);

              return (
                <AnimatedPressable
                  key={filter.label}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  scaleTo={0.97}
                  onPress={() => setSelectedType(filter.value)}
                >
                  <Text
                    style={[styles.filterLabel, isActive && styles.filterLabelActive]}
                  >
                    {filter.label}
                  </Text>
                </AnimatedPressable>
              );
            })}

            <AnimatedPressable
              style={styles.composeButton}
              scaleTo={0.97}
              onPress={() => openComposer()}
            >
              <Ionicons name="add" color={theme.colors.card} size={16} />
              <Text style={styles.composeButtonLabel}>New</Text>
            </AnimatedPressable>
          </ScrollView>
          </View>
        </AnimatedEntrance>

        {interactionError ? (
          <View style={styles.inlineErrorCard}>
            <Text style={styles.inlineErrorText}>{interactionError}</Text>
          </View>
        ) : null}

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
              Switch the filter or publish the first dev log.
            </Text>
          </View>
        ) : (
          <View style={styles.postsColumn}>
            {posts.map((post) => (
              <AnimatedEntrance key={post.id} delay={80}>
                <FeedPostCard
                  post={post}
                  preferredBadgeKind={selectedType}
                  onPress={(selectedPost) => router.push(`/${'posts'}/${selectedPost.id}`)}
                  onModerationPress={(selectedPost) =>
                    router.push({
                      pathname: '/posts/[id]',
                      params: {
                        id: selectedPost.id,
                        moderate: '1',
                      },
                    })
                  }
                  onActionPress={handleInteraction}
                  disabled={activeInteractionPostId === post.id}
                  hideActions={post.userId === user?.id}
                  showModerationAction={post.userId !== user?.id}
                />
              </AnimatedEntrance>
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
              <Text style={styles.modalTitle}>Share a dev log</Text>
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

            <MarkdownComposer
              value={composerContent}
              onChangeText={setComposerContent}
              placeholder="What are you shipping, learning, or debugging today?"
              maxLength={POST_CONTENT_MAX_LENGTH}
              minHeight={190}
              error={composerError}
              onErrorClear={() => setComposerError(null)}
            />

            <View style={styles.attachmentActions}>
              <TouchableOpacity
                style={styles.attachmentPickerButton}
                onPress={handlePickLibraryMedia}
                disabled={isSubmitting}
              >
                <Ionicons name="images-outline" size={16} color={theme.colors.ink} />
                <Text style={styles.attachmentPickerLabel}>Screenshot or Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentPickerButton}
                onPress={handlePickDocument}
                disabled={isSubmitting}
              >
                <Ionicons name="document-outline" size={16} color={theme.colors.ink} />
                <Text style={styles.attachmentPickerLabel}>File</Text>
              </TouchableOpacity>
            </View>

            {pendingAttachments.length > 0 ? (
              <View style={styles.attachmentList}>
                {pendingAttachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <View style={styles.attachmentItemCopy}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentMeta}>{attachment.mediaType}</Text>
                    </View>
                    <Pressable onPress={() => removePendingAttachment(attachment.id)}>
                      <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.modalFooter}>
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
      paddingTop: 10,
    },
    headerIntro: {
      marginHorizontal: layout.screenPadding,
      paddingHorizontal: 2,
      paddingTop: layout.itemGap,
      paddingBottom: layout.itemGap,
      marginBottom: layout.itemGap,
    },
    stickyBar: {
      marginHorizontal: layout.screenPadding,
      marginBottom: 6,
      borderRadius: layout.radiusCard - 2,
      backgroundColor:
        theme.mode === 'dark' ? 'rgba(26, 34, 43, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      borderWidth: 1,
      borderColor: theme.colors.line,
      paddingHorizontal: 12,
      paddingVertical: 10,
      zIndex: 10,
      shadowColor: theme.colors.ink,
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 10,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.moss,
      marginBottom: 6,
    },
    headerTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 26,
      lineHeight: 30,
      letterSpacing: -0.4,
      color: theme.colors.ink,
    },
    headerDetail: {
      marginTop: 8,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 23,
      color: theme.colors.muted,
      maxWidth: 320,
    },
    stickyRail: {
      gap: 8,
      alignItems: 'center',
      paddingRight: 4,
    },
    composeButton: {
      minHeight: 38,
      borderRadius: 14,
      backgroundColor: theme.colors.ink,
      paddingHorizontal: 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
      shadowColor: theme.colors.ink,
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    composeButtonLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 12,
      color: theme.colors.card,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        theme.mode === 'dark' ? theme.colors.overlay : theme.colors.cardMuted,
      borderWidth: 1,
      borderColor:
        theme.mode === 'dark'
          ? theme.colors.overlayStrong
          : theme.colors.line,
    },
    filterChipActive: {
      backgroundColor: theme.colors.ink,
    },
    filterLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 11,
      color: theme.colors.ink,
    },
    filterLabelActive: {
      color: theme.colors.card,
    },
    postsColumn: {
      gap: layout.sectionGap,
      paddingHorizontal: layout.screenPadding,
      paddingTop: 10,
    },
    stateCard: {
      marginHorizontal: layout.screenPadding,
      borderRadius: layout.radiusCard + 2,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: layout.modalPadding,
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
    inlineErrorCard: {
      marginHorizontal: layout.screenPadding,
      borderRadius: layout.radiusTile,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: '#D7B4A8',
    },
    inlineErrorText: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      lineHeight: 20,
      color: '#A84E3B',
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
      borderRadius: layout.radiusTile,
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
      borderRadius: layout.radiusModal,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: layout.modalPadding,
      gap: layout.sectionGap,
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
    attachmentActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    attachmentPickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    attachmentPickerLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    attachmentList: {
      gap: 8,
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderRadius: 16,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    attachmentItemCopy: {
      flex: 1,
      gap: 2,
    },
    attachmentName: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    attachmentMeta: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 12,
      color: theme.colors.muted,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 16,
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
  });
}
