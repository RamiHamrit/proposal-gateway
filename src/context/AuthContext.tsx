import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

// Define User type
export type User = {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  name?: string;
};

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface AuthContextProps {
  user: User | null;
  status: AuthStatus;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserInfo: (updates: { name?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  status: 'idle',
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateUserInfo: async () => {},
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const { toast } = useToast();

  // Handle session changes and fetch user info
  useEffect(() => {
    const getSessionUser = async () => {
      setStatus('idle');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch user role from users table
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (dbUser && !error) {
          setUser({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
          });
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    };
    getSessionUser();
    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getSessionUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    setStatus('idle');
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setStatus('unauthenticated');
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error?.message || 'حدث خطأ أثناء محاولة إنشاء الحساب',
        variant: 'destructive',
      });
      return;
    }
    // Insert user into users table with role 'student'
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, role: 'student', name }]);
    if (insertError) {
      setStatus('unauthenticated');
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: insertError.message,
        variant: 'destructive',
      });
      return;
    }
    setUser({ id: data.user.id, email, role: 'student', name });
    setStatus('authenticated');
    toast({
      title: 'تم إنشاء الحساب بنجاح',
      description: 'تم تسجيل دخولك تلقائياً',
    });
  };

  const signIn = async (email: string, password: string) => {
    setStatus('idle');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setStatus('unauthenticated');
      // Always show Arabic for invalid credentials
      let errorMsg = error?.message;
      if (errorMsg === 'Invalid login credentials') {
        errorMsg = 'بيانات تسجيل الدخول غير صحيحة';
      }
      toast({
        title: 'فشل تسجيل الدخول',
        description: errorMsg || 'اسم المستخدم أو كلمة المرور غير صحيحة',
        variant: 'destructive',
      });
      return;
    }
    // Fetch user role from users table
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (!dbUser || dbError) {
      setStatus('unauthenticated');
      toast({
        title: 'فشل تسجيل الدخول',
        description: dbError?.message || 'لم يتم العثور على المستخدم في قاعدة البيانات',
        variant: 'destructive',
      });
      return;
    }
    setUser({ id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role });
    setStatus('authenticated');
    toast({
      title: 'تم تسجيل الدخول بنجاح',
      description: `مرحباً، ${dbUser.name || dbUser.email}`,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatus('unauthenticated');
    toast({
      title: 'تم تسجيل الخروج',
      description: 'تم تسجيل خروجك بنجاح',
    });
  };

  const updateUserInfo = async (updates: { name?: string; email?: string }) => {
    if (!user) return;
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    if (error) {
      toast({
        title: 'خطأ في تحديث المعلومات',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    setUser({ ...user, ...updates });
    toast({
      title: 'تم تحديث المعلومات',
      description: 'تم تحديث معلومات المستخدم بنجاح',
    });
  };

  return (
    <AuthContext.Provider value={{ user, status, signUp, signIn, signOut, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
