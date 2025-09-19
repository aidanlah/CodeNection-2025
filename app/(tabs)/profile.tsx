
import Button from "@/components/button";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function profilePage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to profile page!
      </Text>
    <View className="m-6">
      <Button title="Log out" variant="secondary" onPress={() => router.push("/sign-up")}/>
      </View>
    </View>
  );
}