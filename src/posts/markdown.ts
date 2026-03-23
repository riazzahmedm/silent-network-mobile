import { createElement } from 'react';
import type { StyleSheet } from 'react-native';
import { CodeBlock } from '../components/CodeBlock';
import type { AppTheme } from '../theme';

export const POST_CONTENT_MAX_LENGTH = 10000;
export type MarkdownSelection = { start: number; end: number };

export type MarkdownToolbarAction =
  | 'heading'
  | 'bold'
  | 'inline-code'
  | 'code-block'
  | 'bullet-list'
  | 'quote'
  | 'link';

export const MARKDOWN_TOOLBAR_ITEMS: Array<{
  key: MarkdownToolbarAction;
  label: string;
}> = [
  { key: 'heading', label: 'H2' },
  { key: 'bold', label: 'Bold' },
  { key: 'inline-code', label: '`Code`' },
  { key: 'code-block', label: '{ }' },
  { key: 'bullet-list', label: 'List' },
  { key: 'quote', label: 'Quote' },
  { key: 'link', label: 'Link' },
];

export function createMarkdownStyles(theme: AppTheme) {
  return {
    body: {
      color: theme.colors.ink,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 16,
      lineHeight: 28,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 14,
    },
    heading1: {
      fontFamily: theme.fonts.serif,
      fontSize: 30,
      lineHeight: 34,
      color: theme.colors.ink,
      marginTop: 8,
      marginBottom: 12,
    },
    heading2: {
      fontFamily: theme.fonts.serif,
      fontSize: 24,
      lineHeight: 28,
      color: theme.colors.ink,
      marginTop: 6,
      marginBottom: 10,
    },
    heading3: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 18,
      lineHeight: 24,
      color: theme.colors.ink,
      marginTop: 4,
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 12,
    },
    ordered_list: {
      marginBottom: 12,
    },
    list_item: {
      marginBottom: 6,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.line,
      paddingLeft: 12,
      marginBottom: 14,
      opacity: 0.9,
    },
    code_inline: {
      fontFamily: 'Courier',
      backgroundColor: theme.colors.cardMuted,
      color: theme.colors.ink,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    code_block: {
      fontFamily: 'Courier',
      backgroundColor: theme.colors.night,
      color: theme.colors.heroText,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.colors.line,
      marginBottom: 14,
    },
    fence: {
      fontFamily: 'Courier',
      backgroundColor: theme.colors.night,
      color: theme.colors.heroText,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.colors.line,
      marginBottom: 14,
    },
    hr: {
      backgroundColor: theme.colors.line,
      height: 1,
      marginVertical: 18,
    },
    link: {
      color: theme.colors.accentBlue,
      textDecorationLine: 'underline',
    },
  } as const satisfies ReturnType<typeof StyleSheet.create>;
}

export function createMarkdownRules() {
  return {
    fence: (node: { key: string; content: string; sourceInfo?: string }) =>
      createElement(CodeBlock, {
        key: node.key,
        code: node.content,
        language: node.sourceInfo,
      }),
    code_block: (node: { key: string; content: string }) =>
      createElement(CodeBlock, {
        key: node.key,
        code: node.content,
      }),
  };
}

export function toPlainTextPreview(markdown: string, maxLength = 280) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```/g, '').replace(/\n+/g, ' ').trim(),
    )
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength - 3).trimEnd()}...`;
}

export function applyMarkdownAction(
  text: string,
  selection: MarkdownSelection,
  action: MarkdownToolbarAction,
) {
  const start = Math.max(0, selection.start);
  const end = Math.max(start, selection.end);
  const selectedText = text.slice(start, end);
  const before = text.slice(0, start);
  const after = text.slice(end);

  const insert = (nextValue: string, cursorOffset = nextValue.length) => ({
    text: `${before}${nextValue}${after}`,
    selection: {
      start: before.length + cursorOffset,
      end: before.length + cursorOffset,
    },
  });

  const wrap = (prefix: string, suffix: string, fallback: string) => {
    const value = selectedText || fallback;
    const nextValue = `${prefix}${value}${suffix}`;
    const selectedStart = before.length + prefix.length;
    const selectedEnd = selectedStart + value.length;

    return {
      text: `${before}${nextValue}${after}`,
      selection: {
        start: selectedStart,
        end: selectedText ? selectedEnd : selectedStart + fallback.length,
      },
    };
  };

  switch (action) {
    case 'heading': {
      const value = selectedText || 'Section title';
      return insert(`## ${value}`, 3 + value.length);
    }
    case 'bold':
      return wrap('**', '**', 'important point');
    case 'inline-code':
      return wrap('`', '`', 'const result = value');
    case 'code-block': {
      const value = selectedText || 'function solve() {\n  return true;\n}';
      return insert(`\n\`\`\`ts\n${value}\n\`\`\`\n`, value.length + 7);
    }
    case 'bullet-list': {
      const value = selectedText || 'Item one\nItem two';
      const formatted = value
        .split('\n')
        .map((line) => `- ${line}`)
        .join('\n');
      return insert(formatted, formatted.length);
    }
    case 'quote': {
      const value = selectedText || 'Key takeaway';
      const formatted = value
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      return insert(formatted, formatted.length);
    }
    case 'link':
      return wrap('[', '](https://example.com)', 'reference');
    default:
      return { text, selection };
  }
}
