import { User } from "firebase/auth";

export interface UserSession {
    uid: string;
    // email: string | null;
    // displayName: string | null;
    // photoURL: string | null;
    // emailVerified: boolean;
    lastLogin: string;
  }
  
  export interface AuthTokens {
    idToken?: string | null;
    lastRefresh: string;
  }
  
  export interface SessionData {
    user: UserSession;
    tokens: AuthTokens;
    timestamp: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    session: UserSession | null;
    loading: boolean;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
  }