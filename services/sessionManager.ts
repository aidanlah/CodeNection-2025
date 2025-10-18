import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import { UserSession, AuthTokens, SessionData } from "../types/auth";

// Define consistent keys for storing session-related data
const SESSION_KEYS = {
  USER_DATA: "userSession",
  AUTH_TOKENS: "authTokens",
  SESSION_TIMESTAMP: "sessionTimestamp",
} as const;

export class SessionManager {
   /**
   * Store complete session data in AsyncStorage
   * Includes user ID, optional ID token, and timestamp
   */
  static async storeSession(
    user: User,
    idToken: string | null = null
  ): Promise<void> {
    try {
      const sessionData: SessionData = {
        user: {
          uid: user.uid,
          /// Optional fields can be added here if needed:
          // email: user.email,
          // displayName: user.displayName,
          // photoURL: user.photoURL,
          // emailVerified: user.emailVerified,
          // lastLogin: new Date().toISOString(),
        },
        tokens: {
          idToken,
          lastRefresh: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      console.log("manager: start storing session");
      await AsyncStorage.setItem(
        SESSION_KEYS.USER_DATA,
        JSON.stringify(sessionData)
      );
      console.log("manager: session stored");
    } catch (error) {
      console.error("Error storing session:", error);
      throw error;
    }
  }

   /**
   * Retrieve session data from AsyncStorage
   * Returns null if not found or expired (after 7 days)
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      const session = await AsyncStorage.getItem(SESSION_KEYS.USER_DATA);
      if (!session) {
        console.log("manager: session not found");
        return null;
      }
      console.log("manager: session found");

      const sessionData: SessionData = JSON.parse(session);

      // Check if session is expired (optional: 7 days expiry)
      const sessionDate = new Date(sessionData.timestamp);
      const daysDiff =
        (new Date().getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        console.log('manager: session expired')
        await this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error("Error retrieving session:", error);
      return null;
    }
  }

  /**
   * Clear all session-related keys from AsyncStorage
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        SESSION_KEYS.USER_DATA,
        SESSION_KEYS.AUTH_TOKENS,
        SESSION_KEYS.SESSION_TIMESTAMP,
      ]);
      console.log('manager: clearing session')
    } catch (error) {
      console.error("Error clearing session:", error);
      throw error;
    }
  }

   /**
   * Check if a valid session exists
   */
  static async hasValidSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Retrieve only the user portion of the session - full ession SessionData includes : user, tokens, timestamp
   */
  static async getUserSession(): Promise<UserSession | null> {
    const session = await this.getSession();
    return session ? session.user : null;
  }
}
