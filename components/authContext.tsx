import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { UserSession, AuthContextType } from "@/types/auth";
import { SessionManager } from "@/services/sessionManager";

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for wrapping children in the provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Firebase user object (optional, not used in session)
  const [user, setUser] = useState<User | null>(null);
  // Custom session object used across app
  const [session, setSession] = useState<UserSession | null>(null);
  // Track loading state during initialization
  const [loading, setLoading] = useState(true);
  // Track whether user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Convert Firebase User to our UserSession
  const firebaseUserToSession = (firebaseUser: User): UserSession => ({
    uid: firebaseUser.uid,
  });

  useEffect(() => {
    let authUnsubscribe: (() => void) | null = null;

    // Initialize authentication state
    const initializeAuth = async () => {
      try {
        console.log("initializing authentication");

        // Check if user was previously authenticated in AsyncStorage
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

        // Set up Firebase listener to isten for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log(" firebase auth state changed");
          if (firebaseUser) {
            const userSession = firebaseUserToSession(firebaseUser);
            setSession(userSession);
            console.log("firebase: user authenticated");
          } else {
            setSession(null);
            console.log("firebase: user signed out");
          }

          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching user data:", error);

        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Logout function: clears Firebase and local session
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

  // This is the auth data we share with screens that need it
  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    logout,
  };

  // Make this auth data available to all screens inside the app
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom function to let screens use the auth data easily
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
