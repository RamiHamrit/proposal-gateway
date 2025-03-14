
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User, Eye, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("student");
  
  // Set initial tab based on URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'teacher') {
      setActiveTab('teacher');
    }
  }, [location]);
  
  // Student login state
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  
  // Teacher login state
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentEmail || !studentPassword) return;
    
    setStudentLoading(true);
    await login(studentEmail, studentPassword, false);
    setStudentLoading(false);
  };
  
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherUsername || !teacherPassword) return;
    
    setTeacherLoading(true);
    await login(teacherUsername, teacherPassword, true);
    setTeacherLoading(false);
  };
  
  return (
    <div className="auth-container">
      <div className="auth-image-panel">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-sm mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white">منصة التأطير</h1>
          <h2 className="text-4xl font-bold text-white">أطّر مشروعك بضغطة زر</h2>
          <p className="text-white/80">المنصة المعتمدة لتأطير مشاريع التخرج</p>
        </div>
        <div className="mt-8">
          <img 
            src="/public/lovable-uploads/7125f1a4-9754-4216-abc9-f1ef10291759.png" 
            alt="Graduation" 
            className="max-w-md" 
          />
        </div>
      </div>
      
      <div className="auth-form-panel">
        <div className="w-full max-w-md">
          <div className="absolute top-4 left-4">
            <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
              <ArrowRight className="h-4 w-4 ml-1" />
              العودة للرئيسية
            </Link>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">تسجيل الدخول</h1>
            <p className="text-muted-foreground mt-2">اختر نوع الحساب وأدخل بياناتك لتسجيل الدخول</p>
          </div>
          
          <Tabs 
            defaultValue="student" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="student" className="flex items-center gap-2 py-3">
                <GraduationCap className="h-4 w-4" />
                <span>طالب</span>
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2 py-3">
                <User className="h-4 w-4" />
                <span>أستاذ</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <form onSubmit={handleStudentLogin}>
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="student-email">البريد الإلكتروني</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                      className="py-6"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="student-password">كلمة المرور</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                        className="py-6"
                      />
                      <button type="button" className="absolute inset-y-0 left-0 pr-3 flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full py-6" disabled={studentLoading}>
                    {studentLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">
                      لا تملك حساب؟{" "}
                      <Link to="/signup" className="text-primary font-medium hover:underline">
                        إنشاء حساب
                      </Link>
                    </span>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="teacher">
              <form onSubmit={handleTeacherLogin}>
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="teacher-username">اسم المستخدم</Label>
                    <Input
                      id="teacher-username"
                      type="text"
                      placeholder="أدخل اسم المستخدم"
                      value={teacherUsername}
                      onChange={(e) => setTeacherUsername(e.target.value)}
                      required
                      className="py-6"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="teacher-password">كلمة المرور</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="teacher-password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        required
                        className="py-6"
                      />
                      <button type="button" className="absolute inset-y-0 left-0 pr-3 flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full py-6" disabled={teacherLoading}>
                    {teacherLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
