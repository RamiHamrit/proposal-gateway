
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the user type with role information
export interface SupabaseUser extends User {
  role?: 'student' | 'teacher';
  name?: string;
}

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextProps extends AuthState {
  signUp: (name: string, email: string, password: string, role?: 'student' | 'teacher') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { name?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });
  const { toast } = useToast();

  // Function to get user's role from Supabase
  const getUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role from profiles table for:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        throw error;
      }
      console.log("Fetched user role:", data);
      return data;
    } catch (error) {
      console.error("Error in getUserRole:", error);
      // Return default role if error
      return { role: 'student', name: '' };
    }
  };

  useEffect(() => {
    console.log("Setting up Supabase auth state listener");
    let isMounted = true;
    
    // Set up auth state listener first to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth state change:", event, session?.user?.id);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.id);
          
          // Extend user with metadata information immediately
          const metadataRole = session.user.user_metadata?.role;
          const metadataName = session.user.user_metadata?.name;
          
          const extendedUser: SupabaseUser = {
            ...session.user,
            role: metadataRole || 'student',
            name: metadataName || ''
          };
          
          if (isMounted) {
            setState({
              session,
              user: extendedUser,
              isLoading: false,
            });
          }
          
          console.log("User authenticated as:", metadataRole || 'student');
          
          // Try to get additional profile info in the background (don't wait for it)
          setTimeout(async () => {
            try {
              const profileData = await getUserRole(session.user.id);
              
              if (profileData && isMounted) {
                const updatedUser: SupabaseUser = {
                  ...session.user,
                  role: profileData.role as 'student' | 'teacher' || metadataRole || 'student',
                  name: profileData.name || metadataName || ''
                };
                
                setState(prev => ({
                  ...prev,
                  user: updatedUser
                }));
              }
            } catch (error) {
              console.error("Error fetching additional profile data:", error);
              // Just continue with metadata-based user
            }
          }, 0);
          
          // Navigation will be handled by components, not here
        } else {
          console.log("Supabase auth: No active session detected in state change");
          if (isMounted) {
            setState({
              session: null,
              user: null,
              isLoading: false,
            });
          }
        }
      }
    );

    // Then check for active session on component mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Supabase initial session check:", session?.user?.id);
      
      if (session?.user) {
        // Get initial metadata info
        const metadataRole = session.user.user_metadata?.role;
        const metadataName = session.user.user_metadata?.name;
        
        // Extend user with basic metadata information immediately
        const initialUser: SupabaseUser = {
          ...session.user,
          role: metadataRole || 'student',
          name: metadataName || ''
        };
        
        if (isMounted) {
          setState({
            session,
            user: initialUser,
            isLoading: false,
          });
          
          console.log("User authenticated initially as:", metadataRole || 'student');
        }
        
        // Try to get additional profile info (don't block on this)
        setTimeout(async () => {
          try {
            const profileData = await getUserRole(session.user.id);
            
            if (profileData && isMounted) {
              const updatedUser: SupabaseUser = {
                ...session.user,
                role: profileData.role as 'student' | 'teacher' || metadataRole || 'student',
                name: profileData.name || metadataName || ''
              };
              
              setState(prev => ({
                ...prev,
                user: updatedUser
              }));
            }
          } catch (error) {
            console.error("Error fetching additional profile data on init:", error);
            // Just continue with metadata-based user
          }
        }, 0);
      } else {
        console.log("Supabase auth: No active session found on initial check");
        if (isMounted) {
          setState(prevState => ({
            ...prevState,
            session: null,
            user: null,
            isLoading: false,
          }));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      isMounted = false;
    };
  }, []);

  const signUp = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'teacher' = 'student'
  ) => {
    try {
      console.log("Attempting signup with Supabase:", name, email, role);
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) throw error;
      
      console.log("Signup successful, user:", data.user?.id);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "جاري الانتقال إلى لوحة التحكم...",
      });
      
      // Navigation will be handled by the calling component
    } catch (error: any) {
      console.error("Signup error:", error);
      
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء محاولة إنشاء الحساب",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting signin with Supabase:", email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Signin successful, session:", data.session?.user.id);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك!",
      });
      
      // Navigation will be handled by the calling component
    } catch (error: any) {
      console.error("Signin error:", error);
      
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("useSupabaseAuth: Attempting to sign out");
      
      // Update local state to ensure UI updates immediately
      setState(prev => ({
        ...prev,
        user: null,
        session: null
      }));
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('sb-woxcxuhcrhyoeynmuhtw-auth-token');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("useSupabaseAuth signOut error:", error);
        throw error;
      }
      
      console.log("useSupabaseAuth: Sign out successful");
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      
      // Force navigation to home page
      window.location.href = '/';
    } catch (error: any) {
      console.error("useSupabaseAuth signOut catch error:", error);
      
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
      
      // Even on error, try to redirect
      window.location.href = '/';
      
      throw error;
    }
  };

  const updateUserProfile = async (updates: { name?: string; email?: string }) => {
    if (!state.user) return;
    
    try {
      // Update auth user if email changed
      if (updates.email && updates.email !== state.user.email) {
        const { error } = await supabase.auth.updateUser({
          email: updates.email,
        });
        if (error) throw error;
      }
      
      // Update profile in the profiles table
      if (updates.name || updates.email) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...(updates.name && { name: updates.name }),
            ...(updates.email && { email: updates.email }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.user.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلوماتك الشخصية بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث معلوماتك",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return context;
};
