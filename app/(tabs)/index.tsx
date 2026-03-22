import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedComposerCard } from '../../src/components/FeedComposerCard';
import { FeedPostCard } from '../../src/components/FeedPostCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { feedFilters, feedPosts } from '../../src/mock-data';
import { theme } from '../../src/theme';

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.blush, theme.colors.paper, '#F6F0E8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
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
                style={[
                  styles.filterChip,
                  index === 0 && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    index === 0 && styles.filterLabelActive,
                  ]}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    fontSize: 38,
    lineHeight: 42,
    color: theme.colors.ink,
    maxWidth: 260,
  },
  heroCopy: {
    marginTop: 16,
    fontFamily: theme.fonts.sansRegular,
    fontSize: 15,
    lineHeight: 24,
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
    gap: 10,
    paddingTop: 18,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(53, 64, 52, 0.08)',
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
    gap: 16,
    paddingHorizontal: 20,
  },
});
