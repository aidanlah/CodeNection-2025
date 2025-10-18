import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Props for customizing tab behavior and SOS action
interface TabBarProps {
  activeTab?: string; // Currently active tab ID
  onTabPress?: (tab: string) => void; // Callback when a tab is pressed
  onSOSPress?: () => void; // Callback when SOS is pressed
}

// Tab item structure: ID and icon name
type TabItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TabBar: React.FC<TabBarProps> = ({ 
  activeTab = 'home', 
  onTabPress,
  onSOSPress 
}) => {
  // Define tab items (excluding SOS)
  const tabs: TabItem[] = [
    { id: 'home', icon: 'home' },
    { id: 'location', icon: 'location-outline' },
    { id: 'chat', icon: 'notifications-outline' },
    { id: 'profile', icon: 'person-outline' },
  ];

 // Handle tab press and forward to parent
  const handleTabPress = (tabId: string): void => {
    console.log(`Tab pressed: ${tabId}`);
    if (onTabPress) {
      onTabPress(tabId);
    }
  };

  // Handle SOS button press and forward to parent
  const handleSOSPress = (): void => {
    console.log('SOS button pressed from tab bar');
    // Optional haptic feedback (commented out)
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (onSOSPress) {
      onSOSPress();
    }
  };

  // Render individual tab item with active styling
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
    // Tab bar container with SOS button overlay
    <View className="relative">
      <View className="bg-green-600 flex-row items-center px-4 py-2 pb-6">
         {/** Render first two tabs (home & location) on the left side of the tab bar*/}
        {tabs.slice(0, 2).map((tab, index) => renderTabItem(tab, index))}
        
        {/** Spacer for SOS button */}
        <View className="flex-1 items-center justify-center">
        </View>
        
        {/** Render last two tabs */}
        {tabs.slice(2).map((tab, index) => renderTabItem(tab, index + 2))}
      </View>

    {/** Floating SOS button centered above tab bar */}
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