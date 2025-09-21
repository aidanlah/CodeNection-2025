import React from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProtectedRoute } from '@/components/protectedRoute';

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const handleSOSPress = (): void => {
    console.log('SOS button pressed from tab bar');
    navigation.navigate('sos'); 
  };

  return (
    <View className="relative">
      <View className="bg-green-500 flex-row items-center px-4 py-2 pb-6">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined 
            ? options.tabBarLabel 
            : options.title !== undefined 
            ? options.title 
            : route.name;

          const isFocused = state.index === index;

          if (index === 2) {
            return <View key={route.key} className="flex-1" />;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
            switch (routeName) {
              case 'index':
              case '(home)':
                return 'home';
              case 'map':
                return 'location-outline';
              case 'notification':
                return 'notifications-outline';
              case 'profile':
                return 'person-outline';
              default:
                return 'ellipse-outline';
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center py-3"
              activeOpacity={0.7}
            >
              <Ionicons
                name={getIconName(route.name)}
                size={24}
                color={isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="absolute -top-6 left-1/2 -ml-10">
        <TouchableOpacity
          onPress={handleSOSPress}
          className="size-20 bg-red-500 rounded-2xl items-center justify-center shadow-lg active:scale-95"
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

export default function TabsLayout() {
  return (
    <ProtectedRoute>
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Location',
          tabBarLabel: 'Location',
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          tabBarLabel: 'Notification',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
}


