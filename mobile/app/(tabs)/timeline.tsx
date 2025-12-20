import React, { useMemo, useState } from 'react';
import { 
  View, Text, FlatList, RefreshControl, ActivityIndicator, 
  TouchableOpacity, LayoutAnimation, Platform, UIManager, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { 
  Sparkles, MessageSquare, MapPin, Link as LinkIcon, 
  ImageIcon, ChevronDown, ExternalLink 
} from 'lucide-react-native';
import * as Linking from 'expo-linking';
import clsx from 'clsx';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Fragment = {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'LINK' | 'LOCATION';
  content: string;
  mediaUrl?: string;
  createdAt: string;
  insight?: { content: string };
};

const TimelineNode = ({ item, isLast }: { item: Fragment, isLast: boolean }) => {
  const iconSize = 16;
  
  const NodeContent = () => {
    if (item.type === 'IMAGE' && item.mediaUrl) {
      return (
        <Image 
          source={{ uri: item.mediaUrl }} 
          className="w-10 h-10 rounded-full border-2 border-stone-950"
          resizeMode="cover"
        />
      );
    }
    
    let IconComp = MessageSquare;
    let bgClass = "bg-stone-800";
    let iconColor = "#a8a29e";

    if (item.type === 'LOCATION') { IconComp = MapPin; bgClass="bg-emerald-950"; iconColor="#34d399"; }
    if (item.type === 'LINK') { IconComp = LinkIcon; bgClass="bg-blue-950"; iconColor="#60a5fa"; }
    if (item.type === 'IMAGE') { IconComp = ImageIcon; bgClass="bg-purple-950"; iconColor="#c084fc"; }

    return (
      <View className={clsx("w-10 h-10 rounded-full items-center justify-center border-4 border-stone-950", bgClass)}>
        <IconComp size={iconSize} color={iconColor} />
      </View>
    );
  };

  return (
    <View className="items-center mr-4" style={{ width: 40 }}>
      <View className="z-10">
        <NodeContent />
      </View>
      {!isLast && (
        <View className="w-[2px] flex-1 bg-stone-800/50 absolute top-10 bottom-[-20]" />
      )}
    </View>
  );
};

const MemoryItem = ({ item, isLast }: { item: Fragment, isLast: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleLink = () => {
    if (item.type === 'LINK') Linking.openURL(item.content);
  };

  return (
    <View className="flex-row items-start mb-6">
      <TimelineNode item={item} isLast={isLast} />
      <View className="flex-1 pt-1">
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={toggle}
          className="bg-stone-900/40 rounded-2xl border border-stone-800/60 p-4"
        >
          <View className="flex-row justify-between items-center mb-2">
             <Text className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                {format(parseISO(item.createdAt), 'h:mm a')}
             </Text>
             {item.insight && !expanded && (
               <Sparkles size={10} color="#78716c" />
             )}
          </View>

          <Text className={clsx(
            "text-stone-200 text-base leading-6 mb-1", 
            item.type === 'TEXT' ? "font-light font-serif italic" : "font-medium"
          )} numberOfLines={expanded ? undefined : 2}>
            {item.type === 'IMAGE' ? (item.content || 'Image Capture') : item.content}
          </Text>

          {expanded && (
            <View className="mt-4">
              {item.type === 'IMAGE' && item.mediaUrl && (
                <View className="mb-4 rounded-xl overflow-hidden border border-stone-800 shadow-lg">
                  <Image 
                    source={{ uri: item.mediaUrl }} 
                    style={{ width: '100%', aspectRatio: 4/3 }}
                    resizeMode="cover" 
                  />
                </View>
              )}

              {item.type === 'LINK' && (
                <TouchableOpacity onPress={handleLink} className="flex-row items-center mb-4 bg-blue-900/10 p-3 rounded-lg border border-blue-900/30">
                  <ExternalLink size={14} color="#60a5fa" />
                  <Text className="text-blue-400 ml-2 text-sm font-medium">Open Link</Text>
                </TouchableOpacity>
              )}

              {item.insight && (
                <View className="mt-2 pl-4 border-l-2 border-stone-700">
                  <Text className="text-stone-400 text-sm leading-6 font-light italic">
                    "{item.insight.content}"
                  </Text>
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-stone-600 text-[10px] uppercase tracking-wider font-bold mr-1">
                      ECHO REFLECTION
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {!expanded && (
            <View className="items-center mt-1 opacity-20">
               <ChevronDown size={12} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DaySection = ({ date, fragments }: { date: string, fragments: Fragment[] }) => {
  const dateObj = parseISO(date);
  
  let dateLabel = format(dateObj, 'MMM d, yyyy');
  let dayLabel = format(dateObj, 'EEEE');
  let isHighlight = false;

  if (isToday(dateObj)) {
    dateLabel = "Today";
    isHighlight = true;
  } else if (isYesterday(dateObj)) {
    dateLabel = "Yesterday";
  }

  return (
    <View className="mb-8">
      <View className="flex-row items-baseline mb-6 px-1">
        <Text className={clsx("text-2xl font-light tracking-tight", isHighlight ? "text-stone-100" : "text-stone-400")}>
          {dateLabel}
        </Text>
        <Text className="ml-3 text-stone-600 text-xs font-bold uppercase tracking-widest">
          {dayLabel}
        </Text>
      </View>
      <View className="pl-2"> 
        {fragments.map((fragment, index) => (
          <MemoryItem 
            key={fragment.id} 
            item={fragment} 
            isLast={index === fragments.length - 1} 
          />
        ))}
      </View>
    </View>
  );
};

export default function TimelineScreen() {
  const BATCH_SIZE = 20;

  const { 
    data, 
    isLoading, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['timeline'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get(`/fragments/timeline?skip=${pageParam}&take=${BATCH_SIZE}`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < BATCH_SIZE) return undefined;
      return allPages.length * BATCH_SIZE;
    },
  });

  const groupedData = useMemo(() => {
    if (!data) return [];
    const allFragments = data.pages.flat();
    const groups: Record<string, Fragment[]> = {};
    
    allFragments.forEach((fragment: Fragment) => {
      const dateKey = fragment.createdAt.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(fragment);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        fragments: groups[date]
      }));
  }, [data]);

  return (
    <SafeAreaView className="flex-1 bg-stone-950">
      <View className="px-6 pt-4 pb-4 border-b border-stone-900/50">
        <Text className="text-stone-100 text-xs font-bold uppercase tracking-[0.3em] text-center">
          Memory Timeline
        </Text>
      </View>

      <FlatList 
        data={groupedData}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fff"/>}
        renderItem={({ item }) => <DaySection date={item.date} fragments={item.fragments} />}
        
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}

        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#78716c" />
            </View>
          ) : null
        }
        
        // FIX: Used ternary operator to return null instead of false
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center mt-32 opacity-30">
               <Text className="text-6xl mb-4 grayscale">🕰️</Text>
               <Text className="text-stone-400 font-light">No memories yet.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}