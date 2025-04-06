
import { AuthProvider as LegacyAuthProvider } from '@/context/AuthContext';
import { AuthProvider as SupabaseAuthProvider } from '@/hooks/use-supabase-auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAuthData, teacherPasswords, getLocalData } from '@/utils/localStorage';

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
    
    // Debugging: Log available teacher credentials
    console.log("Available teacher usernames:", Object.keys(teacherPasswords));
  }, []);
  
  // These functions implement the legacy interface using Supabase
  const login = async (username: string, password: string, isTeacher = false) => {
    try {
      console.log("Legacy adapter login:", isTeacher ? "teacher" : "student", username);
      
      if (isTeacher) {
        // Check if this is one of our hardcoded teachers
        console.log("Checking teacher credentials for:", username);
        console.log("Teacher passwords object:", teacherPasswords);
        console.log("Expected password:", teacherPasswords[username]);
        console.log("Provided password:", password);
        
        if (teacherPasswords[username] === password) {
          console.log("Valid teacher credentials, using legacy login");
          // Let the legacy auth provider handle this
          return false; // Signal that we didn't handle this
        } else {
          console.log("Invalid teacher credentials");
          throw new Error("Invalid teacher credentials");
        }
      } else {
        // Student login with Supabase
        console.log("Student login with Supabase:", username);
        const { error } = await supabase.auth.signInWithPassword({ 
          email: username, 
          password 
        });
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error("Login error in legacy adapter:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      console.log("Legacy adapter signup:", name, email);
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
      console.error("Signup error in legacy adapter:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Legacy adapter: Attempting to sign out");
      
      // First clear any local auth data
      clearAuthData();
      console.log("Legacy adapter: Local auth data cleared");
      
      // Then sign out from Supabase if there's an active session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error in legacy adapter:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تسجيل الخروج",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Legacy adapter: Sign out successful");
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      
      // Force a page reload to clear all state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
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
