import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor, 
  interpolate
} from 'react-native-reanimated';
import { Sun, Moon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const SPRING_CONFIG = {
  mass: 1,
  damping: 15,
  stiffness: 120,
  overshootClamping: false,
};

export const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // 0 = Light, 1 = Dark
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, SPRING_CONFIG);
  }, [isDark]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#e5e5e5', '#292524'] // Light Gray -> Dark Stone
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(progress.value, [0, 1], [4, 28])
    }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0, 1]),
    transform: [{
        rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg`
    }]
  }));

  return (
    <Pressable onPress={toggleColorScheme} className="active:opacity-80">
      <Animated.View className="w-14 h-8 rounded-full justify-center" style={trackStyle}>
        <Animated.View 
          className="w-6 h-6 bg-white rounded-full items-center justify-center shadow-sm" 
          style={knobStyle}
        >
          <Animated.View style={iconStyle}>
            {isDark ? (
              <Moon size={14} color="#0c0a09" fill="#0c0a09" />
            ) : (
              <Sun size={14} color="#f59e0b" fill="#f59e0b" />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};