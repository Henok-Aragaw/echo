import React from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  ActivityIndicator, Image as RNImage, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, MapPin, Link as LinkIcon, Type, Send, X, Sparkles } from 'lucide-react-native';
import { useCapture } from '@/hooks/use-capture';
import clsx from 'clsx';

export default function HomeScreen() {
  const { 
    content, setContent, type, setType, mediaUri, 
    pickImage, detectLocation, isLocating, 
    submit, isPending, lastInsight, resetMode
  } = useCapture();

  // Helper to check if we can submit
  const canSubmit = (content.length > 0 || mediaUri !== null);

  return (
    <SafeAreaView className="flex-1 bg-stone-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-8">
          
          <View className="mb-8">
            <Text className="text-stone-400 font-medium uppercase tracking-[0.2em] text-xs mb-3">
              Daily Capture
            </Text>
            <Text className="text-4xl text-stone-100 font-thin leading-tight">
              What is happening <Text className="text-stone-500">now?</Text>
            </Text>
          </View>

          {/* 
             CRITICAL FIX: 
             Removed 'transition-all'.
             Used standard className for static styles.
          */}
          <View className="rounded-[32px] p-5 border min-h-[240px] flex-col justify-between bg-stone-900/40 border-stone-800">
            
            <View className="flex-1 relative">
              {type === 'image' && mediaUri ? (
                <View className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-stone-950">
                  <RNImage source={{ uri: mediaUri }} className="w-full h-full opacity-80" resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={resetMode}
                    className="absolute top-3 right-3 bg-stone-900/80 p-2 rounded-full backdrop-blur-md"
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                  <TextInput 
                    className="absolute bottom-0 w-full bg-stone-900/80 text-stone-100 px-4 py-3 text-sm font-light"
                    placeholder="Add a caption..."
                    placeholderTextColor="#78716c"
                    value={content}
                    onChangeText={setContent}
                  />
                </View>
              ) : (
                <TextInput 
                  // CRITICAL FIX: Removed dynamic className logic here
                  className="text-stone-100 text-xl font-light leading-8 flex-1 pb-4"
                  multiline
                  placeholder={
                    isLocating ? "Locating..." :
                    type === 'link' ? "Paste a URL..." :
                    type === 'location' ? "Where are you?" :
                    "Pour your thoughts here..."
                  }
                  placeholderTextColor="#44403c"
                  value={content}
                  onChangeText={setContent}
                  textAlignVertical="top"
                  autoFocus={false}
                />
              )}
            </View>

            <View className="flex-row justify-between items-end pt-4 border-t border-stone-800/50">
              <View className="flex-row gap-4 bg-stone-950/50 p-2 rounded-full border border-stone-800/50">
                <TouchableOpacity 
                  onPress={() => { resetMode(); setType('text'); }}
                  className={clsx("p-2 rounded-full", type === 'text' && "bg-stone-800")}
                >
                  <Type size={20} color={type === 'text' ? '#fff' : '#57534e'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={pickImage}
                  className={clsx("p-2 rounded-full", type === 'image' && "bg-stone-800")}
                >
                  <Image size={20} color={type === 'image' ? '#fff' : '#57534e'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { resetMode(); setType('link'); }}
                  className={clsx("p-2 rounded-full", type === 'link' && "bg-stone-800")}
                >
                  <LinkIcon size={20} color={type === 'link' ? '#fff' : '#57534e'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={detectLocation}
                  className={clsx("p-2 rounded-full", type === 'location' && "bg-stone-800")}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MapPin size={20} color={type === 'location' ? '#fff' : '#57534e'} />
                  )}
                </TouchableOpacity>
              </View>

              {/* 
                 CRITICAL FIX: 
                 We use style={} for background color instead of clsx/className.
                 This prevents NativeWind from recalculating on every keystroke.
              */}
              <TouchableOpacity 
                onPress={() => submit()}
                disabled={!canSubmit || isPending}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: canSubmit ? '#f5f5f4' : '#292524', // stone-100 vs stone-800
                  opacity: canSubmit ? 1 : 0.5
                }}
              >
                {isPending ? (
                  <ActivityIndicator color="#0c0a09" />
                ) : (
                  <Send size={24} color={canSubmit ? "#0c0a09" : "#78716c"} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {lastInsight && (
            <View className="mt-10 mx-2">
              <View className="flex-row items-center justify-center mb-4 space-x-2">
                 <Sparkles size={14} color="#a8a29e" />
                 <Text className="text-stone-500 text-xs uppercase tracking-widest text-center">
                   Echo Reflection
                 </Text>
              </View>
              
              <View className="bg-gradient-to-b from-stone-900 to-stone-950 p-8 rounded-[32px] border border-stone-800/50 shadow-2xl">
                 <Text className="text-stone-300 text-xl font-light italic leading-9 text-center">
                   &quot;{lastInsight}&quot;
                 </Text>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}