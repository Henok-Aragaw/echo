import React from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export default function TimelineScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      const res = await api.get('/timeline'); 
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-stone-950 justify-center items-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-950">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl text-stone-100 font-light">Timeline</Text>
      </View>

      <FlatList 
        data={data?.fragments || []} 
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fff"/>}
        renderItem={({ item }) => (
          <View className="mb-8 border-l-2 border-stone-800 pl-6 relative">
            {/* Dot */}
            <View className="absolute -left-[9px] top-0 w-4 h-4 bg-stone-950 border-2 border-stone-700 rounded-full" />
            
            <Text className="text-stone-500 text-xs uppercase tracking-wider mb-1">
              {format(new Date(item.createdAt), 'h:mm a')}
            </Text>
            
            <Text className="text-stone-200 text-lg font-light mb-2">
              {item.content}
            </Text>

            {item.insight && (
              <View className="bg-stone-900/60 p-3 rounded-lg mt-1">
                <Text className="text-stone-400 italic text-sm">
                   {item.insight.content}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}