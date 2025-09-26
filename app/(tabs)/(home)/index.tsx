import Button from "@/components/button";
import SOSButton from "@/components/sos-button";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function HomeTab() {
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
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" translucent={false} />  

      <SOSButton buttonImage={require("@/assets/images/sos.png")} />

      <View className="flex flex-col gap-2">
        <Button
          title="BUDDY UP"
          onPress={() => router.push("/buddyUp")}
        />
        <Button
          title="HAZARD REPORT"
          onPress={() => router.push("./hazardReport")}
        />
      </View>
    </SafeAreaView>
  );
}