
import { auth } from "@/firebase.config";

import { signOut } from "firebase/auth";

import { Text, View, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function profilePage() {
  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);

      console.log("user logged out");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

 

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to profile page!
      </Text>
      <View className="w-1/2 m-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="py-4 rounded-xl bg-green-500 active:scale-98"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg text-center">
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
