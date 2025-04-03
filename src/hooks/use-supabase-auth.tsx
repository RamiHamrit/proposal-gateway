
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
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for active session on component mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Get role information
        const profileData = await getUserRole(session.user.id);
        
        // Extend user with role information
        const extendedUser: SupabaseUser = {
          ...session.user,
          role: profileData?.role as 'student' | 'teacher' || 'student',
          name: profileData?.name || ''
        };
        
        setState({
          session,
          user: extendedUser,
          isLoading: false,
        });
      } else {
        setState(prevState => ({
          ...prevState,
          session: null,
          user: null,
          isLoading: false,
        }));
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Get role information when auth state changes
          const profileData = await getUserRole(session.user.id);
          
          // Extend user with role information
          const extendedUser: SupabaseUser = {
            ...session.user,
            role: profileData?.role as 'student' | 'teacher' || 'student',
            name: profileData?.name || ''
          };
          
          setState({
            session,
            user: extendedUser,
            isLoading: false,
          });
        } else {
          setState({
            session: null,
            user: null,
            isLoading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'teacher' = 'student'
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
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
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب",
      });
    } catch (error: any) {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك!",
      });
    } catch (error: any) {
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
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
