import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type FragmentType = 'text' | 'image' | 'link' | 'location';

export function useCapture() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<FragmentType>('text');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [lastInsight, setLastInsight] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const resetMode = () => {
    setType('text');
    setMediaUri(null);
    setContent('');
    setIsLocating(false);
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'You need to allow access to your photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
        setType('image');
        if (!content) setContent(''); 
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
      const location = await Location.getCurrentPositionAsync({});
      let addressString = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
      try {
        const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
        if (address[0]) {
            addressString = `${address[0].city || ''}, ${address[0].region || address[0].country || ''}`;
            if (addressString.startsWith(', ')) addressString = addressString.substring(2);
        }
      } catch (e) {}
      setContent(addressString);
      setType('location');
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch your location.');
    } finally {
      setIsLocating(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('type', type.toUpperCase());
      const finalContent = content.trim() || (type === 'image' ? 'Image capture' : '');
      formData.append('content', finalContent);

      if (type === 'image' && mediaUri) {
        const filename = mediaUri.split('/').pop() ?? 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: mediaUri,
          name: filename,
          type: fileType,
        } as any); 
      }

      const { data } = await api.post('/fragments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      console.error(error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Something went wrong.');
    },
  });

  const submit = () => {
    mutation.mutate();
  };

  return {
    content,
    setContent,
    type,
    setType,
    mediaUri,
    pickImage,
    detectLocation,
    isLocating,
    submit,
    isPending: mutation.isPending,
    lastInsight,
    resetMode,
  };
}