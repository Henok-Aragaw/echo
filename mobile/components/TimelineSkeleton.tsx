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
        withTiming(0.7, { duration: 1000 }),
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
      className={clsx("bg-stone-300 dark:bg-stone-800 rounded-lg", className)} 
      style={[animatedStyle, style]} 
    />
  );
};

const SkeletonRow = ({ hasLine = true }: { hasLine?: boolean }) => (
  <View className="flex-row items-start mb-6">
    {/* Node Column */}
    <View className="items-center mr-4" style={{ width: 40 }}>
      <SkeletonBlock className="w-10 h-10 rounded-full" />
      {hasLine && (
        <View className="w-[2px] flex-1 bg-stone-200 dark:bg-stone-800 absolute top-10 bottom-[-24]" />
      )}
    </View>

    {/* Content Column */}
    <View className="flex-1 pt-1">
      <SkeletonBlock className="w-full h-32 rounded-2xl" />
    </View>
  </View>
);

const SkeletonDaySection = () => (
  <View className="mb-8">
    {/* Date Header Skeleton */}
    <View className="flex-row items-baseline mb-6 px-1">
      <SkeletonBlock className="w-32 h-8 rounded-md mr-3" />
      <SkeletonBlock className="w-16 h-4 rounded-md" />
    </View>
    
    {/* Items */}
    <View className="pl-2">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow hasLine={false} />
    </View>
  </View>
);

export const TimelineSkeleton = () => {
  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950 px-6 pt-6">
       <SkeletonDaySection />
       <SkeletonDaySection />
    </View>
  );
};