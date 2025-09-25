import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function HomeLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{}}>
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false, 
            animation: "slide_from_left" 
          }}
        />
        <Stack.Screen 
          name="emergencyContacts" 
          options={{ 
            headerShown: true,
            headerStyle: {
              backgroundColor: '#16a34a',
            },
            headerTintColor: 'white',
            headerBackTitle: '', // Correct way to hide the title
            headerTitle: 'Emergency Contacts',
            animation: "slide_from_right"
          }}
        />
        <Stack.Screen 
          name="volunteerSignUp" 
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#16a34a',
            },
            headerTintColor: 'white',
            headerBackTitle: '', // Correct way to hide the title
            headerTitle: 'Volunteer Sign Up',
            animation: "slide_from_right"
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}