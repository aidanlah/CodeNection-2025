import { router } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';

// Props for customizing SOS button behavior and appearance
interface SOSButtonProps {
  onPress?: () => void; // Optional callback when button is pressed
  buttonImage?: ImageSourcePropType; // Optional custom image for the button
  disabled?: boolean; // Disable interaction if true
}

const SOSButton: React.FC<SOSButtonProps> = ({ 
  onPress, 
  buttonImage, 
  disabled = false 
}) => {
  // Handle button press: navigate to SOS screen and trigger optional callback
  const handleSOSPress = (): void => {
    if (disabled) return;
    // Navigate to SOS tab
    router.push('/(tabs)/sos')

    // Optional haptic feedback (commented out for now)
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Trigger any custom logic passed in
    if (onPress) {
      onPress();
    }
  };

  return (
     // Centered SOS button with image and caption
    <View className="items-center mb-16">
      {/** Touchable SOS button with dynamic styling */}
      <TouchableOpacity
        onPress={handleSOSPress}
        disabled={disabled}
        className={`w-96 h-96 rounded-full shadow-lg ${
          disabled ? 'opacity-50' : 'active:scale-95'
        }`}
        activeOpacity={disabled ? 1 : 0.8}
      >
        {/** SOS image (default or custom) */}
        <Image
          source={buttonImage || require('@/assets/images/sos.png')} 
          className="w-full h-full rounded-3xl"
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      {/** Caption explaining SOS behavior */}
      <Text className="text-gray-600 text-sm text-center leading-5 px-10 mt-5">
        Tap SOS in urgent situations. Location and audio shared with Security & verified volunteers.
      </Text>
    </View>
  );
};

export default SOSButton;