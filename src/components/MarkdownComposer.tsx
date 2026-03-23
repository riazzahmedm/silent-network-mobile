import Markdown from 'react-native-markdown-display';
import { useMemo, useState } from 'react';
import {
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  applyMarkdownAction,
  createMarkdownStyles,
  MARKDOWN_TOOLBAR_ITEMS,
  type MarkdownSelection,
} from '../posts/markdown';
import { AppTheme, useTheme } from '../theme';

type MarkdownComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  maxLength: number;
  minHeight?: number;
  editable?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
};

export function MarkdownComposer({
  value,
  onChangeText,
  placeholder,
  maxLength,
  minHeight = 180,
  editable = true,
  error,
  onErrorClear,
}: MarkdownComposerProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const markdownStyles = useMemo(() => createMarkdownStyles(theme), [theme]);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [selection, setSelection] = useState<MarkdownSelection>({ start: 0, end: 0 });

  function handleSelectionChange(
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) {
    setSelection(event.nativeEvent.selection);
  }

  function handleToolbarAction(action: (typeof MARKDOWN_TOOLBAR_ITEMS)[number]['key']) {
    const next = applyMarkdownAction(value, selection, action);
    onChangeText(next.text);
    setSelection(next.selection);
    onErrorClear?.();
    setMode('write');
  }

  return (
    <View style={styles.container}>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'write' && styles.modeChipActive]}
          onPress={() => setMode('write')}
        >
          <Text style={[styles.modeLabel, mode === 'write' && styles.modeLabelActive]}>
            Write
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'preview' && styles.modeChipActive]}
          onPress={() => setMode('preview')}
        >
          <Text style={[styles.modeLabel, mode === 'preview' && styles.modeLabelActive]}>
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolbar}
      >
        {MARKDOWN_TOOLBAR_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.toolbarChip}
            onPress={() => handleToolbarAction(item.key)}
            disabled={!editable}
          >
            <Text style={styles.toolbarLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {mode === 'write' ? (
        <TextInput
          value={value}
          onChangeText={(nextValue) => {
            onChangeText(nextValue);
            onErrorClear?.();
          }}
          onSelectionChange={handleSelectionChange}
          selection={selection}
          placeholder={placeholder}
          placeholderTextColor={theme.mode === 'dark' ? '#8E8A84' : '#8C968E'}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          editable={editable}
          style={[styles.input, { minHeight }]}
        />
      ) : (
        <View style={[styles.previewCard, { minHeight }]}>
          {value.trim() ? (
            <Markdown style={markdownStyles}>{value}</Markdown>
          ) : (
            <Text style={styles.previewEmpty}>Nothing to preview yet.</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>
          Markdown supported: headings, lists, links, inline code, and fenced code blocks.
        </Text>
        <Text style={styles.count}>
          {value.trim().length}/{maxLength}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: 12,
    },
    modeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    modeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
    },
    modeChipActive: {
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    modeLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.ink,
    },
    modeLabelActive: {
      color: theme.colors.card,
    },
    toolbar: {
      gap: 8,
      paddingRight: 6,
    },
    toolbarChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.card,
    },
    toolbarLabel: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.ink,
    },
    input: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      lineHeight: 25,
      color: theme.colors.ink,
    },
    previewCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    previewEmpty: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 14,
      color: theme.colors.muted,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    },
    hint: {
      flex: 1,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.muted,
    },
    count: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 12,
      color: theme.colors.muted,
    },
    error: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.struggling,
    },
  });
}
