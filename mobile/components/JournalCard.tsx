import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Image as RNImage, Linking } from 'react-native';
import { 
  Clock, MapPin, Link2 as LinkIcon, Image as LucideImage, 
  Type, Sparkles, ArrowUpRight, MoreHorizontal 
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import clsx from 'clsx';
import { Fragment } from '@/types/types';

const MetaBadge = ({ icon: Icon, text, colorClass }: { icon: any, text: string, colorClass?: string }) => (
  <View className={clsx("flex-row items-center px-2.5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/60 mr-2", colorClass)}>
    <Icon size={12} className="text-stone-500 dark:text-stone-400" color="currentColor" />
    <Text className="text-[10px] font-bold text-stone-500 dark:text-stone-400 ml-1.5 uppercase tracking-wide">
      {text}
    </Text>
  </View>
);

export const JournalCard = ({ item }: { item: Fragment }) => {
  const [expanded, setExpanded] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const isImage = item.type === 'IMAGE';
  const isLink = item.type === 'LINK';
  const isText = item.type === 'TEXT';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand} className="mb-6">
      <View className={clsx(
          "rounded-[28px] overflow-hidden border",
          isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-100",
          expanded ? "shadow-xl" : "shadow-sm"
        )}>
        
        {isImage && item.mediaUrl && (
          <View className="relative">
            <RNImage 
              source={{ uri: item.mediaUrl }} 
              className="w-full h-64 bg-stone-200 dark:bg-stone-800"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', isDark ? '#1c1917' : '#ffffff']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
            />
            <View className="absolute top-4 right-4 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                <LucideImage size={12} color="#fff" />
            </View>
          </View>
        )}

        <View className="p-5">
          <View className="flex-row items-center mb-4 opacity-70 flex-wrap gap-y-2">
            <MetaBadge icon={Clock} text={format(parseISO(item.createdAt), 'h:mm a')} />
            {item.type === 'LOCATION' && <MetaBadge icon={MapPin} text="Location" />}
            {item.type === 'LINK' && <MetaBadge icon={LinkIcon} text="Link" />}
            {item.type === 'IMAGE' && <MetaBadge icon={LucideImage} text="Photo" />}
            {item.type === 'TEXT' && <MetaBadge icon={Type} text="Thought" />}
            
            {item.insight && (
              <View className="bg-stone-200 dark:bg-stone-700/40 px-2 py-1 rounded-full">
                 <Sparkles size={10} color={isDark ? "#d6d3d1" : "#78716c"} />
              </View>
            )}
          </View>

          <View>
            {isLink ? (
               <TouchableOpacity onPress={() => Linking.openURL(item.content)} className="flex-row items-center">
                  <Text className="text-lg font-semibold text-blue-600 dark:text-blue-400 underline decoration-blue-300">
                    {item.content}
                  </Text>
                  <ArrowUpRight size={16} color={isDark ? "#60a5fa" : "#2563eb"} style={{ marginLeft: 4 }}/>
               </TouchableOpacity>
            ) : (
              <Text className={clsx(
                "leading-7",
                isText ? "text-lg font-serif italic text-stone-800 dark:text-stone-200" : "text-base font-medium text-stone-900 dark:text-stone-100",
                !expanded && "line-clamp-3"
              )} numberOfLines={expanded ? undefined : 3}>
                {item.content}
              </Text>
            )}
          </View>

          {expanded && (
            <View className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
              {item.insight && (
                <LinearGradient
                  colors={isDark ? ['#292524', '#1c1917'] : ['#f5f5f4', '#e7e5e4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4 rounded-2xl mb-4 border border-stone-200 dark:border-stone-800"
                >
                  <View className="flex-row items-center mb-2">
                    <Sparkles size={14} color={isDark ? "#a8a29e" : "#57534e"} />
                    <Text className="ml-2 text-xs font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">
                      AI Reflection
                    </Text>
                  </View>
                  <Text className="text-stone-700 dark:text-stone-300 text-sm leading-6 italic">
                    &quot;{item.insight.content}&quot;
                  </Text>
                </LinearGradient>
              )}

              <View className="flex-row justify-between items-center mt-2">
                 <Text className="text-xs text-stone-400 font-medium">
                   ID: {item.id.slice(0, 8)}
                 </Text>
                 <TouchableOpacity className="p-2 rounded-full bg-stone-100 dark:bg-stone-800">
                    <MoreHorizontal size={16} color={isDark ? "#fff" : "#000"} />
                 </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};