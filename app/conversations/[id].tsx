import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { api, ApiError } from '../../src/lib/api';
import type { ConversationThread } from '../../src/types/messaging';
import { AppTheme, useTheme } from '../../src/theme';
import { useToast } from '../../src/toast/ToastContext';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [thread, setThread] = useState<ConversationThread | null>(null);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThread = useCallback(async () => {
    if (!accessToken || !id) {
      setError('Conversation unavailable.');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await api.getConversation(id, accessToken);
      setThread(response);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load conversation.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const otherParticipant = useMemo(() => {
    return (
      thread?.participants.find((participant) => participant.id !== user?.id) ??
      thread?.participants[0] ??
      null
    );
  }, [thread?.participants, user?.id]);

  async function handleSend() {
    if (!accessToken || !id) {
      return;
    }

    const trimmedDraft = draft.trim();
    if (!trimmedDraft) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const message = await api.sendMessage(id, trimmedDraft, accessToken);
      setThread((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, message],
            }
          : current,
      );
      setDraft('');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to send message.';
      setError(message);
      showToast({
        title: 'Message failed',
        message,
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>
              {otherParticipant?.name || otherParticipant?.username || 'Conversation'}
            </Text>
            <Text style={styles.headerSubtitle}>
              @{otherParticipant?.username || 'message'}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator size="small" color={theme.colors.ink} />
            <Text style={styles.stateText}>Loading conversation…</Text>
          </View>
        ) : error && !thread ? (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>Conversation unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.messages}
              showsVerticalScrollIndicator={false}
            >
              {thread?.messages.map((message) => {
                const isMine = message.senderId === user?.id;

                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      isMine ? styles.myMessageBubble : styles.theirMessageBubble,
                    ]}
                  >
                    <Text style={styles.messageSender}>
                      {message.sender.name || message.sender.username}
                    </Text>
                    <Text style={styles.messageContent}>{message.content}</Text>
                    <Text style={styles.messageTime}>
                      {formatTimestamp(message.createdAt)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.composer}>
              {error ? <Text style={styles.inlineError}>{error}</Text> : null}
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a private reply"
                placeholderTextColor={theme.mode === 'dark' ? '#8E8A84' : '#8C968E'}
                style={styles.input}
                multiline
                textAlignVertical="top"
              />
              <Pressable
                style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
                disabled={!draft.trim() || isSending}
                onPress={handleSend}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={theme.colors.card} />
                ) : (
                  <Text style={styles.sendLabel}>Send</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], {
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
    keyboard: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.line,
      backgroundColor: theme.colors.paper,
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
    headerCopy: {
      gap: 2,
    },
    headerTitle: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 16,
      color: theme.colors.ink,
    },
    headerSubtitle: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 13,
      color: theme.colors.muted,
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
    messages: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 12,
    },
    messageBubble: {
      maxWidth: '86%',
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 6,
      borderWidth: 1,
    },
    myMessageBubble: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    theirMessageBubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.line,
    },
    messageSender: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 12,
      color: theme.colors.muted,
    },
    messageContent: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.ink,
    },
    messageTime: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 11,
      color: theme.colors.muted,
    },
    composer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.line,
      backgroundColor: theme.colors.paper,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
      gap: 10,
    },
    inlineError: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      lineHeight: 20,
      color: '#A84E3B',
    },
    input: {
      minHeight: 92,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 23,
      color: theme.colors.ink,
    },
    sendButton: {
      alignSelf: 'flex-end',
      minHeight: 46,
      borderRadius: 16,
      backgroundColor: theme.colors.ink,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.6,
    },
    sendLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.card,
    },
  });
}
