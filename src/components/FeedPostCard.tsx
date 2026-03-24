import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resolveMediaUrl } from '../lib/api';
import { toPlainTextPreview } from '../posts/markdown';
import { AnimatedPressable } from './AnimatedPressable';
import { MilestoneBadgePill } from './MilestoneBadgePill';
import type { FeedPost, MilestoneBadge, PostType } from '../types/feed';
import type { InteractionType } from '../types/messaging';
import { AppTheme, useTheme } from '../theme';

type FeedPostCardProps = {
  post: FeedPost;
  onActionPress?: (post: FeedPost, type: InteractionType) => void;
  onPress?: (post: FeedPost) => void;
  disabled?: boolean;
  hideActions?: boolean;
  preferredBadgeKind?: MilestoneBadge['kind'];
};

export function FeedPostCard({
  post,
  onActionPress,
  onPress,
  disabled,
  hideActions,
  preferredBadgeKind,
}: FeedPostCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const toneMap: Record<PostType, string> = {
    BUILDING: theme.colors.building,
    LEARNING: theme.colors.learning,
    STRUGGLING: theme.colors.struggling,
  } as const;
  const tone = toneMap[post.type];
  const authorName = post.user.name || post.user.username;
  const handle = `@${post.user.username}`;
  const primaryBadge = selectPrimaryBadge(post.user.badges, preferredBadgeKind);
  const actionMap: Record<PostType, Array<{ label: string; type: InteractionType }>> = {
    BUILDING: [
      { label: 'I can help debug this', type: 'I_CAN_HELP' },
      { label: 'I shipped something similar', type: 'BUILT_SIMILAR' },
    ],
    LEARNING: [
      { label: 'I learned this too', type: 'LEARNED_THIS' },
      { label: 'I can help debug this', type: 'I_CAN_HELP' },
    ],
    STRUGGLING: [
      { label: 'I can help debug this', type: 'I_CAN_HELP' },
      { label: 'I fixed something similar', type: 'BUILT_SIMILAR' },
    ],
  };
  const actions = actionMap[post.type];
  const imageMedia = post.media.filter((item) => item.type === 'IMAGE');
  const nonImageMediaCount = post.media.length - imageMedia.length;

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: tone }]} />
      <Pressable onPress={() => onPress?.(post)} style={styles.pressableContent}>
        <View style={styles.topRow}>
          <View style={[styles.typePill, { backgroundColor: `${tone}18` }]}>
            <Text style={[styles.typeLabel, { color: tone }]}>{formatTypeLabel(post.type)}</Text>
          </View>
          <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
        </View>

        <Text style={styles.content}>{toPlainTextPreview(post.content)}</Text>

        {imageMedia.length > 0 ? (
          <Image
            source={{ uri: resolveMediaUrl(imageMedia[0].url) }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : null}

        {post.media.length > 0 ? (
          <View style={styles.mediaBadge}>
            <Ionicons name="attach-outline" size={14} color={theme.colors.muted} />
            <Text style={styles.mediaBadgeText}>
              {imageMedia.length > 0
                ? `${imageMedia.length} image${imageMedia.length > 1 ? 's' : ''}`
                : `${post.media.length} attachment${post.media.length > 1 ? 's' : ''}`}
              {nonImageMediaCount > 0 ? ` • ${nonImageMediaCount} other` : ''}
            </Text>
          </View>
        ) : null}

        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: tone }]}>
            <Text style={styles.avatarLabel}>{authorName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.authorMeta}>
            <View style={styles.authorTopLine}>
              <Text style={styles.author}>{authorName}</Text>
              {primaryBadge ? <MilestoneBadgePill badge={primaryBadge} compact /> : null}
            </View>
            <Text style={styles.handle}>{handle}</Text>
          </View>
        </View>
      </Pressable>

      {!hideActions ? (
        <View style={styles.actionRow}>
          {actions.map((action) => (
            <AnimatedPressable
              key={action.label}
              style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
              disabled={disabled}
              scaleTo={0.97}
              onPress={() => onActionPress?.(post, action.type)}
            >
              <Ionicons name="arrow-up-circle-outline" size={16} color={tone} />
              <Text style={styles.actionText}>{action.label}</Text>
            </AnimatedPressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function selectPrimaryBadge(
  badges: MilestoneBadge[],
  preferredKind?: MilestoneBadge['kind'],
) {
  if (preferredKind) {
    const matching = badges
      .filter((badge) => badge.kind === preferredKind)
      .sort((a, b) => b.threshold - a.threshold)[0];

    if (matching) {
      return matching;
    }
  }

  return [...badges].sort((a, b) => b.threshold - a.threshold)[0] ?? null;
}

function formatTypeLabel(type: PostType) {
  return type.charAt(0) + type.slice(1).toLowerCase();
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
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: 22,
      backgroundColor: theme.colors.mist,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 18,
      gap: 16,
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
    },
    pressableContent: {
      gap: 16,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    content: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 25,
      color: theme.colors.ink,
    },
    mediaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    mediaBadgeText: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.muted,
    },
    imagePreview: {
      width: '100%',
      height: 210,
      borderRadius: 18,
      backgroundColor: theme.colors.cardMuted,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    authorMeta: {
      flex: 1,
      gap: 4,
    },
    authorTopLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
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
      fontFamily: theme.fonts.sansBold,
      color: theme.colors.ink,
      fontSize: 14,
    },
    handle: {
      fontFamily: theme.fonts.sansRegular,
      color: theme.colors.muted,
      fontSize: 13,
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 9,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: `${theme.colors.line}A0`,
    },
    actionButtonDisabled: {
      opacity: 0.6,
    },
    actionText: {
      fontFamily: theme.fonts.sansMedium,
      color: theme.colors.ink,
      fontSize: 12,
    },
  });
}
