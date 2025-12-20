import { useState } from 'react';
import { Alert, Keyboard, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type FragmentType = 'TEXT' | 'IMAGE' | 'LINK' | 'LOCATION';

export function useCapture() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<FragmentType>('TEXT');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [lastInsight, setLastInsight] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const resetMode = () => {
    setType('TEXT');
    setMediaUri(null);
    setContent('');
    setIsLocating(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission needed', 'Please allow photo access.');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
        setType('IMAGE');
  
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load image.');
    }
  };

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission Denied', 'Allow location access.');
      
      const loc = await Location.getCurrentPositionAsync({});
      let address = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      
      try {
        const geo = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
        if (geo[0]) {
            address = `${geo[0].city || ''}, ${geo[0].region || geo[0].country || ''}`.replace(/^, /, '');
        }
      } catch (e) {}

      setContent(address);
      setType('LOCATION');
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setIsLocating(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      const finalType = mediaUri ? 'IMAGE' : type; 
      formData.append('type', finalType);


      const finalContent = content.trim() || (mediaUri ? 'Image Snapshot' : '');
      if (!finalContent) throw new Error("Please enter some text.");
      
      formData.append('content', finalContent);

      if (mediaUri) {
        const filename = mediaUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: Platform.OS === 'ios' ? mediaUri.replace('file://', '') : mediaUri,
          name: filename,
          type: mimeType,
        } as any);
      }

      const { data } = await api.post('/fragments', formData, {
        headers: { Accept: 'application/json' },
        transformRequest: (data) => data,
      });
      return data;
    },
    onSuccess: (data) => {
      Keyboard.dismiss();
      resetMode();
      setLastInsight(data?.insight?.content ?? null);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      if (!data?.insight) Alert.alert("Success", "Fragment saved.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Upload failed.";
      Alert.alert("Error", Array.isArray(msg) ? msg[0] : msg);
    }
  });

  return {
    content, setContent,
    type, setType,
    mediaUri, pickImage,
    detectLocation, isLocating,
    submit: mutation.mutate,
    isPending: mutation.isPending,
    lastInsight,
    resetMode,
  };
}