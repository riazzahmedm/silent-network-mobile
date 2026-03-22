import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { AppTheme, useTheme } from '../theme';

type AuthButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export function AuthButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}: AuthButtonProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.card : theme.colors.ink} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary ? styles.primaryLabel : styles.secondaryLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    button: {
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    primaryButton: {
      backgroundColor: theme.colors.ink,
    },
    secondaryButton: {
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.line,
    },
    disabled: {
      opacity: 0.6,
    },
    label: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 15,
    },
    primaryLabel: {
      color: theme.colors.card,
    },
    secondaryLabel: {
      color: theme.colors.ink,
    },
  });
}
