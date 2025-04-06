
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("student");
  const { toast } = useToast();
  
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
  
  const { login, status, user } = useAuth();
  
  // Log current auth status for debugging and redirect if already logged in
  useEffect(() => {
    console.log("Current auth status:", status, "User:", user?.id);
    
    // If user is authenticated, redirect to appropriate dashboard
    if (status === 'authenticated' && user) {
      console.log("User already authenticated, redirecting to dashboard");
      const dashboardRoute = user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student';
      window.location.href = dashboardRoute;
    }
  }, [status, user]);
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentEmail || !studentPassword) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    setStudentLoading(true);
    try {
      console.log("Attempting student login with:", studentEmail);
      await login(studentEmail, studentPassword, false);
      
      // Display a toast for better UX while waiting for state to update
      toast({
        title: "تم تسجيل الدخول",
        description: "جارِ الانتقال إلى لوحة التحكم...",
      });
      
      // Force redirect after a short delay if the auth state doesn't change automatically
      setTimeout(() => {
        if (status !== 'authenticated') {
          console.log("Login completed but redirect didn't happen automatically, forcing redirect");
          window.location.href = '/dashboard/student';
        }
      }, 1000);
    } catch (error) {
      console.error("Student login error:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "تحقق من بريدك الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setStudentLoading(false);
    }
  };
  
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherUsername || !teacherPassword) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    setTeacherLoading(true);
    try {
      console.log("Attempting teacher login with username:", teacherUsername);
      await login(teacherUsername, teacherPassword, true);
      
      // For teachers, we display a success toast
      toast({
        title: "تم تسجيل الدخول",
        description: "مرحباً بعودتك!",
      });
      
      // Force redirect after a short delay if the auth state doesn't change automatically
      setTimeout(() => {
        if (status !== 'authenticated') {
          console.log("Teacher login completed but redirect didn't happen automatically, forcing redirect");
          window.location.href = '/dashboard/teacher';
        }
      }, 1000);
    } catch (error) {
      console.error("Teacher login error:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "تحقق من اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setTeacherLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <div className="max-w-md w-full">
        <Link 
          to="/" 
          className="flex justify-center mb-8 text-primary hover:underline"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
        
        <Card className="w-full animate-fade-in shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading">تسجيل الدخول</CardTitle>
            <CardDescription>
              اختر نوع الحساب وأدخل بياناتك لتسجيل الدخول
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Tabs 
              defaultValue="student" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>طالب</span>
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>أستاذ</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="student-email">البريد الإلكتروني</Label>
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="student-password">كلمة المرور</Label>
                      </div>
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={studentLoading}>
                      {studentLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="teacher">
                <form onSubmit={handleTeacherLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="teacher-username">اسم المستخدم</Label>
                      <Input
                        id="teacher-username"
                        type="text"
                        placeholder="أدخل اسم المستخدم"
                        value={teacherUsername}
                        onChange={(e) => setTeacherUsername(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="teacher-password">كلمة المرور</Label>
                      </div>
                      <Input
                        id="teacher-password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={teacherLoading}>
                      {teacherLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            {activeTab === "student" && (
              <div className="text-center text-sm text-muted-foreground">
                ليس لديك حساب؟{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  إنشاء حساب جديد
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
