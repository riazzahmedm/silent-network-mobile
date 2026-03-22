import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

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

const styles = StyleSheet.create({
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
    backgroundColor: '#F7F2EA',
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
