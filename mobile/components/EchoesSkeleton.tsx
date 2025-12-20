import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import clsx from 'clsx';

const SkeletonBlock = ({ className, style }: { className?: string, style?: any }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      className={clsx("bg-stone-200 dark:bg-stone-800", className)} 
      style={[animatedStyle, style]} 
    />
  );
};

export const EchoesSkeleton = () => {
  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950 px-6 pt-6">
      
      {/* Header Area */}
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <SkeletonBlock className="w-16 h-3 rounded mb-2" />
          <SkeletonBlock className="w-32 h-10 rounded-lg" />
        </View>
        <SkeletonBlock className="w-10 h-10 rounded-full" />
      </View>

      {/* Subtext */}
      <SkeletonBlock className="w-3/4 h-4 rounded mb-8" />

      {/* Main Insight Card (Big Box) */}
      <SkeletonBlock className="w-full h-80 rounded-[32px] mb-8" />

      {/* List Title */}
      <SkeletonBlock className="w-24 h-3 rounded mb-4 ml-1" />

      {/* List Items */}
      <SkeletonBlock className="w-full h-28 rounded-[24px] mb-4" />
      <SkeletonBlock className="w-full h-28 rounded-[24px] mb-4" />
      
    </View>
  );
};