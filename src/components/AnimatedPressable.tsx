import { useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function AnimatedPressable({
  children,
  style,
  scaleTo = 0.98,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    Animated.timing(scale, {
      toValue: value,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  return (
    <AnimatedPressableBase
      {...props}
      style={[
        style,
        {
          transform: [{ scale }],
        },
      ]}
      onPressIn={(event) => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressableBase>
  );
}
