import { Image, Text } from "react-native"
import { View } from "react-native-reanimated/lib/typescript/Animated"


export default function requestSuccessPage() {
    return(
        <View className="flex-1 items-center justify-center h-full">
        <Image
        source={require("@/assets/images/buddy2.png")}></Image>
        <Text></Text>
        </View>
    )
}