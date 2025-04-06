
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    
    if (password.length < 8) {
      setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Starting signup process for student:", email);
      toast({
        title: "جاري إنشاء الحساب...",
        description: "يرجى الانتظار قليلاً",
      });
      
      await signup(name, email, password);
      
      // Show success message
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "جاري الانتقال إلى لوحة التحكم...",
      });
      
      // Force redirect to student dashboard after signup
      console.log("Redirecting to student dashboard after successful signup");
      setTimeout(() => {
        window.location.href = '/dashboard/student';
      }, 500);
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "حدث خطأ أثناء إنشاء الحساب");
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading">إنشاء حساب طالب</CardTitle>
            <CardDescription>
              أدخل بياناتك لإنشاء حساب جديد
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
