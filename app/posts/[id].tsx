import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { MarkdownComposer } from '../../src/components/MarkdownComposer';
import { api, ApiError, resolveMediaUrl } from '../../src/lib/api';
import {
  createMarkdownRules,
  createMarkdownStyles,
  POST_CONTENT_MAX_LENGTH,
} from '../../src/posts/markdown';
import { usePostMutations } from '../../src/posts/PostMutationsContext';
import type { FeedPost, PostType, UploadableMediaType } from '../../src/types/feed';
import type { ReportReason } from '../../src/types/moderation';
import { AppTheme, useTheme } from '../../src/theme';
import { useToast } from '../../src/toast/ToastContext';

type PendingAttachment = {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  mediaType: UploadableMediaType;
};

export default function PostDetailScreen() {
  const { id, moderate } = useLocalSearchParams<{ id: string; moderate?: string }>();
  const { accessToken, user } = useAuth();
  const { emitPostDeleted, emitPostUpdated } = usePostMutations();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const markdownStyles = useMemo(() => createMarkdownStyles(theme), [theme]);
  const markdownRules = useMemo(() => createMarkdownRules(), []);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editType, setEditType] = useState<PostType>('BUILDING');
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isFlaggingSpam, setIsFlaggingSpam] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{
    stage: 'idle' | 'updating' | 'deleting-media' | 'uploading-media' | 'refreshing';
    current: number;
    total: number;
    label: string;
  }>({
    stage: 'idle',
    current: 0,
    total: 0,
    label: '',
  });

  const loadPost = useCallback(async () => {
    if (!id) {
      setError('Post not found.');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await api.getPost(id);
      setPost(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load post.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const tone = useMemo(() => {
    const toneMap: Record<PostType, string> = {
      BUILDING: theme.colors.building,
      LEARNING: theme.colors.learning,
      STRUGGLING: theme.colors.struggling,
    };

    return post ? toneMap[post.type] : theme.colors.ink;
  }, [post, theme.colors.building, theme.colors.ink, theme.colors.learning, theme.colors.struggling]);

  const isOwner = post?.userId === user?.id;
  const visibleExistingMedia = post?.media.filter(
    (media) => !removedMediaIds.includes(media.id),
  ) ?? [];
  const existingVisualMedia = visibleExistingMedia.filter(
    (media) => media.type === 'IMAGE' || media.type === 'VIDEO',
  );
  const existingFileMedia = visibleExistingMedia.filter(
    (media) => media.type === 'FILE',
  );
  const pendingVisualMedia = pendingAttachments.filter(
    (media) => media.mediaType === 'IMAGE' || media.mediaType === 'VIDEO',
  );
  const pendingFileMedia = pendingAttachments.filter(
    (media) => media.mediaType === 'FILE',
  );

  useEffect(() => {
    if (moderate !== '1' || !post || isOwner) {
      return;
    }

    openModerationModal();
  }, [moderate, post, isOwner]);

  function openEditModal() {
    if (!post) {
      return;
    }

    setEditType(post.type);
    setEditContent(post.content);
    setEditError(null);
    setPendingAttachments([]);
    setRemovedMediaIds([]);
    setIsEditOpen(true);
  }

  function openModerationModal() {
    setReportReason('SPAM');
    setReportDetails('');
    setReportError(null);
    setIsReportOpen(false);
    setIsModerationOpen(true);
  }

  async function handlePickLibraryMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setEditError('Media library permission is required to attach images or videos.');
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
  }

  function removePendingAttachment(id: string) {
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
  }

  function toggleExistingMediaRemoval(mediaId: string) {
    setRemovedMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId],
    );
  }

  async function handleSaveEdit() {
    if (!post || !accessToken) {
      setEditError('You must be logged in to edit this post.');
      return;
    }

    const trimmedContent = editContent.trim();
    if (!trimmedContent) {
      setEditError('Post content is required.');
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      setSaveProgress({
        stage: 'updating',
        current: 0,
        total: 1,
        label: 'Updating post content',
      });
      await api.updatePost(
        post.id,
        {
          type: editType,
          content: trimmedContent,
        },
        accessToken,
      );

      const totalDeleteOps = removedMediaIds.length;
      for (const [index, mediaId] of removedMediaIds.entries()) {
        setSaveProgress({
          stage: 'deleting-media',
          current: index + 1,
          total: totalDeleteOps,
          label: `Removing attachment ${index + 1} of ${totalDeleteOps}`,
        });
        await api.deleteMedia(mediaId, accessToken);
      }

      const totalUploadOps = pendingAttachments.length;
      for (const [index, attachment] of pendingAttachments.entries()) {
        setSaveProgress({
          stage: 'uploading-media',
          current: index + 1,
          total: totalUploadOps,
          label: `Uploading attachment ${index + 1} of ${totalUploadOps}`,
        });
        await api.uploadMedia(
          {
            postId: post.id,
            type: attachment.mediaType,
            file: {
              uri: attachment.uri,
              name: attachment.name,
              mimeType: attachment.mimeType,
            },
          },
          accessToken,
        );
      }

      setSaveProgress({
        stage: 'refreshing',
        current: 1,
        total: 1,
        label: 'Refreshing post',
      });
      const refreshed = await api.getPost(post.id);
      setPost(refreshed);
      emitPostUpdated(refreshed);
      setIsEditOpen(false);
      showToast({
        title: 'Post updated',
        message: 'Your changes are now live.',
        type: 'success',
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to update post.';
      setEditError(message);
      showToast({
        title: 'Update failed',
        message,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setSaveProgress({
        stage: 'idle',
        current: 0,
        total: 0,
        label: '',
      });
    }
  }

  async function handleDelete() {
    if (!post || !accessToken) {
      showToast({
        title: 'Delete unavailable',
        message: 'You must be logged in to delete this post.',
        type: 'error',
      });
      return;
    }

    setIsDeleting(true);

    try {
      await api.deletePost(post.id, accessToken);
      emitPostDeleted(post.id);
      showToast({
        title: 'Post deleted',
        message: 'The post has been removed.',
        type: 'success',
      });
      router.replace('/(tabs)');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete post.';
      showToast({
        title: 'Delete failed',
        message,
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  }

  async function handleFlagSpam() {
    if (!post || !accessToken) {
      showToast({
        title: 'Action unavailable',
        message: 'You need to be logged in to flag spam.',
        type: 'error',
      });
      return;
    }

    setIsFlaggingSpam(true);

    try {
      const response = await api.flagSpam(post.id, accessToken);
      setIsModerationOpen(false);
      showToast({
        title: 'Spam flagged',
        message: response.hiddenFromPublicFeed
          ? 'This post reached the hide threshold.'
          : `Spam flag recorded. ${response.spamFlagCount} total flags.`,
        type: 'success',
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to flag this post as spam.';
      showToast({
        title: 'Spam flag failed',
        message,
        type: 'error',
      });
    } finally {
      setIsFlaggingSpam(false);
    }
  }

  async function handleBlockUser() {
    if (!post || !accessToken) {
      showToast({
        title: 'Action unavailable',
        message: 'You need to be logged in to block this user.',
        type: 'error',
      });
      return;
    }

    setIsBlocking(true);

    try {
      const blocked = await api.blockUser(post.userId, accessToken);
      setIsModerationOpen(false);
      showToast({
        title: 'User blocked',
        message: `You will no longer interact privately with ${blocked.blocked.name || blocked.blocked.username}.`,
        type: 'success',
      });
      router.back();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to block this user.';
      showToast({
        title: 'Block failed',
        message,
        type: 'error',
      });
    } finally {
      setIsBlocking(false);
    }
  }

  async function handleReportPost() {
    if (!post || !accessToken) {
      setReportError('You need to be logged in to report this post.');
      return;
    }

    setIsReporting(true);
    setReportError(null);

    try {
      await api.reportPost(
        {
          postId: post.id,
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        },
        accessToken,
      );
      setIsReportOpen(false);
      setIsModerationOpen(false);
      setReportDetails('');
      showToast({
        title: 'Report submitted',
        message: 'Thanks. We logged this post for moderation review.',
        type: 'success',
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to report this post.';
      setReportError(message);
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>View Post</Text>
        {isOwner ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={openEditModal}>
              <Ionicons name="create-outline" size={18} color={theme.colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setIsDeleteConfirmOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={theme.colors.ink} />
              ) : (
                <Ionicons name="trash-outline" size={18} color={theme.colors.ink} />
              )}
            </TouchableOpacity>
          </View>
        ) : post ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={openModerationModal}>
              <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.ink} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="small" color={theme.colors.ink} />
          <Text style={styles.stateText}>Loading post…</Text>
        </View>
      ) : error || !post ? (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Post unavailable</Text>
          <Text style={styles.stateText}>{error || 'This post could not be found.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={[styles.typePill, { backgroundColor: `${tone}18` }]}>
                <Text style={[styles.typeLabel, { color: tone }]}>
                  {formatTypeLabel(post.type)}
                </Text>
              </View>
              <Text style={styles.time}>{formatFullTimestamp(post.createdAt)}</Text>
            </View>

            <Markdown style={markdownStyles} rules={markdownRules}>
              {post.content}
            </Markdown>

            {post.media.map((media) =>
              media.type === 'IMAGE' ? (
                <Image
                  key={media.id}
                  source={{ uri: resolveMediaUrl(media.url) }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View key={media.id} style={styles.mediaItem}>
                  <Ionicons name="attach-outline" size={16} color={theme.colors.muted} />
                  <View style={styles.mediaItemCopy}>
                    <Text style={styles.mediaItemTitle}>{media.type}</Text>
                    <Text style={styles.mediaItemUrl} numberOfLines={1}>
                      {media.url}
                    </Text>
                  </View>
                </View>
              ),
            )}

            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: tone }]}>
                <Text style={styles.avatarLabel}>
                  {(post.user.name || post.user.username).slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.author}>{post.user.name || post.user.username}</Text>
                <Text style={styles.handle}>@{post.user.username}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={isEditOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Post</Text>
              <Pressable onPress={() => setIsEditOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.ink} />
              </Pressable>
            </View>

            <View style={styles.typeRow}>
              {(['BUILDING', 'LEARNING', 'STRUGGLING'] as PostType[]).map((type) => {
                const active = editType === type;

                return (
                  <Pressable
                    key={type}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => setEditType(type)}
                  >
                    <Text
                      style={[styles.typeChipLabel, active && styles.typeChipLabelActive]}
                    >
                      {formatTypeLabel(type)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <MarkdownComposer
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Update your post"
              maxLength={POST_CONTENT_MAX_LENGTH}
              minHeight={220}
              editable={!isSaving}
              error={editError}
              onErrorClear={() => setEditError(null)}
            />

            <View style={styles.attachmentActions}>
              <TouchableOpacity
                style={styles.attachmentPickerButton}
                onPress={handlePickLibraryMedia}
                disabled={isSaving}
              >
                <Ionicons name="images-outline" size={16} color={theme.colors.ink} />
                <Text style={styles.attachmentPickerLabel}>Photo or Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentPickerButton}
                onPress={handlePickDocument}
                disabled={isSaving}
              >
                <Ionicons name="document-outline" size={16} color={theme.colors.ink} />
                <Text style={styles.attachmentPickerLabel}>File</Text>
              </TouchableOpacity>
            </View>

            {existingVisualMedia.length > 0 ? (
              <View style={styles.visualMediaSection}>
                <Text style={styles.mediaSectionLabel}>Current media</Text>
                <View style={styles.visualMediaGrid}>
                  {existingVisualMedia.map((media) => (
                    <View key={media.id} style={styles.visualMediaTile}>
                      <Image
                        source={{ uri: resolveMediaUrl(media.url) }}
                        style={styles.visualMediaImage}
                        resizeMode="cover"
                      />
                      <View style={styles.visualMediaBadge}>
                        <Text style={styles.visualMediaBadgeLabel}>{media.type}</Text>
                      </View>
                      <Pressable
                        style={styles.visualMediaRemove}
                        onPress={() => toggleExistingMediaRemoval(media.id)}
                      >
                        <Ionicons name="close" size={14} color={theme.colors.card} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {pendingVisualMedia.length > 0 ? (
              <View style={styles.visualMediaSection}>
                <Text style={styles.mediaSectionLabel}>New media</Text>
                <View style={styles.visualMediaGrid}>
                  {pendingVisualMedia.map((attachment) => (
                    <View key={attachment.id} style={styles.visualMediaTile}>
                      {attachment.mediaType === 'IMAGE' ? (
                        <Image
                          source={{ uri: attachment.uri }}
                          style={styles.visualMediaImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.videoPlaceholder}>
                          <Ionicons name="videocam" size={28} color={theme.colors.card} />
                        </View>
                      )}
                      <View style={styles.visualMediaBadge}>
                        <Text style={styles.visualMediaBadgeLabel}>{attachment.mediaType}</Text>
                      </View>
                      <Pressable
                        style={styles.visualMediaRemove}
                        onPress={() => removePendingAttachment(attachment.id)}
                      >
                        <Ionicons name="close" size={14} color={theme.colors.card} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {existingFileMedia.length > 0 ? (
              <View style={styles.mediaList}>
                {existingFileMedia.map((media) => (
                  <View key={media.id} style={styles.editMediaItem}>
                    <View style={styles.editMediaCopy}>
                      <Text style={styles.editMediaTitle}>{media.type}</Text>
                      <Text style={styles.editMediaSubtitle} numberOfLines={1}>
                        {media.url}
                      </Text>
                    </View>
                    <Pressable onPress={() => toggleExistingMediaRemoval(media.id)}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.muted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {pendingFileMedia.length > 0 ? (
              <View style={styles.mediaList}>
                {pendingFileMedia.map((attachment) => (
                  <View key={attachment.id} style={styles.editMediaItem}>
                    <View style={styles.editMediaCopy}>
                      <Text style={styles.editMediaTitle}>{attachment.mediaType}</Text>
                      <Text style={styles.editMediaSubtitle} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                    </View>
                    <Pressable onPress={() => removePendingAttachment(attachment.id)}>
                      <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {isSaving ? (
              <View style={styles.progressCard}>
                <View style={styles.progressTopRow}>
                  <ActivityIndicator size="small" color={theme.colors.ink} />
                  <Text style={styles.progressTitle}>Saving changes</Text>
                </View>
                <Text style={styles.progressLabel}>{saveProgress.label}</Text>
                {saveProgress.total > 1 ? (
                  <Text style={styles.progressCount}>
                    {saveProgress.current}/{saveProgress.total}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, (!editContent.trim() || isSaving) && styles.saveButtonDisabled]}
                disabled={!editContent.trim() || isSaving}
                onPress={handleSaveEdit}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={theme.colors.card} />
                ) : (
                  <Text style={styles.saveLabel}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isDeleteConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete this post?</Text>
            <Text style={styles.confirmText}>
              This will remove the post and its attachments. This action cannot be undone.
            </Text>
            {isDeleting ? (
              <View style={styles.progressCard}>
                <View style={styles.progressTopRow}>
                  <ActivityIndicator size="small" color={theme.colors.ink} />
                  <Text style={styles.progressTitle}>Deleting post</Text>
                </View>
                <Text style={styles.progressLabel}>Removing post and attachments</Text>
              </View>
            ) : null}
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={theme.colors.card} />
                ) : (
                  <Text style={styles.deleteLabel}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isModerationOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isBlocking && !isFlaggingSpam && !isReporting) {
            setIsModerationOpen(false);
            setIsReportOpen(false);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            {!isReportOpen ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.confirmTitle}>Post actions</Text>
                  <Pressable onPress={() => setIsModerationOpen(false)}>
                    <Ionicons name="close" size={22} color={theme.colors.ink} />
                  </Pressable>
                </View>
                <Text style={styles.confirmText}>
                  Keep the developer feed useful by reporting bad posts or blocking users you do not want to interact with.
                </Text>

                <View style={styles.moderationActions}>
                  <TouchableOpacity
                    style={styles.moderationAction}
                    onPress={() => {
                      setReportError(null);
                      setIsReportOpen(true);
                    }}
                  >
                    <View
                      style={[
                        styles.moderationIconWrap,
                        { backgroundColor: `${theme.colors.accentBlue}16` },
                      ]}
                    >
                      <Ionicons name="flag-outline" size={18} color={theme.colors.accentBlue} />
                    </View>
                    <View style={styles.moderationCopy}>
                      <Text style={styles.moderationTitle}>Report post</Text>
                      <Text style={styles.moderationSubtitle}>
                        Send this post to moderation review.
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.moderationAction}
                    onPress={handleFlagSpam}
                    disabled={isFlaggingSpam}
                  >
                    <View
                      style={[
                        styles.moderationIconWrap,
                        { backgroundColor: `${theme.colors.struggling}16` },
                      ]}
                    >
                      {isFlaggingSpam ? (
                        <ActivityIndicator size="small" color={theme.colors.struggling} />
                      ) : (
                        <Ionicons
                          name="alert-circle-outline"
                          size={18}
                          color={theme.colors.struggling}
                        />
                      )}
                    </View>
                    <View style={styles.moderationCopy}>
                      <Text style={styles.moderationTitle}>Flag spam</Text>
                      <Text style={styles.moderationSubtitle}>
                        Mark this post as spam or repeated junk.
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.moderationAction}
                    onPress={handleBlockUser}
                    disabled={isBlocking}
                  >
                    <View
                      style={[
                        styles.moderationIconWrap,
                        { backgroundColor: `${theme.colors.ink}10` },
                      ]}
                    >
                      {isBlocking ? (
                        <ActivityIndicator size="small" color={theme.colors.ink} />
                      ) : (
                        <Ionicons name="ban-outline" size={18} color={theme.colors.ink} />
                      )}
                    </View>
                    <View style={styles.moderationCopy}>
                      <Text style={styles.moderationTitle}>Block user</Text>
                      <Text style={styles.moderationSubtitle}>
                        Stop private interactions with @{post?.user.username ?? 'this user'}.
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Pressable
                    style={styles.inlineBackButton}
                    onPress={() => {
                      setIsReportOpen(false);
                      setReportError(null);
                    }}
                  >
                    <Ionicons name="chevron-back" size={18} color={theme.colors.ink} />
                  </Pressable>
                  <Text style={styles.confirmTitle}>Report post</Text>
                  <Pressable onPress={() => setIsModerationOpen(false)}>
                    <Ionicons name="close" size={22} color={theme.colors.ink} />
                  </Pressable>
                </View>
                <Text style={styles.confirmText}>
                  Choose the main reason. Add a note only if it helps moderation review faster.
                </Text>

                <View style={styles.reasonGrid}>
                  {(
                    [
                      { value: 'SPAM', label: 'Spam' },
                      { value: 'HARASSMENT', label: 'Harassment' },
                      { value: 'INAPPROPRIATE', label: 'Inappropriate' },
                      { value: 'MISLEADING', label: 'Misleading' },
                      { value: 'OTHER', label: 'Other' },
                    ] as Array<{ value: ReportReason; label: string }>
                  ).map((reason) => {
                    const active = reportReason === reason.value;

                    return (
                      <Pressable
                        key={reason.value}
                        style={[styles.reasonChip, active && styles.reasonChipActive]}
                        onPress={() => setReportReason(reason.value)}
                      >
                        <Text
                          style={[
                            styles.reasonChipLabel,
                            active && styles.reasonChipLabelActive,
                          ]}
                        >
                          {reason.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.reportInputWrap}>
                  <TextInput
                    value={reportDetails}
                    onChangeText={setReportDetails}
                    placeholder="Optional details"
                    placeholderTextColor={theme.colors.muted}
                    multiline
                    maxLength={500}
                    style={styles.reportInput}
                    textAlignVertical="top"
                  />
                  <Text style={styles.reportCount}>{reportDetails.length}/500</Text>
                </View>

                {reportError ? <Text style={styles.reportError}>{reportError}</Text> : null}

                <View style={styles.confirmActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsReportOpen(false);
                      setReportError(null);
                    }}
                    disabled={isReporting}
                  >
                    <Text style={styles.cancelLabel}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, isReporting && styles.deleteButtonDisabled]}
                    onPress={handleReportPost}
                    disabled={isReporting}
                  >
                    {isReporting ? (
                      <ActivityIndicator size="small" color={theme.colors.card} />
                    ) : (
                      <Text style={styles.deleteLabel}>Submit report</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatTypeLabel(type: PostType) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function formatFullTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.paper,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    headerActions: {
      marginLeft: 'auto',
      flexDirection: 'row',
      gap: 10,
    },
    backButton: {
      height: 40,
      width: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    headerActionButton: {
      height: 40,
      width: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    headerTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 16,
      color: theme.colors.ink,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    state: {
      flex: 1,
      padding: 24,
      gap: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stateTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 16,
      color: theme.colors.ink,
    },
    stateText: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.muted,
      textAlign: 'center',
    },
    card: {
      borderRadius: 28,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 18,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    typePill: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: `${theme.colors.line}90`,
    },
    typeLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    time: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 12,
      color: theme.colors.muted,
    },
    image: {
      width: '100%',
      height: 260,
      borderRadius: 20,
      backgroundColor: theme.colors.cardMuted,
    },
    mediaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 18,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    mediaItemCopy: {
      flex: 1,
      gap: 2,
    },
    mediaItemTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 13,
      color: theme.colors.ink,
    },
    mediaItemUrl: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 12,
      color: theme.colors.muted,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      height: 42,
      width: 42,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLabel: {
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.card,
      fontSize: 16,
    },
    author: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 14,
      color: theme.colors.ink,
    },
    handle: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 13,
      color: theme.colors.muted,
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
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    typeChip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    typeChipActive: {
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    typeChipLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    typeChipLabelActive: {
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
    mediaList: {
      gap: 8,
    },
    visualMediaSection: {
      gap: 10,
    },
    mediaSectionLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: theme.colors.muted,
    },
    visualMediaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    visualMediaTile: {
      width: 98,
      height: 98,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
      position: 'relative',
    },
    visualMediaImage: {
      width: '100%',
      height: '100%',
    },
    videoPlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.night,
    },
    visualMediaBadge: {
      position: 'absolute',
      left: 8,
      bottom: 8,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    visualMediaBadgeLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.colors.card,
    },
    visualMediaRemove: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    editMediaItem: {
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
    editMediaCopy: {
      flex: 1,
      gap: 2,
    },
    editMediaTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 13,
      color: theme.colors.ink,
    },
    editMediaSubtitle: {
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
    saveButton: {
      minHeight: 48,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.ink,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.card,
    },
    progressCard: {
      borderRadius: 18,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
    },
    progressTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progressTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 13,
      color: theme.colors.ink,
    },
    progressLabel: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 12,
      lineHeight: 19,
      color: theme.colors.muted,
    },
    progressCount: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.muted,
    },
    confirmCard: {
      borderRadius: 28,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 14,
    },
    confirmTitle: {
      fontFamily: theme.fonts.serif,
      fontSize: 28,
      color: theme.colors.ink,
    },
    confirmText: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 23,
      color: theme.colors.muted,
    },
    confirmActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 6,
    },
    moderationActions: {
      gap: 10,
    },
    moderationAction: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    moderationIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moderationCopy: {
      flex: 1,
      gap: 2,
    },
    moderationTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.ink,
    },
    moderationSubtitle: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.muted,
    },
    inlineBackButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    reasonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    reasonChip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    reasonChipActive: {
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    reasonChipLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    reasonChipLabelActive: {
      color: theme.colors.card,
    },
    reportInputWrap: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 10,
      gap: 8,
    },
    reportInput: {
      minHeight: 110,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.ink,
    },
    reportCount: {
      alignSelf: 'flex-end',
      fontFamily: theme.fonts.sansRegular,
      fontSize: 12,
      color: theme.colors.muted,
    },
    reportError: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.struggling,
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
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.ink,
    },
    deleteButton: {
      minHeight: 46,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#A84E3B',
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    deleteLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.card,
    },
  });
}
