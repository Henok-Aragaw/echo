import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, RefreshControl, ActivityIndicator, 
  TouchableOpacity, Platform, UIManager 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Filter, Calendar, X, Quote } from 'lucide-react-native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

import { useTimeline } from '@/hooks/useTimeline';
import { JournalCard } from '@/components/JournalCard';
import { CalendarModal } from '@/components/CalendarModal';
import { GroupedFragment } from '@/types/types';

// Enable Layout Animations
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Sub-component for List Headers
const DateHeader = ({ date, count }: { date: string, count: number }) => {
  const dateObj = parseISO(date);
  let label = format(dateObj, 'EEEE');
  if (isToday(dateObj)) label = "Today";
  if (isYesterday(dateObj)) label = "Yesterday";

  return (
    <View className="flex-row items-end justify-between px-2 mb-4 mt-8">
      <View>
        <Text className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">
          {format(dateObj, 'MMMM yyyy')}
        </Text>
        <View className="flex-row items-baseline">
            <Text className="text-3xl font-black text-stone-900 dark:text-white mr-3">
              {label}
            </Text>
            {!isToday(dateObj) && !isYesterday(dateObj) && (
                <Text className="text-xl font-light text-stone-400">
                    {format(dateObj, 'do')}
                </Text>
            )}
        </View>
      </View>
      <View className="bg-stone-200 dark:bg-stone-800 px-3 py-1 rounded-full">
         <Text className="text-xs font-bold text-stone-600 dark:text-stone-400">
            {count} Entries
         </Text>
      </View>
    </View>
  );
};

const EmptyState = ({ 
  isLoading, 
  filterDate, 
  onClearFilter 
}: { 
  isLoading: boolean; 
  filterDate: Date | null; 
  onClearFilter: () => void 
}) => {
  if (isLoading) {
    return (
      <View className="mt-8 px-4">
        {[1, 2, 3].map(i => (
          <View key={i} className="mb-8 opacity-50">
            <View className="w-32 h-6 bg-stone-200 dark:bg-stone-800 rounded mb-4" />
            <View className="w-full h-48 bg-stone-100 dark:bg-stone-800 rounded-3xl" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="items-center justify-center mt-32 px-10">
      <View className="w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-full items-center justify-center mb-6">
        {filterDate ? (
          <Calendar size={32} className="text-stone-300 dark:text-stone-700" color="currentColor" />
        ) : (
          <Quote size={32} className="text-stone-300 dark:text-stone-700" color="currentColor" />
        )}
      </View>
      
      <Text className="text-stone-900 dark:text-stone-100 text-xl font-bold mb-2 text-center">
          {filterDate ? "No journal recorded" : "Start your journey"}
      </Text>
      
      <Text className="text-stone-400 dark:text-stone-500 text-center leading-6">
          {filterDate 
            ? `You didn't capture anything on ${format(filterDate, 'MMMM do')}.`
            : "Your timeline is empty. Capture a moment today to start your story."
          }
      </Text>

      {filterDate && (
          <TouchableOpacity onPress={onClearFilter} className="mt-6 px-6 py-3 bg-stone-900 dark:bg-stone-100 rounded-full">
              <Text className="text-white dark:text-black font-bold text-xs uppercase tracking-widest">View All</Text>
          </TouchableOpacity>
      )}
    </View>
  );
};

export default function TimelineScreen() {
  const { colorScheme } = useColorScheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  const { 
    groupedData, 
    isLoading, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTimeline(filterDate);

  const renderItem = useCallback(({ item }: { item: GroupedFragment }) => (
    <View>
      <DateHeader date={item.date} count={item.fragments.length} />
      {item.fragments.map((fragment) => (
        <JournalCard key={fragment.id} item={fragment} />
      ))}
    </View>
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-[#FDFCFB] dark:bg-[#0c0a09]">
      {/* Top Bar */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-transparent z-10">
        <View>
            <Text className="text-stone-900 dark:text-white text-lg font-black tracking-tighter">JOURNAL</Text>
            <View className="flex-row items-center">
                <Text className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {filterDate ? format(filterDate, 'MMMM do, yyyy') : 'All History'}
                </Text>
                {filterDate && (
                   <TouchableOpacity onPress={() => setFilterDate(null)} className="ml-2">
                       <X size={12} color="#a8a29e" />
                   </TouchableOpacity>
                )}
            </View>
        </View>
        <TouchableOpacity 
            onPress={() => setCalendarVisible(true)}
            className={clsx(
              "w-10 h-10 rounded-full items-center justify-center shadow-lg transition-colors", 
              filterDate ? "bg-stone-900 dark:bg-stone-100" : "bg-white dark:bg-stone-800"
            )}
        >
             {filterDate ? (
               <Filter size={16} color={colorScheme === 'dark' ? '#000' : '#fff'} />
             ) : (
               <Calendar size={18} color={colorScheme === 'dark' ? '#fff' : '#000'} />
             )}
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList 
        data={groupedData}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colorScheme === 'dark' ? "#fff" : "#000"} />
        }
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color={colorScheme === 'dark' ? "#57534e" : "#d6d3d1"} />
            </View>
          ) : <View className="h-20" />
        }
        ListEmptyComponent={
          <EmptyState 
            isLoading={isLoading} 
            filterDate={filterDate} 
            onClearFilter={() => setFilterDate(null)} 
          />
        }
      />
      
      <LinearGradient 
        colors={['transparent', colorScheme === 'dark' ? '#0c0a09' : '#FDFCFB']} 
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 }} 
        pointerEvents="none" 
      />
      
      <CalendarModal 
        visible={calendarVisible} 
        onClose={() => setCalendarVisible(false)} 
        selectedDate={filterDate} 
        onSelectDate={setFilterDate} 
      />
    </SafeAreaView>
  );
}