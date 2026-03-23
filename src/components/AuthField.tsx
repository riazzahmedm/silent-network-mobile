import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTheme, useTheme } from '../theme';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  keyboardType?: 'default' | 'email-address';
  autoComplete?:
    | 'name'
    | 'email'
    | 'username'
    | 'password'
    | 'password-new'
    | 'off';
  textContentType?:
    | 'name'
    | 'emailAddress'
    | 'username'
    | 'password'
    | 'newPassword';
};

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete = 'off',
  textContentType,
}: AuthFieldProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mode === 'dark' ? '#8E8A84' : '#8C968E'}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    label: {
      fontFamily: theme.fonts.sansMedium,
      fontSize: 13,
      color: theme.colors.ink,
    },
    input: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 16,
      paddingVertical: 15,
      fontFamily: theme.fonts.sansRegular,
      fontSize: 15,
      color: theme.colors.ink,
    },
  });
}
