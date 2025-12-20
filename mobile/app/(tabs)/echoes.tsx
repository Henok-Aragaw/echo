import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EchoesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-stone-950 justify-center items-center p-6">
      <Text className="text-6xl mb-4">🌌</Text>
      <Text className="text-stone-100 text-2xl font-light mb-2">Echoes</Text>
      <Text className="text-stone-500 text-center font-light leading-6">
        Patterns and deeper meanings from your memories will appear here as you capture more moments.
      </Text>
    </SafeAreaView>
  );
}