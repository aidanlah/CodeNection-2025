import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Image, View, Text, ImageSourcePropType } from 'react-native';

interface SOSButtonProps {
  onPress?: () => void;
  buttonImage?: ImageSourcePropType;
  disabled?: boolean;
}

const SOSButton: React.FC<SOSButtonProps> = ({ 
  onPress, 
  buttonImage, 
  disabled = false 
}) => {
  const handleSOSPress = (): void => {
    if (disabled) return;
    router.push('/(tabs)/sos')
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <View className="items-center mb-16">
      <TouchableOpacity
        onPress={handleSOSPress}
        disabled={disabled}
        className={`w-96 h-96 rounded-full shadow-lg ${
          disabled ? 'opacity-50' : 'active:scale-95'
        }`}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Image
          source={buttonImage || require('@/assets/images/sos.png')} 
          className="w-full h-full rounded-3xl"
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <Text className="text-gray-600 text-sm text-center leading-5 px-10 mt-5">
        Tap SOS in urgent situations. Location and audio shared with Security & verified volunteers.
      </Text>
    </View>
  );
};

export default SOSButton;