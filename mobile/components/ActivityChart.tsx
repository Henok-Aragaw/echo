import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';

interface ActivityChartProps {
  data: number[];
  labels: string[];
}

export const ActivityChart = ({ data, labels }: ActivityChartProps) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const max = Math.max(...data, 1);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="bg-stone-50 dark:bg-black/20 rounded-2xl p-4 mt-4 border border-stone-200 dark:border-stone-800">
      <View className="flex-row items-end justify-between h-32 space-x-2 px-1">
        {data.map((value, i) => {
          // Calculate height percentage as a valid string
          const heightPct: DimensionValue = `${(value / max) * 100}%`;
          const isFocused = focusedIndex === i;
          
          // Define style explicitly to satisfy TypeScript
          const barStyle: StyleProp<ViewStyle> = {
            height: value === 0 ? 4 : heightPct,
            minHeight: 4,
          };

          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => setFocusedIndex(isFocused ? null : i)}
              className="flex-1 items-center h-full justify-end"
            >
              {/* Tooltip / Value Indicator */}
              {isFocused && (
                <Animated.View 
                  entering={FadeInDown.springify()} 
                  className="absolute -top-8 bg-stone-800 dark:bg-stone-100 px-2 py-1 rounded-md z-10"
                >
                  <Text className="text-stone-50 dark:text-stone-900 text-[10px] font-bold">
                    {value} events
                  </Text>
                  {/* Arrow Tip */}
                  <View className="absolute -bottom-1 left-1/2 -ml-1 w-2 h-2 bg-stone-800 dark:bg-stone-100 rotate-45" />
                </Animated.View>
              )}

              {/* The Bar */}
              <View 
                className="w-full rounded-t-lg overflow-hidden relative"
                style={barStyle} // Fixed TS error here
              >
                <LinearGradient
                  colors={
                    isFocused 
                      ? (isDark ? ['#a8a29e', '#57534e'] : ['#57534e', '#292524'])
                      : (isDark ? ['#44403c', '#292524'] : ['#d6d3d1', '#a8a29e'])
                  }
                  style={{ flex: 1 }}
                />
              </View>

              {/* Label */}
              <Text className={clsx(
                "text-[10px] mt-2 font-medium text-center w-full",
                isFocused ? "text-stone-900 dark:text-stone-100 font-bold" : "text-stone-400"
              )}>
                {labels[i].slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};