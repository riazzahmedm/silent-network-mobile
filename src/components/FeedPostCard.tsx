import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme, useTheme } from '../theme';

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

export function FeedPostCard({ post }: FeedPostCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const toneMap = {
    building: theme.colors.building,
    learning: theme.colors.learning,
    struggling: theme.colors.struggling,
  } as const;
  const tone = toneMap[post.accent];

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
    actionText: {
      fontFamily: theme.fonts.sansMedium,
      color: theme.colors.ink,
      fontSize: 12,
    },
  });
}
