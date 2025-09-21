import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function HomeLayout() {
  return (
    <SafeAreaProvider>
    <Stack screenOptions={{
        
      }}>
      <Stack.Screen name="index" options={{ headerShown: false, animation: "slide_from_left" }}/>
      <Stack.Screen name="buddyUp" />
    </Stack>
    </SafeAreaProvider>
  );
}
