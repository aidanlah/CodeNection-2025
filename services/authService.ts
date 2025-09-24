import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  sendPasswordResetEmail,
  getIdToken,
  onIdTokenChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase.config';
import UniversalStorageService from './storageService';
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLogin?: Date;
  preferences?: {
    notifications: boolean;
    emergencyContacts: string[];
    theme: 'light' | 'dark';
  };
}

export class EnhancedAuthService {
  // Initialize auth listener with universal storage
  static initializeAuthListener(): () => void {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          // Store auth token
          const token = await getIdToken(user);
          await UniversalStorageService.storeAuthToken(token);
          
          // Store user data
          const userData = await this.getUserData(user.uid);
          if (userData) {
            await UniversalStorageService.storeUserData(userData);
          }
          
          console.log('✅ Auth session saved');
        } catch (error) {
          console.error('❌ Error in auth listener:', error);
        }
      } else {
        // Clear all data on sign out
        await UniversalStorageService.clearAll();
        console.log('🚪 Auth session cleared');
      }
    });

    return unsubscribe;
  }

  // Sign up
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          notifications: true,
          emergencyContacts: [],
          theme: 'light',
        },
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // Store locally with universal storage
      const token = await getIdToken(user);
      await UniversalStorageService.storeAuthToken(token);
      await UniversalStorageService.storeUserData(userData);

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign in
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await this.updateLastLogin(user.uid);

      // Store auth data
      const token = await getIdToken(user);
      await UniversalStorageService.storeAuthToken(token);

      const userData = await this.getUserData(user.uid);
      if (userData) {
        await UniversalStorageService.storeUserData(userData);
      }

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await UniversalStorageService.clearAll();
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get user data
  static async getUserData(uid: string): Promise<UserData | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserData;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update last login
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastLogin: new Date(),
      });
    } catch (error: any) {
      console.error('Error updating last login:', error);
    }
  }

  // Get stored auth token
  static async getStoredAuthToken(): Promise<string | null> {
    return UniversalStorageService.getAuthToken();
  }

  // Get stored user data
  static async getStoredUserData(): Promise<UserData | null> {
    return UniversalStorageService.getUserData();
  }

  // Check if authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await UniversalStorageService.getAuthToken();
      return token !== null;
    } catch (error) {
      return false;
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Get storage info for debugging
  static getStorageInfo() {
    return UniversalStorageService.getStorageInfo();
  }
}