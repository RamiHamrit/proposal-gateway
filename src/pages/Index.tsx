
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, User } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-heading font-bold">منصة التأطير</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold tracking-tight">
                منصة إدارة
                <br />
                <span className="text-primary">مشاريع التخرج</span>
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                منصة شاملة للطلاب والأساتذة لإدارة مشاريع التخرج بكفاءة وسهولة
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">
                  تسجيل حساب طالب
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/login?tab=teacher">
                  تسجيل دخول الأساتذة
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl shadow-md border bg-card p-6 flex flex-col">
              <div className="bg-primary/10 p-3 rounded-full self-start mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-4">للطلاب</h3>
              <ul className="mt-2 text-sm text-muted-foreground space-y-3">
                <li className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-primary" />
                  تصفح مشاريع التخرج المتاحة
                </li>
                <li className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-primary" />
                  تقديم مقترحات للمشاريع (حتى 3 مشاريع)
                </li>
                <li className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-primary" />
                  متابعة حالة المقترحات واختيار المشروع النهائي
                </li>
              </ul>
              <div className="mt-auto pt-4">
                <Button asChild variant="ghost" className="w-full justify-center">
                  <Link to="/signup" className="flex items-center gap-2">
                    تسجيل حساب طالب
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-xl shadow-md border bg-card p-6 flex flex-col">
              <div className="bg-primary/10 p-3 rounded-full self-start mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-4">للأساتذة</h3>
              <ul className="mt-2 text-sm text-muted-foreground space-y-3">
                <li className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-primary" />
                  إنشاء وإدارة مشاريع التخرج
                </li>
                <li className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-primary" />
                  مراجعة مقترحات الطلاب والموافقة عليها
                </li>
                <li className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-primary" />
                  متابعة المشاريع المعتمدة ووضعها الحالي
                </li>
              </ul>
              <div className="mt-auto pt-4">
                <Button asChild variant="ghost" className="w-full justify-center">
                  <Link to="/login?tab=teacher" className="flex items-center gap-2">
                    تسجيل دخول كأستاذ
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-background/80">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 text-center sm:text-right justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold">منصة التأطير</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
