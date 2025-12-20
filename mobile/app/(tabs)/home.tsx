import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image as RNImage,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  MapPin,
  Link as LinkIcon,
  Type,
  Send,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import clsx from 'clsx';

import { useCapture } from '@/hooks/use-capture';

export default function HomeScreen() {
  const {
    content,
    setContent,
    type,
    setType,
    mediaUri,
    pickImage,
    detectLocation,
    isLocating,
    submit,
    isPending,
    lastInsight,
    resetMode,
  } = useCapture();

  const { colorScheme } = useColorScheme();
  const canSubmit = content.length > 0 || mediaUri !== null;

  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    } else {
      pulseAnim.setValue(0.4);
      spinAnim.setValue(0);
    }
  }, [isPending]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="px-6 pt-8"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500 mb-3">
              Daily Capture
            </Text>
            <Text className="text-4xl font-thin text-stone-900 dark:text-stone-100">
              What is happening{' '}
              <Text className="text-stone-400 dark:text-stone-600">now?</Text>
            </Text>
          </View>

          {/* Main Card */}
          <View className="min-h-[240px] rounded-[32px] p-5 bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 shadow-sm flex justify-between">
            {/* Content Area */}
            <View className="flex-1">
              {type === 'image' && mediaUri ? (
                <View className="relative h-48 rounded-2xl overflow-hidden mb-4">
                  <RNImage
                    source={{ uri: mediaUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    onPress={resetMode}
                    className="absolute top-3 right-3 bg-black/70 p-2 rounded-full"
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>

                  <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Add a caption..."
                    placeholderTextColor="#9ca3af"
                    className="absolute bottom-0 w-full px-4 py-3 bg-black/70 text-white text-sm"
                  />
                </View>
              ) : (
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  placeholder={
                    isLocating
                      ? 'Locating...'
                      : type === 'link'
                      ? 'Paste a URL...'
                      : type === 'location'
                      ? 'Where are you?'
                      : 'Pour your thoughts here...'
                  }
                  placeholderTextColor={
                    colorScheme === 'dark' ? '#57534e' : '#a8a29e'
                  }
                  className="flex-1 text-xl font-light text-stone-800 dark:text-stone-100"
                />
              )}
            </View>

            {/* Footer Toolbar */}
            <View className="flex-row justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800/50">
              {/* Mode Selector */}
              <View className="flex-row gap-4 p-2 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50">
                <TouchableOpacity
                  onPress={() => {
                    resetMode();
                    setType('text');
                  }}
                  className={clsx(
                    'p-2 rounded-full',
                    type === 'text' && 'bg-white dark:bg-stone-800'
                  )}
                >
                  <Type size={20} color="#78716c" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickImage}
                  className={clsx(
                    'p-2 rounded-full',
                    type === 'image' && 'bg-white dark:bg-stone-800'
                  )}
                >
                  <Image size={20} color="#78716c" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    resetMode();
                    setType('link');
                  }}
                  className={clsx(
                    'p-2 rounded-full',
                    type === 'link' && 'bg-white dark:bg-stone-800'
                  )}
                >
                  <LinkIcon size={20} color="#78716c" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    resetMode();
                    setType('location');
                    detectLocation();
                  }}
                  className={clsx(
                    'p-2 rounded-full',
                    type === 'location' && 'bg-white dark:bg-stone-800'
                  )}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#78716c" />
                  ) : (
                    <MapPin size={20} color="#78716c" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={submit}
                disabled={!canSubmit || isPending}
                className="w-14 h-14 rounded-full items-center justify-center transition-opacity"
                style={{
                  backgroundColor: canSubmit
                    ? colorScheme === 'dark'
                      ? '#f5f5f4'
                      : '#1c1917'
                    : '#e5e5e5',
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                <Send
                  size={22}
                  color={canSubmit ? (colorScheme === 'dark' ? '#000' : '#fff') : '#78716c'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Analysis Animation Area */}
          {isPending ? (
            <View className="mt-10 mb-10 items-center justify-center">
              <Animated.View 
                style={{ opacity: pulseAnim, transform: [{ scale: pulseAnim }] }}
                className="flex-row items-center gap-3 bg-stone-200/50 dark:bg-stone-800/50 px-6 py-3 rounded-full"
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Sparkles size={18} className="text-stone-500 dark:text-stone-400" color="currentColor" />
                </Animated.View>
                <Text className="text-sm font-medium text-stone-600 dark:text-stone-400 tracking-wide">
                  Distilling your moment...
                </Text>
              </Animated.View>
            </View>
          ) : lastInsight ? (
            <View className="mt-10 mb-10">
              <View className="flex-row justify-center items-center gap-2 mb-4">
                <Sparkles size={14} color="#a8a29e" />
                <Text className="text-xs uppercase tracking-widest text-stone-500">
                  Echo Reflection
                </Text>
              </View>

              <View className="p-8 rounded-[32px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <Text className="text-xl italic text-center text-stone-700 dark:text-stone-300">
                  “{lastInsight}”
                </Text>
              </View>
            </View>
          ) : null}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}