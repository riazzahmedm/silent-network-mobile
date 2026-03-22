import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

type AccentTone = 'building' | 'learning' | 'struggling';

type FeedPost = {
  id: string;
  type: string;
  author: string;
  handle: string;
  postedAt: string;
  content: string;
  accent: AccentTone;
  actions: string[];
};

type FeedPostCardProps = {
  post: FeedPost;
};

const toneMap = {
  building: theme.colors.building,
  learning: theme.colors.learning,
  struggling: theme.colors.struggling,
} as const;

export function FeedPostCard({ post }: FeedPostCardProps) {
  const tone = toneMap[post.accent];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.typePill, { backgroundColor: `${tone}18` }]}>
          <Text style={[styles.typeLabel, { color: tone }]}>{post.type}</Text>
        </View>
        <Text style={styles.time}>{post.postedAt}</Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.authorRow}>
        <View style={[styles.avatar, { backgroundColor: tone }]}>
          <Text style={styles.avatarLabel}>{post.author.slice(0, 1)}</Text>
        </View>
        <View>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.handle}>{post.handle}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {post.actions.map((action) => (
          <TouchableOpacity key={action} style={styles.actionButton}>
            <Ionicons name="arrow-up-circle-outline" size={16} color={tone} />
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
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
    paddingVertical: 8,
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
    lineHeight: 24,
    color: theme.colors.ink,
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
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FBF8F3',
  },
  actionText: {
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.ink,
    fontSize: 12,
  },
});
