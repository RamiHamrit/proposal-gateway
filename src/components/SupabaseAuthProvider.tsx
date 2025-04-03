
import { AuthProvider as LegacyAuthProvider } from '@/context/AuthContext';
import { AuthProvider as SupabaseAuthProvider, useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthProvidersProps {
  children: React.ReactNode;
}

// This custom hook maps Supabase auth to the legacy AuthContext
const useLegacyAuthAdapter = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { signIn, signUp, signOut } = useSupabaseAuth();
  
  useEffect(() => {
    // Initialize the legacy auth adapter
    // This is just to mark that we've initialized the adapter
    setIsInitialized(true);
  }, []);
  
  // These functions implement the legacy interface using Supabase
  const login = async (email: string, password: string, isTeacher = false) => {
    return signIn(email, password);
  };

  const signup = async (name: string, email: string, password: string) => {
    return signUp(name, email, password, 'student');
  };

  const logout = async () => {
    return signOut();
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
