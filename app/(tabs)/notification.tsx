// notification.tsx - Updated with complete workflow
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { router } from 'expo-router';

// Notification interface defines structure for alerts and history items 
interface Notification {
  id: string;
  type: 'sos' | 'walk' | 'hazard' | 'completed' | 'volunteer_accepted';
  category: 'alerts' | 'history';
  title: string;
  message: string;
  timestamp: string;
  icon: keyof typeof Ionicons.glyphMap;
  volunteer?: string;
  location?: string;
  isUrgent?: boolean;
  requestId?: string; // To track which request this belongs to
  outfitDescription?: string; // For volunteer accepted notifications
  meetingPoint?: string; // Where volunteer is waiting
}

// Sample data for GuardU notifications
const initialNotifications: Notification[] = [
  // Alerts
  {
    id: '1',
    type: 'sos',
    category: 'alerts',
    title: 'SOS triggered near Library',
    message: 'Verified volunteer 🔒Ali responded.',
    timestamp: '11:36am 16/09/23',
    icon: 'warning',
    volunteer: 'Ali',
    location: 'Library',
    isUrgent: true,
  },
  {
    id: '2',
    type: 'walk',
    category: 'alerts',
    title: 'Walk-with-me request:',
    message: 'Ava has requested to walk with you.',
    timestamp: '11:36am 16/09/23',
    icon: 'people',
    volunteer: 'You',
    location: 'Main Campus',
    requestId: 'req_001', // Link to request
  },
  {
    id: '3',
    type: 'hazard',
    category: 'alerts',
    title: 'New hazard reported near Main Gate',
    message: 'Reported by student. Maintenance team has been notified.',
    timestamp: '11:36am 16/09/23',
    icon: 'alert-circle-sharp',
    location: 'Main Gate',
  },
  // History
  {
    id: '4',
    type: 'sos',
    category: 'history',
    title: 'SOS 21/8, 10:15pm',
    message: 'Responded by 🛡Security team',
    timestamp: '11:36am 16/09/23',
    icon: 'checkmark-circle',
  },
  {
    id: '5',
    type: 'walk',
    category: 'history',
    title: 'Completed: Walked with Ava',
    message: '(Verified volunteer).',
    timestamp: '11:36am 16/09/23',
    icon: 'checkmark-circle',
    volunteer: 'Mei',
  },
  {
    id: '6',
    type: 'hazard',
    category: 'history',
    title: 'Pothole fixed near Main Gate',
    message: 'The pothole you reported has been fixed. Thank you for helping keep our campus safe!',
    timestamp: '11:36am 16/09/23',
    icon: 'checkmark-circle',
    location: 'Main Gate',
  },
];

type TabType = 'alerts' | 'history';
type FilterType = 'all' | 'sos' | 'walk' | 'hazard';

const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('alerts');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [allNotifications, setAllNotifications] = useState<Notification[]>(initialNotifications);
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications.filter(n => n.category === 'alerts')
  );

  // Listen for navigation params when returning from request flow
  useEffect(() => {
    // This would typically listen to route params or global state changes
    // For now, we'll simulate the workflow with state management
  }, []);

  // Handle tab switch between 'alerts' and 'history'
  // Updates the visible notifications based on selected tab and current filter
  const handleTabChange = (tab: TabType) => {
    try {
      setActiveTab(tab);
      updateNotifications(tab, activeFilter);
    } catch (error) {
      console.log('Error changing tab:', error);
      setNotifications([]);
    }
  };

  // Handle filter change (e.g., 'sos', 'walk', 'hazard')
  // Updates the visible notifications based on current tab and selected filter
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setShowFilterDropdown(false);
    updateNotifications(activeTab, filter);
  };

  // Apply tab and filter to derive the visible notifications list
  const updateNotifications = (tab: TabType, filter: FilterType) => {
    // Filter by tab category first
    let filteredNotifications = allNotifications.filter(
      notification => notification.category === tab
    );

    // Apply type filter if not 'all'
    if (filter !== 'all') {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.type === filter
      );
    }

    setNotifications(filteredNotifications);
  };

  // Remove a notification by ID and refresh the visible list
  const removeNotification = (notificationId: string) => {
    const updatedNotifications = allNotifications.filter(n => n.id !== notificationId);
    setAllNotifications(updatedNotifications);
    updateNotifications(activeTab, activeFilter);
  };

  // Add a new 'volunteer_accepted' notification and refresh the visible list
  const addVolunteerAcceptedNotification = (requestId: string, volunteerName: string, outfitDescription: string, meetingPoint: string) => {
    const newNotification: Notification = {
      id: `volunteer_accepted_${Date.now()}`,
      type: 'volunteer_accepted',
      category: 'alerts',
      title: `${volunteerName} accepted your buddy request!`,
      message: `Outfit: ${outfitDescription}\nMeeting at: ${meetingPoint}`,
      timestamp: new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }),
      icon: 'person-add',
      volunteer: volunteerName,
      requestId: requestId,
      outfitDescription: outfitDescription,
      meetingPoint: meetingPoint,
      isUrgent: true,
    };

    const updatedNotifications = [...allNotifications, newNotification];
    setAllNotifications(updatedNotifications);
    updateNotifications(activeTab, activeFilter);
  };

  // Simulate receiving volunteer acceptance (this would normally come from your backend)
  const simulateVolunteerAcceptance = (requestId: string) => {
    setTimeout(() => {
      addVolunteerAcceptedNotification(
        requestId,
        'Mei Chen', 
        'Blue jacket, holding a green umbrella', 
        'Main Library entrance'
      );
    }, 3000); // 3 seconds delay to simulate the workflow
  };

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'sos':
        return {
          borderColor: 'border-red-500',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
        };
      case 'walk':
        return {
          borderColor: 'border-green-500',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
        };
      case 'volunteer_accepted':
        return {
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
        };
      case 'hazard':
        return {
          borderColor: 'border-yellow-500',
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
        };
      case 'completed':
        return {
          borderColor: 'border-purple-500',
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-100',
        };
      default:
        return {
          borderColor: 'border-gray-500',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
        };
    }
  };

  // Handle notification tap based on type and category
  const handleNotificationPress = (notification: Notification) => {
  // Handle walk request notifications for volunteers only
  if (notification.type === 'walk' && notification.category === 'alerts') {
    // Ideally, this should check user role (volunteer vs requester)
    // For now, we assume anyone clicking is a potential volunteer
    
    Alert.alert(
      'Walk Request',
      'You can accept this buddy request. Would you like to view the details?',
      [
        {
          text: 'View Details',
          onPress: () => {
            router.push({
              pathname: '/RequestDetailScreen',
              params: {
                requestId: notification.requestId || 'req_001',
                notificationId: notification.id,
              }
            });
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
    return;
  }

  // Handle volunteer accepted notifications (for requesters)
  if (notification.type === 'volunteer_accepted') {
    Alert.alert(
      notification.title,
      `Your buddy request has been accepted!\n\n${notification.message}\n\nTime: ${notification.timestamp}`,
      [
        {
          text: 'Start Walking',
          onPress: () => {
            // Navigate to walking/tracking screen
            Alert.alert('Walking Mode', 'Walking mode would start here with live tracking.');
          }
        },
        {
          text: 'Message Volunteer',
          onPress: () => {
            Alert.alert('Messaging', 'In-app messaging would open here.');
          }
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
    return;
  }

  // Default notification display
  Alert.alert(
    notification.title,
    `${notification.message}\n\nTime: ${notification.timestamp}${
      notification.location ? `\nLocation: ${notification.location}` : ''
    }${notification.volunteer ? `\nVolunteer: ${notification.volunteer}` : ''}`
  );
};
  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all': return 'All';
      case 'sos': return 'SOS Alerts';
      case 'walk': return 'Walk Requests';
      case 'hazard': return 'Hazard Reports';
      default: return 'All';
    }
  };

  // Render a single notification card with dynamic styling based on type
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const style = getNotificationStyle(item.type);
    
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`${style.bgColor} mx-4 my-2 p-4 rounded-xl border-l-4 ${style.borderColor} shadow-sm`}
      >
        <View className="flex-row items-start">
          <View className={`w-10 h-10 rounded-full ${style.iconBg} items-center justify-center mr-3`}>
            <Ionicons name={item.icon} size={20} color={style.iconColor.replace('text-', '#').replace('-600', '600').replace('-500', '500')} />
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-sm mb-1">
              {item.title}
            </Text>
            <Text className="text-gray-600 text-xs leading-relaxed mb-2">
              {item.message}
            </Text>
            
            {/* Volunteer/Location badges */}
            <View className="flex-row items-center mb-2">
              {item.type === 'walk' && item.volunteer && (
                <View className="bg-green-600 px-2 py-1 rounded-md mr-2">
                  <Text className="text-white text-xs font-medium">
                    👤 {item.volunteer}
                  </Text>
                </View>
              )}
              {item.type === 'volunteer_accepted' && item.outfitDescription && (
                <View className="bg-blue-600 px-2 py-1 rounded-md mr-2">
                  <Text className="text-white text-xs font-medium">
                    👔 Outfit Shared
                  </Text>
                </View>
              )}
              {item.type === 'hazard' && item.location && (
                <View className="bg-yellow-600 px-2 py-1 rounded-md mr-2">
                  <Text className="text-white text-xs font-medium">
                    📍 {item.location}
                  </Text>
                </View>
              )}
              {item.isUrgent && (
                <View className="bg-red-600 px-2 py-1 rounded-md">
                  <Text className="text-white text-xs font-medium">URGENT</Text>
                </View>
              )}
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1">{item.timestamp}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /** Render empty state when no notifications are available */
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Ionicons
        name={activeTab === 'alerts' ? 'notifications-outline' : 'time-outline'}
        size={64}
        color="#D1D5DB"
      />
      <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
        No {activeTab} yet
      </Text>
      <Text className="text-gray-400 text-center text-sm">
        When you have {activeTab}, they'll appear here to keep you informed about campus safety.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header */}
      <View className="bg-green-600" style={{ paddingTop: StatusBar.currentHeight || 44 }}>
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity className="p-2" onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white text-lg font-semibold">Notifications</Text>
            
            <TouchableOpacity className="p-2">
              <View>
                <Ionicons name="notifications" size={24} color="white" />
                {notifications.some(n => n.isUrgent) && (
                  <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Separator Line */}
        <View className="border-b border-gray-300 mx-4"></View>
      </View>

      {/* Tabs and Filter Section */}
      <View className="bg-gray-100 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          {/* Tabs */}
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => handleTabChange('alerts')}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeTab === 'alerts'
                  ? 'bg-green-600'
                  : 'bg-gray-200'
              }`}
            >
              <Text className={`font-semibold ${
                activeTab === 'alerts' ? 'text-white' : 'text-gray-600'
              }`}>
                Alerts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleTabChange('history')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'history'
                  ? 'bg-green-600'
                  : 'bg-gray-200'
              }`}
            >
              <Text className={`font-semibold ${
                activeTab === 'history' ? 'text-white' : 'text-gray-600'
              }`}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Button */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-white border border-gray-300 px-3 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="filter" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2">{getFilterLabel(activeFilter)}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" className="ml-1" />
            </TouchableOpacity>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <View className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                {(['all', 'sos', 'walk', 'hazard'] as FilterType[]).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => handleFilterChange(filter)}
                    className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                      activeFilter === filter ? 'bg-green-50' : ''
                    }`}
                  >
                    <Text className={`text-sm ${
                      activeFilter === filter ? 'text-green-600 font-medium' : 'text-gray-700'
                    }`}>
                      {getFilterLabel(filter)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={() => (
          <View className="bg-green-50 border-l-4 border-green-600 mx-4 mt-4 mb-2 p-4 rounded-lg">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="information-circle" size={24} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-green-800 font-semibold text-sm mb-1">
                  Stay Informed
                </Text>
                <Text className="text-green-700 text-xs">
                  Get real-time updates on campus safety alerts and volunteer responses.
                </Text>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationCenter;