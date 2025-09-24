import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  disabled = false,
  title = "BUDDY WALK",
  variant = 'primary'
}) => {
  const handleButtonPress = (): void => {
    if (disabled) return;
    
    console.log('button pressed');
    
    if (onPress) {
      onPress();
    }
  };

  const getButtonStyles = (): string => {
    const baseStyles = "py-5 px-6 rounded-xl shadow-md";
    
    if (disabled) {
      return `${baseStyles} bg-gray-400 opacity-60`;
    }
    
    if (variant === 'secondary') {
      return `${baseStyles} bg-white border-2 border-green-500 active:scale-95`;
    }
    
    return `${baseStyles} bg-green-600 active:scale-95`;
  };

  const getTextStyles = (): string => {
    if (disabled) {
      return "text-gray-600 text-3xl font-bold tracking-wider";
    }
    
    if (variant === 'secondary') {
      return "text-green-600 text-base font-bold tracking-wider";
    }
    
    return "text-white text-3xl font-medium tracking-wider";
  };

  return (
    <View className="w-96">
      <TouchableOpacity
        onPress={handleButtonPress}
        disabled={disabled}
        className={getButtonStyles()}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text className={`${getTextStyles()} text-center`}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;