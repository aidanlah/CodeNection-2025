import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function () {
  
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#16a34a',
        },
        headerTintColor: '#ffffff', 
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
          name="walkWithMe" 
          options={{
            title: "walkWithMe", 
            headerBackTitle: "", 
          }}
        />

        <Stack.Screen 
          name="hazardReport" 
          options={{
            title: "Hazard Report", 
            headerBackTitle: "", 
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
