import React from 'react';
import { View, Text } from 'react-native';
import { Wind, PenTool } from 'lucide-react-native';

export const EmptyEchoesState = () => (
  <View className="items-center justify-center py-12 px-6">
    <View className="w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-full items-center justify-center mb-6 border border-dashed border-stone-300 dark:border-stone-700">
      <Wind size={32} className="text-stone-400 dark:text-stone-600" color="currentColor" />
    </View>
    
    <Text className="text-stone-900 dark:text-stone-100 text-lg font-bold mb-2 text-center">
      It&apos;s quiet here... too quiet.
    </Text>
    
    <Text className="text-stone-500 dark:text-stone-500 text-center text-sm leading-6 max-w-xs">
      Echoes are generated from your journal entries. Write a thought or capture a moment to start seeing patterns.
    </Text>

    <View className="flex-row items-center mt-6 bg-stone-200 dark:bg-stone-800 px-4 py-2 rounded-full opacity-60">
       <PenTool size={12} className="text-stone-500" color="currentColor" />
       <Text className="ml-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
         Write Entry
       </Text>
    </View>
  </View>
);