import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, MapPin, Link as LinkIcon, Type, Send } from 'lucide-react-native';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function HomeScreen() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'image' | 'link' | 'location'>('text');
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        content,
        type,
      };
      const { data } = await api.post('/fragments', payload);
      return data;
    },
    onSuccess: (data) => {
      setContent('');
      setLastSummary(data.insight?.content || "Saved to memory.");
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
    onError: () => {
      Alert.alert("Error", "Could not save fragment.");
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-stone-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-10">
          
          {/* Header */}
          <Text className="text-stone-400 font-medium uppercase tracking-widest text-xs mb-2">
            Capture
          </Text>
          <Text className="text-3xl text-stone-100 font-light mb-8">
            What just happened?
          </Text>

          {/* Input Area */}
          <View className="bg-stone-900 rounded-3xl p-4 border border-stone-800 min-h-[200px]">
            <TextInput 
              className="text-stone-100 text-lg font-light leading-7 flex-1"
              multiline
              placeholder="Write a thought..."
              placeholderTextColor="#57534e"
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            
            {/* Type Selectors */}
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-stone-800">
              <View className="flex-row space-x-4">
                <TouchableOpacity onPress={() => setType('text')}>
                  <Type size={20} color={type === 'text' ? '#fafaf9' : '#57534e'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setType('image')}>
                  <Image size={20} color={type === 'image' ? '#fafaf9' : '#57534e'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setType('link')}>
                  <LinkIcon size={20} color={type === 'link' ? '#fafaf9' : '#57534e'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setType('location')}>
                  <MapPin size={20} color={type === 'location' ? '#fafaf9' : '#57534e'} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => mutate()}
                disabled={!content || isPending}
                className={`w-10 h-10 rounded-full items-center justify-center ${content ? 'bg-stone-100' : 'bg-stone-800'}`}
              >
                {isPending ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <Send size={18} color={content ? '#000' : '#57534e'} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Reflection Output */}
          {lastSummary && (
            <View className="mt-8 bg-stone-900/50 p-6 rounded-2xl border border-stone-800/50">
               <View className="flex-row items-center mb-3">
                  <Text className="text-lg mr-2">✨</Text>
                  <Text className="text-stone-400 text-xs uppercase tracking-wider">Reflection</Text>
               </View>
               <Text className="text-stone-300 italic font-light leading-6">
                 &quot;{lastSummary}&quot;
               </Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}