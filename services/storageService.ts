import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Dynamic import for SecureStore (only available in production builds)
let SecureStore: any = null;
let isSecureStoreAvailable = false;

// Check if SecureStore is available
const initializeSecureStore = async () => {
  try {
    if (Platform.OS !== 'web') {
      SecureStore = require('expo-secure-store');
      // Test if SecureStore actually works
      await SecureStore.setItemAsync('test_key', 'test_value');
      await SecureStore.deleteItemAsync('test_key');
      isSecureStoreAvailable = true;
      console.log('✅ SecureStore available - using encrypted storage');
    }
  } catch (error) {
    console.log('📱 SecureStore not available - falling back to AsyncStorage');
    isSecureStoreAvailable = false;
  }
};

// Initialize on module load
initializeSecureStore();

class UniversalStorageService {
  // Storage keys
  private static readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    BIOMETRIC_ENABLED: 'biometric_enabled',
  };

  // Prefix for AsyncStorage to avoid conflicts
  private static readonly ASYNC_PREFIX = '@SafetyApp:';

  // Check if SecureStore is available
  static isSecureStoreSupported(): boolean {
    return isSecureStoreAvailable;
  }

  // Generic store method
  private static async storeItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable && SecureStore) {
        // Use SecureStore if available (production builds)
        await SecureStore.setItemAsync(key, value);
        console.log(`🔐 Stored ${key} in SecureStore`);
      } else {
        // Fallback to AsyncStorage (Expo Go)
        await AsyncStorage.setItem(`${this.ASYNC_PREFIX}${key}`, value);
        console.log(`📱 Stored ${key} in AsyncStorage`);
      }
    } catch (error) {
      console.error(`❌ Error storing ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  // Generic get method
  private static async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable && SecureStore) {
        // Use SecureStore if available
        const value = await SecureStore.getItemAsync(key);
        console.log(`🔐 Retrieved ${key} from SecureStore`);
        return value;
      } else {
        // Fallback to AsyncStorage
        const value = await AsyncStorage.getItem(`${this.ASYNC_PREFIX}${key}`);
        console.log(`📱 Retrieved ${key} from AsyncStorage`);
        return value;
      }
    } catch (error) {
      console.error(`❌ Error getting ${key}:`, error);
      return null;
    }
  }

  // Generic delete method
  private static async deleteItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable && SecureStore) {
        await SecureStore.deleteItemAsync(key);
        console.log(`🗑️ Deleted ${key} from SecureStore`);
      } else {
        await AsyncStorage.removeItem(`${this.ASYNC_PREFIX}${key}`);
        console.log(`🗑️ Deleted ${key} from AsyncStorage`);
      }
    } catch (error) {
      console.error(`❌ Error deleting ${key}:`, error);
    }
  }

  // Store auth token
  static async storeAuthToken(token: string): Promise<void> {
    return this.storeItem(this.KEYS.AUTH_TOKEN, token);
  }

  // Get auth token
  static async getAuthToken(): Promise<string | null> {
    return this.getItem(this.KEYS.AUTH_TOKEN);
  }

  // Store user data
  static async storeUserData(userData: any): Promise<void> {
    return this.storeItem(this.KEYS.USER_DATA, JSON.stringify(userData));
  }

  // Get user data
  static async getUserData(): Promise<any | null> {
    try {
      const data = await this.getItem(this.KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Store refresh token
  static async storeRefreshToken(token: string): Promise<void> {
    return this.storeItem(this.KEYS.REFRESH_TOKEN, token);
  }

  // Get refresh token
  static async getRefreshToken(): Promise<string | null> {
    return this.getItem(this.KEYS.REFRESH_TOKEN);
  }

  // Store user preferences
  static async storeUserPreferences(preferences: any): Promise<void> {
    return this.storeItem(this.KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  }

  // Get user preferences
  static async getUserPreferences(): Promise<any | null> {
    try {
      const data = await this.getItem(this.KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user preferences:', error);
      return null;
    }
  }

  // Clear all stored data
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.deleteItem(this.KEYS.AUTH_TOKEN),
        this.deleteItem(this.KEYS.USER_DATA),
        this.deleteItem(this.KEYS.REFRESH_TOKEN),
        this.deleteItem(this.KEYS.USER_PREFERENCES),
      ]);
      console.log('🧹 Cleared all stored data');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
    }
  }

  // Get storage info for debugging
  static getStorageInfo(): {
    type: 'SecureStore' | 'AsyncStorage';
    isSecure: boolean;
    platform: string;
  } {
    return {
      type: isSecureStoreAvailable ? 'SecureStore' : 'AsyncStorage',
      isSecure: isSecureStoreAvailable,
      platform: Platform.OS,
    };
  }

  // Migration helper: Move data from AsyncStorage to SecureStore
  static async migrateToSecureStore(): Promise<void> {
    if (!isSecureStoreAvailable || !SecureStore) {
      console.log('SecureStore not available, skipping migration');
      return;
    }

    try {
      console.log('🔄 Migrating data to SecureStore...');
      
      const keysToMigrate = Object.values(this.KEYS);
      
      for (const key of keysToMigrate) {
        const asyncKey = `${this.ASYNC_PREFIX}${key}`;
        const value = await AsyncStorage.getItem(asyncKey);
        
        if (value) {
          // Store in SecureStore
          await SecureStore.setItemAsync(key, value);
          // Remove from AsyncStorage
          await AsyncStorage.removeItem(asyncKey);
          console.log(`✅ Migrated ${key} to SecureStore`);
        }
      }
      
      console.log('✅ Migration completed');
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }
}

export default UniversalStorageService;