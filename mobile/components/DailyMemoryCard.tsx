import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { DailyMemory } from '@/hooks/use-echoes';

export const DailyMemoryCard = ({ memory }: { memory: DailyMemory }) => {
  const dateObj = parseISO(memory.date);

  return (
    <View className="bg-white dark:bg-stone-900 rounded-[24px] p-5 mb-4 border border-stone-200 dark:border-stone-800 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-purple-100 dark:bg-purple-900/20">
            <Sparkles size={20} color="#a855f7" />
          </View>
          <View>
            <Text className="text-stone-900 dark:text-stone-100 font-bold text-base">
              {format(dateObj, 'EEEE')}
            </Text>
            <Text className="text-stone-500 text-xs font-medium">
              {format(dateObj, 'MMMM d, yyyy')}
            </Text>
          </View>
        </View>
        
        <View className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Daily Echo</Text>
        </View>
      </View>

      <Text className="text-stone-600 dark:text-stone-300 text-sm leading-6 font-light italic">
        &quot;{memory.summary}&quot;
      </Text>
    </View>
  );
};