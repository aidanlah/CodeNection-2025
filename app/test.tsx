
import { PublicRoute } from "@/components/publicRoute";
import { Text, View } from "react-native";

export default function mapPage() {
  return (
    <PublicRoute>
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to map page!
      </Text>
    </View>
    </PublicRoute>
  );
}