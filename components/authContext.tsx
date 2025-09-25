import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
// import { AuthService, UserData } from '../services/authService';
// import SecureStorageService from '../services/secureStorage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSession, AuthContextType, SessionData } from "@/types/auth";
import { SessionManager } from "@/services/sessionManager";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  // const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Convert Firebase User to our UserSession
  const firebaseUserToSession = (firebaseUser: User): UserSession => ({
    uid: firebaseUser.uid,
    // email: firebaseUser.email,
    // displayName: firebaseUser.displayName,
    // photoURL: firebaseUser.photoURL,
    // emailVerified: firebaseUser.emailVerified,
  });

  useEffect(() => {
    let authUnsubscribe: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        console.log("initializing authentication");
        // Check if user was previously authenticated
        // const storedToken = await SecureStorageService.getAuthToken();
        // const storedUserData = await SecureStorageService.getUserData();
        const storedSession = await SessionManager.getUserSession();

        if (storedSession) {
          setSession(storedSession);
          setIsAuthenticated(true);
          console.log("user authenticated");
        } else {
          setSession(null);
          setIsAuthenticated(false);
          console.log("user not authenticated");
        }
        // if (storedToken && storedUserData) {
        //   setUserData(storedUserData);
        //   setIsAuthenticated(true);
        //   console.log('user authenticated')
        // } else {
        //   console.log('user not authenticated')
        // }

        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async(firebaseUser) => {
          console.log(' firebase auth state changed')
          if(firebaseUser){
            const userSession = firebaseUserToSession(firebaseUser)
            setSession(userSession)
            console.log('firebase: user authenticated')
          } else {
            setSession(null);
            console.log('firebase: user signed out')
          }
          
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching user data:", error);

        setLoading(false);
      }
    };

    // authUnsubscribe = unsubscribe;

    // Initialize auth service listener for token management
    // const tokenUnsubscribe = AuthService.initializeAuthListener();

    initializeAuth();

    // return () => {
    //   if (authUnsubscribe) {
    //     authUnsubscribe();
    //   }
    // };
  }, []);

  // const signIn = async (email: string, password: string): Promise<void> => {
  //   try {
  //     await AuthService.signIn(email, password);
  //     // User state will be updated by the auth state listener
  //   } catch (error: any) {
  //     throw new Error(error.message);
  //   }
  // };

  // const signUp = async (
  //   email: string,
  //   password: string,
  //   displayName: string
  // ): Promise<void> => {
  //   try {
  //     await AuthService.signUp(email, password, displayName);
  //     // User state will be updated by the auth state listener
  //   } catch (error: any) {
  //     throw new Error(error.message);
  //   }
  // };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      await SessionManager.clearSession();
      setSession(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // const resetPassword = async (email: string): Promise<void> => {
  //   try {
  //     await AuthService.resetPassword(email);
  //   } catch (error: any) {
  //     throw new Error(error.message);
  //   }
  // };

  /* const updatePreferences = async (preferences: Partial<UserData['preferences']>): Promise<void> => {
    if (!user || !userData) {
      throw new Error('No user logged in');
    }

    try {
      await AuthService.updateUserPreferences(user.uid, preferences);
      
      // Update local state
      const updatedUserData = {
        ...userData,
        preferences: { ...userData.preferences, ...preferences }
      };
      setUserData(updatedUserData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }; */

  // const refreshUserData = async (): Promise<void> => {
  //   if (!user) return;

  //   try {
  //     const freshUserData = await AuthService.getUserData(user.uid);
  //     if (freshUserData) {
  //       setUserData(freshUserData);
  //       await SecureStorageService.storeUserData(freshUserData);
  //     }
  //   } catch (error: any) {
  //     throw new Error(error.message);
  //   }
  // };

  const value: AuthContextType = {
    user,
    session,
    // userData,
    loading,
    isAuthenticated,
    logout,
    // signIn,
    // signUp,
    // signOut,
    // resetPassword,
    // updatePreferences,
    // refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
