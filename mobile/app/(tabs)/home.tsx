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
  const isDark = colorScheme === 'dark';
  
  const canSubmit = content.trim().length > 0 || mediaUri !== null;

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Animation Logic
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation;
    let spinLoop: Animated.CompositeAnimation;

    if (isPending) {
      pulseLoop = Animated.loop(
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
      );

      spinLoop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );

      pulseLoop.start();
      spinLoop.start();
    } else {
      pulseAnim.setValue(0.4);
      spinAnim.setValue(0);
    }

    return () => {
      pulseLoop?.stop();
      spinLoop?.stop();
    };
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
          <View 
            className="min-h-[240px] rounded-[32px] p-5 border border-stone-200 dark:border-stone-800 flex justify-between"
            style={{
              backgroundColor: isDark ? 'rgba(28, 25, 23, 0.4)' : '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            {/* Content Area */}
            <View className="flex-1">
              {type === 'IMAGE' && mediaUri ? (
                <View className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-stone-100 dark:bg-stone-800">
                  <RNImage
                    source={{ uri: mediaUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    onPress={resetMode}
                    className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>

                  <View 
                    className="absolute bottom-0 w-full backdrop-blur-md p-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                  >
                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Add a caption..."
                        placeholderTextColor="#d6d3d1"
                        className="text-white text-sm px-3 py-2 font-medium"
                    />
                  </View>
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
                      : type === 'LINK'
                      ? 'Paste a URL...'
                      : type === 'LOCATION'
                      ? 'Where are you?'
                      : 'Pour your thoughts here...'
                  }
                  placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                  className="flex-1 text-xl font-light text-stone-800 dark:text-stone-100 leading-8"
                  style={{ minHeight: 120 }}
                />
              )}
            </View>

            {/* Footer Toolbar */}
            <View className="flex-row justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800/50">
              
              {/* Mode Selector */}
              <View 
                className="flex-row gap-3 p-1.5 rounded-full border border-stone-200 dark:border-stone-800"
                style={{ backgroundColor: isDark ? 'rgba(12, 10, 9, 0.5)' : '#fafaf9' }}
              >
                
                {/* Text Mode */}
                <TouchableOpacity
                  onPress={() => {
                    if (type === 'IMAGE') resetMode();
                    setType('TEXT');
                  }}
                  className={clsx(
                    'p-3 rounded-full transition-all',
                    type === 'TEXT' ? 'bg-white dark:bg-stone-800' : 'bg-transparent'
                  )}
                  style={type === 'TEXT' ? { shadowColor: '#000', shadowOpacity: 0.1, elevation: 1 } : {}}
                >
                  <Type size={20} color={type === 'TEXT' ? (isDark ? '#e7e5e4' : '#44403c') : '#a8a29e'} />
                </TouchableOpacity>

                {/* Image Mode */}
                <TouchableOpacity
                  onPress={pickImage}
                  className={clsx(
                    'p-3 rounded-full transition-all',
                    type === 'IMAGE' ? 'bg-white dark:bg-stone-800' : 'bg-transparent'
                  )}
                  style={type === 'IMAGE' ? { shadowColor: '#000', shadowOpacity: 0.1, elevation: 1 } : {}}
                >
                  <Image size={20} color={type === 'IMAGE' ? (isDark ? '#e7e5e4' : '#44403c') : '#a8a29e'} />
                </TouchableOpacity>

                {/* Link Mode */}
                <TouchableOpacity
                  onPress={() => {
                    resetMode();
                    setType('LINK');
                  }}
                  className={clsx(
                    'p-3 rounded-full transition-all',
                    type === 'LINK' ? 'bg-white dark:bg-stone-800' : 'bg-transparent'
                  )}
                  style={type === 'LINK' ? { shadowColor: '#000', shadowOpacity: 0.1, elevation: 1 } : {}}
                >
                  <LinkIcon size={20} color={type === 'LINK' ? (isDark ? '#e7e5e4' : '#44403c') : '#a8a29e'} />
                </TouchableOpacity>

                {/* Location Mode */}
                <TouchableOpacity
                  onPress={() => {
                    resetMode();
                    detectLocation();
                  }}
                  className={clsx(
                    'p-3 rounded-full transition-all',
                    type === 'LOCATION' ? 'bg-white dark:bg-stone-800' : 'bg-transparent'
                  )}
                  style={type === 'LOCATION' ? { shadowColor: '#000', shadowOpacity: 0.1, elevation: 1 } : {}}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#78716c" />
                  ) : (
                    <MapPin size={20} color={type === 'LOCATION' ? (isDark ? '#e7e5e4' : '#44403c') : '#a8a29e'} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => submit()}
                disabled={!canSubmit || isPending}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: canSubmit
                    ? isDark ? '#f5f5f4' : '#1c1917'
                    : isDark ? '#292524' : '#e5e5e5',
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                <Send
                  size={20}
                  color={canSubmit 
                    ? isDark ? '#1c1917' : '#fafaf9' 
                    : '#78716c'
                  }
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* AI / Loading Feedback */}
          {isPending ? (
            <View className="mt-12 items-center justify-center">
              <Animated.View 
                className="flex-row items-center gap-3 px-6 py-3 rounded-full border border-stone-100 dark:border-stone-800"
                style={[
                  { opacity: pulseAnim, transform: [{ scale: pulseAnim }] },
                  { backgroundColor: isDark ? 'rgba(28, 25, 23, 0.5)' : '#e7e5e4' }
                ]}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Sparkles size={18} color={isDark ? "#a8a29e" : "#57534e"} />
                </Animated.View>
                <Text className="text-sm font-medium text-stone-600 dark:text-stone-400 tracking-wide">
                  Distilling your moment...
                </Text>
              </Animated.View>
            </View>
          ) : lastInsight ? (
            <View className="mt-12 mb-10">
              <View className="flex-row justify-center items-center gap-2 mb-4 opacity-70">
                <Sparkles size={14} color="#a8a29e" />
                <Text className="text-xs uppercase tracking-[0.15em] text-stone-500">
                  Echo Reflection
                </Text>
              </View>

              <View className="p-8 rounded-[32px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <Text className="text-lg italic text-center text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
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