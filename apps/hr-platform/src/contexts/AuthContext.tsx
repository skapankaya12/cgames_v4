import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  IdTokenResult
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthUser {
  uid: string;
  email: string;
  role: 'super_admin' | 'hr_user' | null;
  customClaims: Record<string, any>;
  // HR-specific fields
  hrRole?: 'admin' | 'employee';
  companyId?: string;
  hrUserData?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasRole: (role: 'super_admin' | 'hr_user') => boolean;
  isSuperAdmin: () => boolean;
  hasHrRole: (role: 'admin' | 'employee') => boolean;
  canCreateProjects: () => boolean;
  canSendInvites: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  const processUser = async (firebaseUser: User | null): Promise<AuthUser | null> => {
    if (!firebaseUser) return null;

    try {
      console.log('🔄 [AuthContext] Processing user and fetching custom claims...');
      
      // Get the ID token result to access custom claims
      const idTokenResult: IdTokenResult = await firebaseUser.getIdTokenResult(false);
      const customClaims = idTokenResult.claims;
      
      console.log('📊 [AuthContext] Custom claims:', customClaims);
      
      let authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: customClaims.role as 'super_admin' | 'hr_user' | null,
        customClaims
      };

      // If user is not super_admin, try to fetch HR user data
      if (customClaims.role !== 'super_admin') {
        try {
          console.log('🔄 [AuthContext] Fetching HR user data...');
          const hrUserRef = doc(db, 'hrUsers', firebaseUser.uid);
          const hrUserDoc = await getDoc(hrUserRef);
          
          if (hrUserDoc.exists()) {
            const hrUserData = hrUserDoc.data();
            authUser = {
              ...authUser,
              role: 'hr_user',
              hrRole: hrUserData.role,
              companyId: hrUserData.companyId,
              hrUserData
            };
            console.log('✅ [AuthContext] HR user data fetched:', hrUserData.role);
          } else {
            console.log('⚠️ [AuthContext] No HR user document found');
          }
        } catch (hrError) {
          console.error('❌ [AuthContext] Error fetching HR user data:', hrError);
        }
      }
      
      console.log('✅ [AuthContext] Processed user:', authUser);
      return authUser;
      
    } catch (err) {
      console.error('❌ [AuthContext] Error processing user:', err);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: null,
        customClaims: {}
      };
    }
  };

  const refreshToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        console.log('🔄 [AuthContext] Refreshing token and custom claims...');
        
        // Force refresh the token to get updated custom claims
        await currentUser.getIdToken(true);
        const updatedUser = await processUser(currentUser);
        setUser(updatedUser);
        
        console.log('✅ [AuthContext] Token refreshed');
      } catch (err) {
        console.error('❌ [AuthContext] Error refreshing token:', err);
        setError('Failed to refresh authentication');
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [AuthContext] Signing in user:', email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const authUser = await processUser(result.user);
      setUser(authUser);
      
      // Check if user needs to change password (first login)
      if (authUser?.hrUserData?.status === 'pending_first_login') {
        console.log('⚠️ [AuthContext] User needs to change password');
        // Could set a flag or navigate to password change page
        // For now, we'll let the user continue but they should change password
      }
      
      console.log('✅ [AuthContext] Sign in successful');
      
    } catch (err: any) {
      console.error('❌ [AuthContext] Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🔄 [AuthContext] Signing out...');
      
      await firebaseSignOut(auth);
      setUser(null);
      setError(null);
      
      console.log('✅ [AuthContext] Sign out successful');
      
    } catch (err: any) {
      console.error('❌ [AuthContext] Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: 'super_admin' | 'hr_user'): boolean => {
    return user?.role === role;
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin';
  };

  const hasHrRole = (role: 'admin' | 'employee'): boolean => {
    return user?.hrRole === role;
  };

  const canCreateProjects = (): boolean => {
    return user?.hrRole === 'admin';
  };

  const canSendInvites = (): boolean => {
    return user?.hrRole === 'admin';
  };

  useEffect(() => {
    console.log('🔄 [AuthContext] Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);
        
        if (firebaseUser) {
          console.log('👤 [AuthContext] User authenticated:', firebaseUser.email);
          const authUser = await processUser(firebaseUser);
          setUser(authUser);
        } else {
          console.log('👤 [AuthContext] User not authenticated');
          setUser(null);
        }
      } catch (err: any) {
        console.error('❌ [AuthContext] Auth state change error:', err);
        setError(err.message || 'Authentication error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('🔄 [AuthContext] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    refreshToken,
    hasRole,
    isSuperAdmin,
    hasHrRole,
    canCreateProjects,
    canSendInvites
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 