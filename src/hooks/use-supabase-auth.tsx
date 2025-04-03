
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextProps extends AuthState {
  signUp: (email: string, password: string, options?: { name: string, role: 'student' | 'teacher' }) => Promise<void>;
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

  useEffect(() => {
    // Check for active session on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prevState => ({
        ...prevState,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(prevState => ({
          ...prevState,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    options?: { name: string; role: 'student' | 'teacher' }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: options?.name,
            role: options?.role || 'student'
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
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          ...(updates.email && { email: updates.email }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id);
      
      if (error) throw error;
      
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
