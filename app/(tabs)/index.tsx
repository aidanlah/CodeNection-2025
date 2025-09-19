import { useState } from "react";
import { Text, Pressable, View } from "react-native";
import { colorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import SOSButton from "@/components/sos-button";
import Button from "@/components/button";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    colorScheme.set(newTheme);
  };

  const handlePress = () => {
    // router.push('/(tabs)/sos'),
    console.log("hello");
  };

  const handleBuddyWalk = () => {
    console.log("BUDDY WALK pressed");
    router.push("/modal");
  };

  return (
    <SafeAreaView
      className={`flex-1 ${currentTheme === "dark" ? "bg-gray-900" : "bg-white"} justify-center items-center`}
    >
      <SOSButton
        buttonImage={require("@/assets/images/sos.png")}
        onPress={() => {
          handlePress;
        }}
      />

      <View className="flex flex-col gap-2">
        <Button title="BUDDY WALK" onPress={() => router.push("/buddyUp")} />
        <Button
          title="HAZARD REPORT"
          onPress={() => console.log("HAZARD REPORT pressed")}
        />
      </View>
    </SafeAreaView>
  );
}
