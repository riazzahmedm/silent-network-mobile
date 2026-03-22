import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConversationPreviewCard } from '../../src/components/ConversationPreviewCard';
import { inboxThreads } from '../../src/mock-data';
import { AppTheme, useTheme } from '../../src/theme';

export default function InboxScreen() {
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
          <Text style={styles.eyebrow}>Inbox</Text>
          <Text style={styles.title}>Quiet conversations, started by useful intent.</Text>
          <Text style={styles.copy}>
            Interactions like “I can help” open direct threads. No public comment theater.
          </Text>
        </LinearGradient>

        <View style={styles.threadColumn}>
          {inboxThreads.map((thread) => (
            <ConversationPreviewCard key={thread.id} thread={thread} />
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
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 120,
    },
    hero: {
      borderRadius: 28,
      padding: 22,
    },
    eyebrow: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.colors.amber,
      marginBottom: 8,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 34,
      lineHeight: 39,
      color: theme.colors.ink,
      marginBottom: 10,
    },
    copy: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 24,
      color: theme.colors.muted,
      maxWidth: 330,
    },
    threadColumn: {
      gap: 14,
      marginTop: 24,
    },
  });
}
