import React, { useState } from 'react';
import { 
  View, Text, ScrollView, RefreshControl, TouchableOpacity, 
  LayoutAnimation, Platform, UIManager 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEchoes } from '@/hooks/use-echoes';
import { Moon, BarChart3, PieChart, Lock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

// Components
import { EchoesSkeleton } from '@/components/EchoesSkeleton';
import { ActivityChart } from '@/components/ActivityChart';
import { DailyMemoryCard } from '@/components/DailyMemoryCard';
import { EmptyEchoesState } from '@/components/EmptyState';
import { ActivityBreakdown } from '@/components/ActivityBreakdown'; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EchoesScreen() {
  const { memories, stats, isLoading, refetch } = useEchoes();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const { colorScheme } = useColorScheme();

  const toggleView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(prev => prev === 'chart' ? 'list' : 'chart');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
        <EchoesSkeleton />
      </SafeAreaView>
    );
  }

  const hasData = stats && stats.graphData.some(val => val > 0);

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colorScheme === 'dark' ? "#fff" : "#000"} />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Analysis
            </Text>
            <Text className="text-4xl text-stone-900 dark:text-stone-100 font-light tracking-tight">
              Echoes
            </Text>
          </View>
          
          {hasData && (
            <TouchableOpacity 
                onPress={toggleView}
                className="bg-white dark:bg-stone-900 p-2.5 rounded-full border border-stone-200 dark:border-stone-800 shadow-sm"
            >
                {viewMode === 'chart' ? <PieChart size={20} color="#78716c" /> : <BarChart3 size={20} color="#78716c" />}
            </TouchableOpacity>
          )}
        </View>

        {!hasData ? (
            <EmptyEchoesState />
        ) : (
            <>
                <Text className="text-stone-600 dark:text-stone-400 text-base font-light leading-6 mb-8">
                  Insights derived from your recent moments and daily reflections.
                </Text>

                {/* Insight Card */}
                <View className="bg-white dark:bg-stone-900 rounded-[32px] p-6 mb-8 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 items-center justify-center">
                            <Moon size={20} className="text-stone-500 dark:text-stone-400" color="currentColor" />
                        </View>
                        <View className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                            <Text className="text-stone-600 dark:text-stone-400 text-[10px] font-bold uppercase">Activity</Text>
                        </View>
                    </View>

                    <Text className="text-stone-900 dark:text-stone-100 text-xl font-bold mb-2">
                        {stats.title}
                    </Text>
                    
                    <Text className="text-stone-500 dark:text-stone-500 text-sm leading-6 font-medium mb-4">
                        {stats.sub}
                    </Text>

                    {viewMode === 'chart' ? (
                        <ActivityChart data={stats.graphData} labels={stats.labels} />
                    ) : (
                        <ActivityBreakdown dist={stats.distribution} />
                    )}
                </View>

                {/* Daily Memories List */}
                <View className="flex-row items-center mb-4 mt-2">
                    <Text className="text-stone-500 text-xs font-bold uppercase tracking-[0.1em] ml-1">
                        Daily Reflections
                    </Text>
                    <View className="h-[1px] bg-stone-200 dark:bg-stone-800 flex-1 ml-4" />
                </View>

                {memories.length > 0 ? (
                    memories.map((memory) => (
                        <DailyMemoryCard key={memory.id} memory={memory} />
                    ))
                ) : (
                    <View className="py-8 items-center bg-stone-100/50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                        <Text className="text-stone-400 text-sm">Reflections are generated nightly.</Text>
                    </View>
                )}

                <View className="items-center mt-8 opacity-50 mb-10 flex-row justify-center">
                    <Lock size={12} color="#78716c" className="mr-2" />
                    <Text className="text-stone-500 dark:text-stone-600 text-[10px]">
                        Private & encrypted on device.
                    </Text>
                </View>
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}