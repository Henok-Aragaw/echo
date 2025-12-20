import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Capture the Moment',
    description: 'Save your thoughts, images, or locations instantly. Let the noise fade away.',
    emoji: '📸'
  },
  {
    id: '2',
    title: 'Find Meaning',
    description: 'AI quietly reflects on your input, offering a poetic perspective on your day.',
    emoji: '✨'
  },
  {
    id: '3',
    title: 'Your Daily Memory',
    description: 'At night, receive a crafted story of your day. A memory to keep forever.',
    emoji: '🌙'
  },
];

const Dot = ({ isActive }: { isActive: boolean }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeColor = isDark ? '#f5f5f4' : '#292524'; 
  const inactiveColor = isDark ? '#292524' : '#d6d3d1'; 

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 32 : 8, { damping: 15, stiffness: 100 }),
      backgroundColor: withTiming(isActive ? activeColor : inactiveColor, { duration: 200 }),
    };
  });

  return (
    <Animated.View 
      style={[animatedStyle, { height: 8, borderRadius: 9999, marginHorizontal: 4 }]} 
    />
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colorScheme } = useColorScheme();

  const handleFinish = async () => {
    await storage.setSeenOnboarding();
    router.replace('/(auth)/sign-in');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <View className="flex-row justify-end px-6 pt-4">
        <TouchableOpacity onPress={handleFinish}>
          <Text className="text-stone-500 dark:text-stone-400 font-medium text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width, height: height * 0.6 }} className="justify-center items-center px-8">
            <View className="w-64 h-64 bg-stone-200 dark:bg-stone-900 rounded-[40px] mb-10 items-center justify-center border border-stone-300 dark:border-stone-800 shadow-sm">
               <Text className="text-7xl">{item.emoji}</Text>
            </View>
            <Text className="text-3xl text-stone-900 dark:text-stone-100 font-light mb-4 text-center tracking-wide">
              {item.title}
            </Text>
            <Text className="text-lg text-stone-600 dark:text-stone-400 text-center leading-relaxed font-light">
              {item.description}
            </Text>
          </View>
        )}
      />

      <View className="h-40 px-8 justify-between pb-10">
        <View className="flex-row justify-center mb-6 h-4 items-center">
          {SLIDES.map((_, index) => (
            <Dot key={index} isActive={currentIndex === index} />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNext}
          className="bg-stone-900 dark:bg-stone-100 h-14 rounded-full flex-row items-center justify-center shadow-lg shadow-stone-300 dark:shadow-none"
        >
          {currentIndex === SLIDES.length - 1 ? (
            <Text className="text-stone-50 dark:text-stone-950 font-bold text-lg">Get Started</Text>
          ) : (
            <View className="flex-row items-center">
                <Text className="text-stone-50 dark:text-stone-950 font-bold text-lg mr-2">Next</Text>
                <ArrowRight size={20} color={colorScheme === 'dark' ? '#0c0a09' : '#fafaf9'} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}