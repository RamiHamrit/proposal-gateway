
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowRight, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  
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
      await signup(name, email, password);
      // Redirect handled by AuthContext via React Router
    } catch (error) {
      setError("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
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
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">إنشاء حساب طالب</h1>
            <p className="text-muted-foreground mt-2">أدخل بياناتك لإنشاء حساب جديد</p>
          </div>
          
          <form onSubmit={handleSignUp}>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="py-6"
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
                  className="py-6"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="regNumber">رقم التسجيل</Label>
                <Input
                  id="regNumber"
                  type="text"
                  placeholder="أدخل رقم التسجيل (ثمانية أرقام)"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  required
                  className="py-6"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="py-6"
                  />
                  <button type="button" className="absolute inset-y-0 left-0 pr-3 flex items-center text-muted-foreground">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="py-6"
                  />
                  <button type="button" className="absolute inset-y-0 left-0 pr-3 flex items-center text-muted-foreground">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full py-6" disabled={loading}>
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  لديك حساب بالفعل؟{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    تسجيل الدخول
                  </Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
