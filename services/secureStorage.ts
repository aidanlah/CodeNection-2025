import * as SecureStore from 'expo-secure-store';

class SecureStorageService {
  // Keys for storing different types of data
  private static readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
  };

  // Store auth token securely
  static async storeAuthToken(token: string): Promise<void> {
    try {
      console.log('storing auth token')
      await SecureStore.setItemAsync(this.KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  // Get auth token
  static async getAuthToken(): Promise<string | null> {
    try {
      console.log('getting auth token')
      return await SecureStore.getItemAsync(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Store user data securely
  static async storeUserData(userData: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  // Get user data
  static async getUserData(): Promise<any | null> {
    try {
      console.log('getting user data')
      const data = await SecureStore.getItemAsync(this.KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Store refresh token
  static async storeRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  // Get refresh token
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Clear all secure data (on logout)
  static async clearAll(): Promise<void> {
    try {
      console.log('clearing secure storge')
      await Promise.all([
        
        SecureStore.deleteItemAsync(this.KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(this.KEYS.USER_DATA),
        SecureStore.deleteItemAsync(this.KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }

  // Store user preferences (less sensitive data)
  static async storeUserPreferences(preferences: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error storing user preferences:', error);
    }
  }

  // Get user preferences
  static async getUserPreferences(): Promise<any | null> {
    try {
      const data = await SecureStore.getItemAsync(this.KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
}

export default SecureStorageService;