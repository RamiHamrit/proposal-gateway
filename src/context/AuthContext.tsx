import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher, AuthStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  status: AuthStatus;
  login: (username: string, password: string, isTeacher: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (updates: { name?: string; email?: string }) => void;
}

export const initialTeachers = [
  {
    id: '1',
    name: 'أحمد مالكي',
    username: 'Ahmed',
    role: 'teacher' as const,
    projects: [],
  },
  {
    id: '2',
    name: 'فؤاد حمداوي',
    username: 'Fouad',
    role: 'teacher' as const,
    projects: [],
  },
];

// Initial dummy data for testing
const dummyTeacherPasswords: Record<string, string> = {
  'Ahmed': 'Ahmed1234',
  'Fouad': 'Fouad1234',
};

const AuthContext = createContext<AuthContextProps>({
  user: null,
  status: 'idle',
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUserInfo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const { toast } = useToast();
  
  // Mock database for local development
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [studentPasswords, setStudentPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for stored user on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }

    // Load mock data from localStorage if available
    const storedStudents = localStorage.getItem('students');
    const storedTeachers = localStorage.getItem('teachers');
    const storedStudentPasswords = localStorage.getItem('studentPasswords');

    if (storedStudents) setStudents(JSON.parse(storedStudents));
    if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
    if (storedStudentPasswords) setStudentPasswords(JSON.parse(storedStudentPasswords));
    else localStorage.setItem('studentPasswords', JSON.stringify({}));
    
    // Initialize teachers in localStorage if not present
    if (!storedTeachers) {
      localStorage.setItem('teachers', JSON.stringify(initialTeachers));
    }
  }, []);

  // Save mock data to localStorage whenever it changes
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
    if (teachers.length > 0) {
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    if (Object.keys(studentPasswords).length > 0) {
      localStorage.setItem('studentPasswords', JSON.stringify(studentPasswords));
    }
  }, [students, teachers, studentPasswords]);

  const login = async (username: string, password: string, isTeacher: boolean) => {
    try {
      setStatus('idle');
      
      if (isTeacher) {
        // Teacher login
        if (dummyTeacherPasswords[username] === password) {
          const teacher = teachers.find(t => t.username === username);
          if (teacher) {
            setUser(teacher);
            localStorage.setItem('user', JSON.stringify(teacher));
            setStatus('authenticated');
            toast({
              title: "تم تسجيل الدخول بنجاح",
              description: `مرحباً، ${teacher.name}`,
            });
            return;
          }
        }
      } else {
        // Student login (using email as username)
        if (studentPasswords[username] === password) {
          const student = students.find(s => s.email === username);
          if (student) {
            setUser(student);
            localStorage.setItem('user', JSON.stringify(student));
            setStatus('authenticated');
            toast({
              title: "تم تسجيل الدخول بنجاح",
              description: `مرحباً، ${student.name}`,
            });
            return;
          }
        }
      }
      
      // If we reach here, login failed
      setStatus('unauthenticated');
      toast({
        title: "فشل تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول",
        variant: "destructive",
      });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setStatus('idle');
      
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
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ أثناء محاولة إنشاء الحساب",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    setStatus('unauthenticated');
    localStorage.removeItem('user');
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
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
