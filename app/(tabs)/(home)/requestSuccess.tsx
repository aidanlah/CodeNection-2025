import { db, auth } from "@/firebase.config";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
// import { View } from "react-native-reanimated/lib/typescript/Animated"

export default function requestSuccessPage() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [finding, setFinding] = useState<boolean>(true);
  const fetchData = async () => {
    try {
      // const id = auth.currentUser?.uid;

      const docRef = doc(db, "buddyUp", id);
      console.log("params: ", id)
      getDoc(docRef).then((documentSnapshot) => {
        if (documentSnapshot.exists()) {
            console.log('getting data')
          const hasVolunteer = documentSnapshot.get("hasVolunteer"); // Using .get() for a specific field
          console.log("has volunteer:", hasVolunteer);
          setFinding(false);
        } else {
          console.log("No such user document!");
        }
      });
    } catch (error: any) {
      console.log("Error fetching data:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <View className="flex-1 items-center justify-center h-full bg-white-500">
      <Image
        source={require("@/assets/images/buddy2.png")}
        className="size-80"
        resizeMode="cover"
      ></Image>
      {(finding) ? (
        <View>
      <Text className="text-gray-600 text-base font-bold">
        Waiting for Volunteer to accept ...
      </Text>
      </View>
      ) : (
        <View>
        <Text className="text-gray-600 text-base font-bold">
          Volunteer en route
        </Text>
        </View>
      )}
    </View>
  );
}
