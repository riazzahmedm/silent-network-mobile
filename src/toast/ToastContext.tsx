import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme, useTheme } from '../theme';

type ToastType = 'success' | 'error' | 'info';

type ToastPayload = {
  title: string;
  message?: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastItem = ToastPayload & {
  id: number;
  type: ToastType;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (toast: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);
  const idRef = useRef(0);
  const translateY = useRef(new Animated.Value(-28)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -28,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveToast(null);
    });
  }, [opacity, translateY]);

  useEffect(() => {
    if (activeToast || queue.length === 0) {
      return;
    }

    const [nextToast, ...remaining] = queue;
    setQueue(remaining);
    setActiveToast(nextToast);
  }, [activeToast, queue]);

  useEffect(() => {
    if (!activeToast) {
      return;
    }

    translateY.setValue(-28);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      hideToast();
    }, activeToast.durationMs);

    return () => clearTimeout(timer);
  }, [activeToast, hideToast, opacity, translateY]);

  const showToast = useCallback((toast: ToastPayload) => {
    idRef.current += 1;
    setQueue((current) => [
      ...current,
      {
        id: idRef.current,
        title: toast.title,
        message: toast.message,
        type: toast.type ?? 'info',
        durationMs: toast.durationMs ?? 2800,
      },
    ]);
  }, []);

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  const accentMap = {
    success: theme.colors.building,
    error: '#A84E3B',
    info: theme.colors.accentBlue,
  } as const;

  const iconMap = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
  } as const;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {activeToast ? (
        <SafeAreaView pointerEvents="box-none" style={styles.portal}>
          <Animated.View
            style={[
              styles.toastWrap,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Pressable
              style={styles.toastCard}
              onPress={hideToast}
              android_disableSound
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: `${accentMap[activeToast.type]}18` },
                ]}
              >
                <Ionicons
                  name={iconMap[activeToast.type]}
                  size={18}
                  color={accentMap[activeToast.type]}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{activeToast.title}</Text>
                {activeToast.message ? (
                  <Text style={styles.message}>{activeToast.message}</Text>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    portal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      paddingHorizontal: 16,
    },
    toastWrap: {
      paddingTop: 10,
    },
    toastCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.line,
      paddingHorizontal: 14,
      paddingVertical: 14,
      ...theme.shadows.float,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    copy: {
      flex: 1,
      gap: 3,
    },
    title: {
      fontFamily: theme.fonts.sansBold,
      fontSize: 14,
      color: theme.colors.ink,
    },
    message: {
      fontFamily: theme.fonts.sansRegular,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.muted,
    },
  });
}
