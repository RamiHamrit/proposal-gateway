
import { AuthProvider as LegacyAuthProvider } from '@/context/AuthContext';
import { AuthProvider as SupabaseAuthProvider } from '@/hooks/use-supabase-auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthProvidersProps {
  children: React.ReactNode;
}

// This custom hook maps Supabase auth to the legacy AuthContext
const useLegacyAuthAdapter = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize the legacy auth adapter
    // This is just to mark that we've initialized the adapter
    setIsInitialized(true);
  }, []);
  
  // These functions implement the legacy interface using Supabase
  const login = async (email: string, password: string, isTeacher = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student'
          }
        }
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return {
    isInitialized,
    login,
    signup,
    logout
  };
};

// This component wraps both auth providers to facilitate migration
export const AuthProviders = ({ children }: AuthProvidersProps) => {
  // Use our adapter to provide the legacy interface
  const legacyAdapter = useLegacyAuthAdapter();
  
  return (
    <SupabaseAuthProvider>
      <LegacyAuthProvider
        overrideLogin={legacyAdapter.login}
        overrideSignup={legacyAdapter.signup}
        overrideLogout={legacyAdapter.logout}
      >
        {children}
      </LegacyAuthProvider>
    </SupabaseAuthProvider>
  );
};

export default AuthProviders;
