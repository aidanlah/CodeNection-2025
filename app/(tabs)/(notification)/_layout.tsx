import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function NotificationLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{}}>
        <Stack.Screen 
          name="notification" 
          options={{ 
            headerShown: false, 
            animation: "slide_from_left" 
          }}
        />
        <Stack.Screen 
          name="requestDetailScreen" 
          options={{ 
            headerShown: true,
            headerStyle: {
              backgroundColor: '#16a34a',
            },
            headerTintColor: 'white',
            headerBackTitle: '',
            headerTitle: 'Buddy Request',
            animation: "slide_from_right"
          }}
        />
        <Stack.Screen 
          name="outfitPromptScreen" 
          options={{ 
            headerShown: true,
            headerStyle: {
              backgroundColor: '#16a34a',
            },
            headerTintColor: 'white',
            headerBackTitle: '',
            headerTitle: 'Volunteer Details',
            animation: "slide_from_right"
          }}
        />

      </Stack>
    </SafeAreaProvider>
  );
}