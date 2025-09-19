import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabBarProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onSOSPress?: () => void;
}

type TabItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TabBar: React.FC<TabBarProps> = ({ 
  activeTab = 'home', 
  onTabPress,
  onSOSPress 
}) => {
  const tabs: TabItem[] = [
    { id: 'home', icon: 'home' },
    { id: 'location', icon: 'location-outline' },
    { id: 'chat', icon: 'chatbubble-outline' },
    { id: 'profile', icon: 'person-outline' },
  ];

  const handleTabPress = (tabId: string): void => {
    console.log(`Tab pressed: ${tabId}`);
    if (onTabPress) {
      onTabPress(tabId);
    }
  };

  const handleSOSPress = (): void => {
    console.log('SOS button pressed from tab bar');
    
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (onSOSPress) {
      onSOSPress();
    }
  };

  const renderTabItem = (tab: TabItem, index: number): React.ReactNode => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        onPress={() => handleTabPress(tab.id)}
        className="flex-1 items-center justify-center py-3"
        activeOpacity={0.7}
      >
        <Ionicons
          name={tab.icon}
          size={24}
          color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="relative">
      <View className="bg-green-500 flex-row items-center px-4 py-2 pb-6">
        {tabs.slice(0, 2).map((tab, index) => renderTabItem(tab, index))}
        
        <View className="flex-1 items-center justify-center">
        </View>
        
        {tabs.slice(2).map((tab, index) => renderTabItem(tab, index + 2))}
      </View>

      <View className="absolute -top-6 left-1/2 -ml-8">
        <TouchableOpacity
          onPress={handleSOSPress}
          className="w-16 h-16 bg-red-500 rounded-2xl items-center justify-center shadow-lg active:scale-95"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-sm tracking-wider">
            SOS
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TabBar;