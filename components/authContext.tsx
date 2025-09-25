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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Convert Firebase User to our UserSession
  const firebaseUserToSession = (firebaseUser: User): UserSession => ({
    uid: firebaseUser.uid,
  });

  useEffect(() => {
    let authUnsubscribe: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        console.log("initializing authentication");

        // Check if user was previously authenticated
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

        // Set up Firebase auth state listener
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

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    logout,
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
