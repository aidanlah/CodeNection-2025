import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function () {
  
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#16a34a', // Green header background
        },
        headerTintColor: '#ffffff', // White back button and text
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false, 
            animation: "slide_from_left" 
          }}
        />
        <Stack.Screen 
          name="buddyUp" 
          options={{
            title: "Buddy Up", // Custom title instead of "buddyUp"
            headerBackTitle: "", // Remove back button text
          }}
        />

        <Stack.Screen 
          name="hazardReport" 
          options={{
            title: "Hazard Report", // Custom title instead of "buddyUp"
            headerBackTitle: "", // Remove back button text
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
