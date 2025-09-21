import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/components/authContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();


  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              presentation: "card",
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen
              name="sign-in"
              options={{ headerShown: false, animation: "slide_from_left" }}
            />
            <Stack.Screen
              name="sign-up"
              options={{ headerShown: false, animation: "slide_from_right" }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
