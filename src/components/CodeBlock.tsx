import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme';
import { useTheme } from '../theme';

type CodeBlockProps = {
  code: string;
  language?: string;
};

type TokenType =
  | 'plain'
  | 'keyword'
  | 'type'
  | 'string'
  | 'number'
  | 'comment'
  | 'operator';

type Token = {
  value: string;
  type: TokenType;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
};

const KEYWORDS: Record<string, string[]> = {
  javascript: [
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'import',
    'let',
    'new',
    'return',
    'switch',
    'throw',
    'try',
    'typeof',
    'var',
    'while',
  ],
  typescript: [
    'as',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'else',
    'enum',
    'export',
    'extends',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'implements',
    'import',
    'interface',
    'let',
    'new',
    'private',
    'protected',
    'public',
    'readonly',
    'return',
    'switch',
    'throw',
    'try',
    'type',
    'typeof',
    'while',
  ],
  json: [],
  sql: [
    'and',
    'as',
    'by',
    'create',
    'delete',
    'from',
    'group',
    'having',
    'insert',
    'into',
    'join',
    'left',
    'limit',
    'on',
    'or',
    'order',
    'right',
    'select',
    'set',
    'table',
    'update',
    'values',
    'where',
  ],
  bash: [
    'case',
    'cd',
    'do',
    'done',
    'echo',
    'elif',
    'else',
    'esac',
    'export',
    'fi',
    'for',
    'function',
    'if',
    'in',
    'local',
    'printf',
    'return',
    'then',
    'while',
  ],
  prisma: [
    'datasource',
    'enum',
    'generator',
    'model',
    'relation',
    'type',
  ],
  yaml: [],
};

const TYPES: Record<string, string[]> = {
  javascript: ['Array', 'Date', 'Map', 'Object', 'Promise', 'Set'],
  typescript: ['Array', 'Date', 'Map', 'Object', 'Promise', 'Record', 'Set', 'string', 'number', 'boolean'],
  prisma: ['String', 'Int', 'Boolean', 'DateTime', 'Json', 'Float', 'Decimal', 'Bytes'],
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const normalizedLanguage = normalizeLanguage(language);
  const lines = trimTrailingNewline(code).split('\n');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>{normalizedLanguage || 'text'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeArea}>
          {lines.map((line, index) => {
            const tokens = tokenize(line, normalizedLanguage);

            return (
              <View key={`${index}-${line}`} style={styles.lineRow}>
                <Text style={styles.lineNumber}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.codeLine}>
                  {tokens.length === 0 ? ' ' : null}
                  {tokens.map((token, tokenIndex) => (
                    <Text
                      key={`${index}-${tokenIndex}`}
                      style={tokenStyleMap(theme)[token.type]}
                    >
                      {token.value}
                    </Text>
                  ))}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function normalizeLanguage(language?: string) {
  if (!language) {
    return '';
  }

  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

function trimTrailingNewline(value: string) {
  return value.endsWith('\n') ? value.slice(0, -1) : value;
}

function tokenize(line: string, language: string): Token[] {
  if (!line) {
    return [];
  }

  const commentMatch = extractComment(line, language);
  let source = line;
  let comment = '';

  if (commentMatch) {
    source = line.slice(0, commentMatch.index);
    comment = line.slice(commentMatch.index);
  }

  const pattern =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|[A-Za-z_][A-Za-z0-9_]*|==|===|!=|!==|=>|>=|<=|&&|\|\||[{}()[\].,:;=<>+\-/*%]+)/g;
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(pattern)) {
    const value = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ value: source.slice(lastIndex, index), type: 'plain' });
    }

    tokens.push({
      value,
      type: classifyToken(value, language),
    });

    lastIndex = index + value.length;
  }

  if (lastIndex < source.length) {
    tokens.push({ value: source.slice(lastIndex), type: 'plain' });
  }

  if (comment) {
    tokens.push({ value: comment, type: 'comment' });
  }

  return tokens;
}

function extractComment(line: string, language: string) {
  const markers =
    language === 'sql'
      ? ['--']
      : language === 'bash' || language === 'yaml'
        ? ['#']
        : ['//', '#'];

  let bestIndex = -1;
  for (const marker of markers) {
    const index = line.indexOf(marker);
    if (index >= 0 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
    }
  }

  return bestIndex >= 0 ? { index: bestIndex } : null;
}

function classifyToken(value: string, language: string): TokenType {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('`') && value.endsWith('`'))
  ) {
    return 'string';
  }

  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return 'number';
  }

  const lower = value.toLowerCase();
  if ((KEYWORDS[language] ?? []).includes(language === 'sql' ? lower : value)) {
    return 'keyword';
  }

  if ((TYPES[language] ?? []).includes(value)) {
    return 'type';
  }

  if (/^(==|===|!=|!==|=>|>=|<=|&&|\|\||[{}()[\].,:;=<>+\-/*%])$/.test(value)) {
    return 'operator';
  }

  return 'plain';
}

function tokenStyleMap(theme: AppTheme) {
  return {
    plain: {
      color: theme.colors.heroText,
    },
    keyword: {
      color: '#DAB06A',
    },
    type: {
      color: '#8BC3B3',
    },
    string: {
      color: '#C8A5D4',
    },
    number: {
      color: '#F0C674',
    },
    comment: {
      color: theme.colors.heroSubtleText,
      fontStyle: 'italic' as const,
    },
    operator: {
      color: '#9CC6FF',
    },
  } as const;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.night,
      marginBottom: 14,
    },
    header: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.line,
      backgroundColor: theme.colors.nightSoft,
    },
    headerLabel: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 11,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      color: theme.colors.heroSubtleText,
    },
    codeArea: {
      paddingVertical: 10,
      minWidth: '100%',
    },
    lineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 2,
    },
    lineNumber: {
      width: 28,
      marginRight: 12,
      fontFamily: 'Courier',
      fontSize: 12,
      lineHeight: 21,
      color: theme.colors.heroSubtleText,
      opacity: 0.7,
    },
    codeLine: {
      flex: 1,
      fontFamily: 'Courier',
      fontSize: 13,
      lineHeight: 21,
      color: theme.colors.heroText,
    },
  });
}
