import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedComposerCard } from '../../src/components/FeedComposerCard';
import { FeedPostCard } from '../../src/components/FeedPostCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { feedFilters, feedPosts } from '../../src/mock-data';
import { AppTheme, useTheme } from '../../src/theme';

export default function FeedScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={styles.composeButton}>
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
            {feedFilters.map((filter, index) => (
              <View
                key={filter.label}
                style={[styles.filterChip, index === 0 && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterLabel, index === 0 && styles.filterLabelActive]}
                >
                  {filter.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>

        <FeedComposerCard />

        <SectionHeading
          eyebrow="Today"
          title="Builders sharing the actual work"
          detail="Private responses turn posts into conversations, not performances."
        />

        <View style={styles.postsColumn}>
          {feedPosts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
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
  });
}
