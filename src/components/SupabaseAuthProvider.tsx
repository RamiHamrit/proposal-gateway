import { AuthProvider as LegacyAuthProvider } from '@/context/AuthContext';
import { AuthProvider as SupabaseAuthProvider } from '@/hooks/use-supabase-auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAuthData, teacherPasswords } from '@/utils/localStorage';

interface AuthProvidersProps {
  children: React.ReactNode;
}

// This custom hook maps Supabase auth to the legacy AuthContext
const useLegacyAuthAdapter = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize the legacy auth adapter
    // This is just to mark that we've initialized the adapter
    setIsInitialized(true);
  }, []);
  
  // These functions implement the legacy interface using Supabase
  const login = async (username: string, password: string, isTeacher = false) => {
    try {
      console.log("Legacy adapter login:", isTeacher ? "teacher" : "student", username);
      
      if (isTeacher) {
        // Let the legacy auth provider handle teacher login
        console.log("Teacher login, delegating to legacy system");
        return false;
      } else {
        // Student login with Supabase
        console.log("Student login with Supabase:", username);
        const { error, data } = await supabase.auth.signInWithPassword({ 
          email: username, 
          password 
        });
        
        if (error) {
          console.error("Supabase login error:", error.message);
          throw error;
        }
        
        console.log("Supabase login successful, session:", data.session?.user.id);
        return true;
      }
    } catch (error) {
      console.error("Login error in legacy adapter:", error);
      throw error;
    }
  };

  return {
    isInitialized,
    login,
    signup: async () => false, // Let the legacy auth provider handle this
    logout: async () => false   // Let the legacy auth provider handle this
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
