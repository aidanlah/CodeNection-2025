import Button from "@/components/button";
import SOSButton from "@/components/sos-button";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeTab() {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      {/* Make status bar icons black */}
      <StatusBar style="dark" />  

      <SOSButton buttonImage={require("@/assets/images/sos.png")} />

      <View className="flex flex-col gap-2">
        <Button
          title="BUDDY WALK"
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
