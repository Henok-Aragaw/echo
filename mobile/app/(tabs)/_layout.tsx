import { Tabs } from 'expo-router';
import { Home, Clock, Sparkles, Settings as SettingsIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
            backgroundColor: isDark ? '#0c0a09' : '#ffffff', 
            borderTopColor: isDark ? '#292524' : '#e7e5e4', 
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
        },
        tabBarActiveTintColor: isDark ? '#fafaf9' : '#0c0a09', 
        tabBarInactiveTintColor: isDark ? '#78716c' : '#a8a29e', 
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
            tabBarIcon: ({ color }) => <Home size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="timeline" 
        options={{ 
            tabBarIcon: ({ color }) => <Clock size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="echoes" 
        options={{ 
            tabBarIcon: ({ color }) => <Sparkles size={24} color={color} /> 
        }} 
      />
       <Tabs.Screen 
        name="settings" 
        options={{ 
            tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}