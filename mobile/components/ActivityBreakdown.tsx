import React from 'react';
import { View, Text } from 'react-native';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react-native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';

interface DistributionProps {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

const DistributionRow = ({ 
  label, 
  pct, 
  icon: Icon, 
  colorClass, 
  barColorClass 
}: { 
  label: string; 
  pct: number; 
  icon: any; 
  colorClass: string;
  barColorClass: string;
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center mb-4 last:mb-0">
      {/* Icon Box */}
      <View className={clsx("w-8 h-8 rounded-full items-center justify-center mr-3", colorClass)}>
        <Icon size={14} color={isDark ? "#d6d3d1" : "#78716c"} />
      </View>

      {/* Bar & Label */}
      <View className="flex-1">
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-stone-700 dark:text-stone-300 text-xs font-medium">{label}</Text>
          <Text className="text-stone-500 dark:text-stone-500 text-xs font-bold">{pct}%</Text>
        </View>
        <View className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
          <View 
            style={{ width: `${pct}%` }} 
            className={clsx("h-full rounded-full", barColorClass)} 
          />
        </View>
      </View>
    </View>
  );
};

export const ActivityBreakdown = ({ dist }: { dist: DistributionProps }) => {
  return (
    <View className="bg-stone-50 dark:bg-black/20 rounded-2xl p-5 mt-4 border border-stone-200 dark:border-stone-800">
      <DistributionRow 
        label="Morning (5AM - 12PM)" 
        pct={dist.morning} 
        icon={Sunrise} 
        colorClass="bg-orange-100 dark:bg-orange-500/10" 
        barColorClass="bg-orange-400/70"
      />
      <DistributionRow 
        label="Afternoon (12PM - 5PM)" 
        pct={dist.afternoon} 
        icon={Sun} 
        colorClass="bg-yellow-100 dark:bg-yellow-500/10" 
        barColorClass="bg-yellow-500/70"
      />
      <DistributionRow 
        label="Evening (5PM - 10PM)" 
        pct={dist.evening} 
        icon={Sunset} 
        colorClass="bg-indigo-100 dark:bg-indigo-500/10" 
        barColorClass="bg-indigo-400/70"
      />
      <DistributionRow 
        label="Night (10PM - 5AM)" 
        pct={dist.night} 
        icon={Moon} 
        colorClass="bg-stone-200 dark:bg-stone-700/30" 
        barColorClass="bg-stone-500/70"
      />
    </View>
  );
};