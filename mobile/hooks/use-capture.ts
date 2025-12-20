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
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
        setType('IMAGE');
        // We do not clear content here so users can add a caption
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access.');
        return;
      }
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
      } catch (e) {
        // Fallback to coordinates if geocoding fails
      }

      setContent(address);
      setType('LOCATION');
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch your location.');
    } finally {
      setIsLocating(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      
      // 1. Force strict Type String
      const finalType = mediaUri ? 'IMAGE' : type;
      formData.append('type', finalType);

      // 2. Ensure Content is never empty for the DTO
      const finalContent = content.trim() || (mediaUri ? 'Image Snapshot' : '');
      if (!finalContent && !mediaUri) throw new Error("Please add some text.");
      
      formData.append('content', finalContent);

      // 3. Handle File Upload
      if (mediaUri) {
        const filename = mediaUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        // @ts-ignore: React Native FormData expects an object with uri, name, type
        formData.append('image', {
          uri: Platform.OS === 'ios' ? mediaUri.replace('file://', '') : mediaUri,
          name: filename,
          type: mimeType,
        }); 
      }

      // 4. Send Request
      const { data } = await api.post('/fragments', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json' 
        },
        transformRequest: (data) => data, 
      });
      return data;
    },
    onSuccess: async (data) => {
      Keyboard.dismiss();
      resetMode();
      setLastInsight(data?.insight?.content ?? null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['timeline'] }),
        queryClient.invalidateQueries({ queryKey: ['echoes'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-stats'] })
      ]);
      
      if (!data?.insight) {
        Alert.alert("Saved", "Your moment has been captured.");
      }
    },
    onError: (error: any) => {
      console.error("Upload Error:", error);
      const msg = error.response?.data?.message || error.message || 'Something went wrong.';
      Alert.alert('Upload Failed', Array.isArray(msg) ? msg[0] : msg);
    },
  });

  // Safe wrapper that ignores event arguments
  const submit = () => {
    mutation.mutate(undefined);
  };

  return {
    content, setContent,
    type, setType,
    mediaUri, pickImage,
    detectLocation, isLocating,
    submit, 
    isPending: mutation.isPending,
    lastInsight,
    resetMode,
  };
}