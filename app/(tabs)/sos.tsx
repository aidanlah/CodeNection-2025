import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Button from "@/components/button";

export default function sosPage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="flex flex-col gap-5">
        <Button
          title="ROBBERY/THEFT"
          onPress={() => console.log("ROBBERY/THEF pressed")}
        ></Button>
        <Button
          title="FIRE"
          onPress={() => console.log("FIRE pressed")}
        ></Button>
        <Button
          title="ACCIDENT"
          onPress={() => console.log("ACCIDENT pressed")}
        ></Button>
        <Button
          title="MEDICAL"
          onPress={() => console.log("MEDICAL pressed")}
        ></Button>
        <Button
          title="OTHERS"
          onPress={() => console.log("OTHERS pressed")}
        ></Button>
      </View>
    </View>
  );
}
