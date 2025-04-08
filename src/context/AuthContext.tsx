import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher, AuthStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getLocalData, saveLocalData, initialTeachers, teacherPasswords } from '@/utils/localStorage';

interface AuthContextProps {
  user: User | null;
  status: AuthStatus;
  login: (username: string, password: string, isTeacher: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (updates: { name?: string; email?: string }) => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
  overrideLogin?: (username: string, password: string, isTeacher?: boolean) => Promise<any>;
  overrideSignup?: (name: string, email: string, password: string) => Promise<any>;
  overrideLogout?: () => Promise<any>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  status: 'idle',
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUserInfo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  overrideLogin, 
  overrideSignup, 
  overrideLogout 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const { toast } = useToast();
  
  // Mock database for local development
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentPasswords, setStudentPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for stored user on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setStatus('authenticated');
        console.log("Restored auth from localStorage: authenticated");
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('user');
        setStatus('unauthenticated');
      }
    } else {
      setStatus('unauthenticated');
      console.log("No auth found in localStorage: unauthenticated");
    }

    // Load mock data from localStorage - especially teachers
    const storedTeachers = getLocalData<Teacher[]>('teachers', []);
    console.log('Loaded teachers on mount:', storedTeachers);
    setTeachers(storedTeachers);
    
    // Log the available teacher passwords
    console.log('Available teacher usernames:', Object.keys(teacherPasswords));

    // Load other data
    const storedStudents = getLocalData<Student[]>('students', []);
    const storedStudentPasswords = getLocalData<Record<string, string>>('studentPasswords', {});
    
    if (storedStudents.length > 0) setStudents(storedStudents);
    if (Object.keys(storedStudentPasswords).length > 0) setStudentPasswords(storedStudentPasswords);
  }, []);

  // Save mock data to localStorage whenever it changes
  useEffect(() => {
    if (students.length > 0) {
      saveLocalData('students', students);
    }
    if (teachers.length > 0) {
      saveLocalData('teachers', teachers);
    }
    if (Object.keys(studentPasswords).length > 0) {
      saveLocalData('studentPasswords', studentPasswords);
    }
  }, [students, teachers, studentPasswords]);

  const login = async (username: string, password: string, isTeacher: boolean) => {
    try {
      setStatus('idle');
      console.log(`Attempting ${isTeacher ? 'teacher' : 'student'} login:`, username);
      
      // Use overrideLogin if provided (Supabase integration)
      if (overrideLogin && !isTeacher) {
        console.log('Using override login for student');
        try {
          const handled = await overrideLogin(username, password, isTeacher);
          
          // If the override handled the login (for students), return
          if (handled === true) {
            console.log("Login was handled by override");
            return;
          }
        } catch (error) {
          console.error("Override login failed:", error);
          // Fall back to local login if override fails and it's a teacher login
          if (!isTeacher) {
            throw error; // For student login, let the error propagate
          }
          // For teacher login, continue with local flow
        }
      }
      
      if (isTeacher) {
        console.log('Teacher login flow');
        // Check passwords directly from the teacherPasswords object
        console.log('Available teacher usernames:', Object.keys(teacherPasswords));
        console.log('Checking password for:', username);
        
        if (teacherPasswords[username] === password) {
          // Get teachers from localStorage
          const currentTeachers = getLocalData<Teacher[]>('teachers', initialTeachers);
          const teacher = currentTeachers.find(t => t.username === username);
          
          if (teacher) {
            console.log('Teacher found:', teacher);
            setUser(teacher);
            localStorage.setItem('user', JSON.stringify(teacher));
            setStatus('authenticated');
            
            return; // Success - exit the function
          } else {
            console.error('Teacher account not found in stored teachers');
            throw new Error("حساب المعلم غير موجود");
          }
        } else {
          console.error('Invalid teacher password');
          throw new Error("كلمة المرور غير صحيحة");
        }
      } else {
        console.log('Student login flow');
        // Student login (using email as username)
        if (studentPasswords[username] === password) {
          const student = students.find(s => s.email === username);
          if (student) {
            console.log('Student found:', student);
            setUser(student);
            localStorage.setItem('user', JSON.stringify(student));
            setStatus('authenticated');
            return; // Success - exit the function
          }
        }
        
        // If we reach here, student login failed
        throw new Error("بيانات تسجيل الدخول غير صحيحة");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setStatus('unauthenticated');
      throw error; // Re-throw for the component to handle
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setStatus('idle');
      
      // Use overrideSignup if provided (Supabase integration)
      if (overrideSignup) {
        await overrideSignup(name, email, password);
        return;
      }
      
      // Check if email already exists
      if (students.some(s => s.email === email)) {
        setStatus('unauthenticated');
        toast({
          title: "البريد الإلكتروني مستخدم",
          description: "هذا البريد الإلكتروني مسجل بالفعل",
          variant: "destructive",
        });
        return;
      }
      
      // Create new student
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name,
        email,
        role: 'student',
        proposals: [],
      };
      
      // Save student and password
      setStudents(prev => [...prev, newStudent]);
      setStudentPasswords(prev => ({ ...prev, [email]: password }));
      
      // Auto login after signup
      setUser(newStudent);
      localStorage.setItem('user', JSON.stringify(newStudent));
      setStatus('authenticated');
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم تسجيل دخولك تلقائياً",
      });
      
      // Use window.location for navigation to avoid router context issues
      window.location.href = '/dashboard/student';
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ أثناء محاولة إنشاء الحساب",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Attempting logout");
      
      // Use overrideLogout if provided (Supabase integration)
      if (overrideLogout) {
        console.log("AuthContext: Using override logout");
        try {
          await overrideLogout();
          // If we got here, logout was successful, no need to continue with local logic
          return;
        } catch (error) {
          console.error("Override logout error:", error);
          // Continue with local logout as fallback
        }
      }
      
      // Always reset local state regardless of which logout method was used
      console.log("AuthContext: Clearing local state");
      setUser(null);
      setStatus('unauthenticated');
      localStorage.removeItem('user');
      
      console.log("AuthContext: Local state cleared, status:", 'unauthenticated');
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      
      // Force navigation to home page using window.location
      console.log("AuthContext: Navigating to / after logout");
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error in AuthContext:", error);
      // Even on error, we should clear the local session
      setUser(null);
      setStatus('unauthenticated');
      localStorage.removeItem('user');
      window.location.href = '/';
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك مع وجود خطأ",
      });
    }
  };
  
  const updateUserInfo = (updates: { name?: string; email?: string }) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update in the appropriate collection
    if (user.role === 'student') {
      setStudents(prev => 
        prev.map(s => s.id === user.id ? { ...s, ...updates } : s)
      );
    } else if (user.role === 'teacher') {
      setTeachers(prev => 
        prev.map(t => t.id === user.id ? { ...t, ...updates } : t)
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
