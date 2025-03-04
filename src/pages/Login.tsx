
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const location = useLocation();
  const defaultTab = location.search.includes('role=teacher') ? 'teacher' : 'student';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
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
              defaultValue={defaultTab} 
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
