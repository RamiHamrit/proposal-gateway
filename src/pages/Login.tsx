import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User, Eye, EyeOff } from "lucide-react";
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
  const [studentError, setStudentError] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  
  // Teacher login state
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState("");
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  
  const { signIn, status } = useAuth();
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError("");
    if (!studentEmail || !studentPassword) {
      setStudentError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setStudentLoading(true);
    try {
      await signIn(studentEmail, studentPassword);
    } catch (error: any) {
      setStudentError(error.message || "فشل تسجيل الدخول");
    }
    setStudentLoading(false);
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError("");
    if (!teacherEmail || !teacherPassword) {
      setTeacherError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setTeacherLoading(true);
    try {
      await signIn(teacherEmail, teacherPassword);
    } catch (error: any) {
      setTeacherError(error.message || "فشل تسجيل الدخول");
    }
    setTeacherLoading(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
      <Link 
        to="/" 
        className="text-primary mb-6 font-medium relative inline-block transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-primary after:w-full after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100 pb-[2px]"
      >
        العودة إلى الصفحة الرئيسية
      </Link>
      <div className="max-w-md w-full mx-auto">
        <Card className="w-full pt-4 rounded-2xl animate-fade-in shadow-lg">
          <CardHeader className="space-y-1 mb-3 text-center">
            <div className="flex justify-center">
              <div className="mb-4 bg-primary/10 p-3 rounded-full">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-heading">تسجيل الدخول</CardTitle>
            <CardDescription className="text-md font-medium">
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
              <TabsList className="grid w-full grid-cols-2 mb-6 items-center min-h-0 h-auto overflow-hidden">
                <TabsTrigger value="student" className="flex items-center gap-2 py-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium text-[1.02rem]">طالب</span>
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2 py-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium text-[1.02rem]">أستاذ</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="rtl-text text-right">
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
                        className="text-right placeholder:text-right"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="student-password" className="text-right block w-full">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="student-password"
                          type={showStudentPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          required
                          className="text-right placeholder:text-right"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-colors transition-transform duration-300 ease-in-out hover:scale-110"
                          onClick={() => setShowStudentPassword((v) => !v)}
                          aria-label={showStudentPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {showStudentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {studentError && (
                      <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                        {studentError}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={studentLoading}>
                      {studentLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="teacher">
                <form onSubmit={handleTeacherLogin} className="rtl-text text-right">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="teacher-email">البريد الإلكتروني</Label>
                      <Input
                        id="teacher-email"
                        type="email"
                        placeholder="أدخل البريد الإلكتروني للأستاذ"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        required
                        className="text-right placeholder:text-right"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="teacher-password" className="text-right block w-full">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="teacher-password"
                          type={showTeacherPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور للأستاذ"
                          value={teacherPassword}
                          onChange={(e) => setTeacherPassword(e.target.value)}
                          required
                          className="text-right placeholder:text-right"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-colors transition-transform duration-300 ease-in-out hover:scale-110"
                          onClick={() => setShowTeacherPassword((v) => !v)}
                          aria-label={showTeacherPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {showTeacherPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {teacherError && (
                      <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                        {teacherError}
                      </div>
                    )}
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
                <Link
                  to="/signup"
                  className="text-primary font-medium relative inline-block transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-primary after:w-full after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100 pb-[2px]"
                >
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
