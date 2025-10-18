import Button from "@/components/button";
import SOSButton from "@/components/sos-button";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function HomeTab() {
  // Set status bar style when screen is focused - when a screen is "focused" in React, it means the user is currently viewing and interacting with that screen
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#000000', true);
      }
    }, [])
  );
  

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      {/** Explicit status bar config for iOS and Android */}
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" translucent={false} />  

      {/** Central SOS button with image */}
      <SOSButton buttonImage={require("@/assets/images/sos.png")} />

      {/** Action buttons for navigation */}
      <View className="flex flex-col gap-2">
        {/** Navigate to Walk-With-Me request screen */}
        <Button
          title="WALK-WITH-ME"
          onPress={() => router.push("/walkWithMe")}
        />

        {/** Navigate to Hazard Report screen */}
        <Button
          title="HAZARD REPORT"
          onPress={() => router.push("./hazardReport")}
        />
      </View>
    </SafeAreaView>
  );
}