import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FeedPost, PostType } from '../types/feed';
import type { InteractionType } from '../types/messaging';
import { AppTheme, useTheme } from '../theme';

type FeedPostCardProps = {
  post: FeedPost;
  onActionPress?: (post: FeedPost, type: InteractionType) => void;
  disabled?: boolean;
  hideActions?: boolean;
};

export function FeedPostCard({
  post,
  onActionPress,
  disabled,
  hideActions,
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
  const actionMap: Record<PostType, Array<{ label: string; type: InteractionType }>> = {
    BUILDING: [
      { label: 'I can help', type: 'I_CAN_HELP' },
      { label: 'Built something similar', type: 'BUILT_SIMILAR' },
    ],
    LEARNING: [
      { label: 'Learned this too', type: 'LEARNED_THIS' },
      { label: 'I can help', type: 'I_CAN_HELP' },
    ],
    STRUGGLING: [
      { label: 'I can help', type: 'I_CAN_HELP' },
      { label: 'Built something similar', type: 'BUILT_SIMILAR' },
    ],
  };
  const actions = actionMap[post.type];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGlow}
      />
      <View style={styles.topRow}>
        <View style={[styles.typePill, { backgroundColor: `${tone}18` }]}>
          <Text style={[styles.typeLabel, { color: tone }]}>{formatTypeLabel(post.type)}</Text>
        </View>
        <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.media.length > 0 ? (
        <View style={styles.mediaBadge}>
          <Ionicons name="attach-outline" size={14} color={theme.colors.muted} />
          <Text style={styles.mediaBadgeText}>
            {post.media.length} attachment{post.media.length > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      <View style={styles.authorRow}>
        <View style={[styles.avatar, { backgroundColor: tone }]}>
          <Text style={styles.avatarLabel}>{authorName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.author}>{authorName}</Text>
          <Text style={styles.handle}>{handle}</Text>
        </View>
      </View>

      {!hideActions ? (
        <View style={styles.actionRow}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
              disabled={disabled}
              onPress={() => onActionPress?.(post, action.type)}
            >
              <Ionicons name="arrow-up-circle-outline" size={16} color={tone} />
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
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
      borderRadius: 28,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      padding: 22,
      gap: 18,
      overflow: 'hidden',
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 28,
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
      lineHeight: 27,
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
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
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
