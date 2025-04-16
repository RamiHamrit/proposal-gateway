import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, GraduationCap, User, ExternalLink, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen flex flex-col text-[#0A2540]">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#635BFF] to-[#a59fff] opacity-10"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="absolute top-0 left-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#635BFF] to-[#a59fff] opacity-10"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>

      <header className="border-b border-border/40 bg-background/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#635BFF]/10 p-2 rounded-lg border border-[#635BFF]/20">
              <GraduationCap className="h-6 w-6 text-[#635BFF]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#0A2540] to-[#0A2540]/80 bg-clip-text text-transparent">منصة التأطير</h1>
          </div>
          <div className="flex gap-3">
            <Button asChild size="sm" variant="secondary" className="btn-secondary">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild size="sm" className="shadow-sm transition-all hover:shadow-md bg-[#635BFF] hover:bg-[#635BFF]/90">
              <Link to="/signup">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-16 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="relative">
              <h1 className="font-heading text-4xl lg:text-5xl font-bold tracking-tight text-[#0A2540]">
                نظام إدارة مشاريع
                <br />
                <span className="text-[#635BFF] relative inline-block">
                  التخرج
                  <div className="absolute -top-1 -right-4 text-[#635BFF]">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                </span> للطلاب
              </h1>
              <p className="mt-6 text-xl text-[#0A2540]/70 leading-relaxed">
                منصة شاملة للطلاب والأساتذة لإدارة مشاريع التخرج بكفاءة وسهولة
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-lg shadow-md bg-[#635BFF] hover:bg-[#635BFF]/90 transition-all duration-300">
                <Link to="/signup" className="flex items-center">
                  تسجيل حساب طالب
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="btn-secondary w-full sm:w-auto rounded-lg">
                <Link to="/login?tab=teacher" className="flex items-center">
                  تسجيل دخول الأساتذة
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#635BFF]/10 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 divide-y divide-[#635BFF]/10">
              <div className="p-8 flex items-start gap-5">
                <div className="bg-[#635BFF]/15 p-4 rounded-full shadow-inner">
                  <GraduationCap className="h-7 w-7 text-[#635BFF]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0A2540]">للطلاب</h3>
                  <ul className="mt-4 text-sm text-[#0A2540]/70 space-y-3">
                    <li className="flex items-center gap-3 group">
                      <ArrowRight className="h-3.5 w-3.5 text-[#635BFF] group-hover:translate-x-1 transition-transform" />
                      <span className="group-hover:text-[#0A2540] transition-colors">تصفح مشاريع التخرج المتاحة</span>
                    </li>
                    <li className="flex items-center gap-3 group">
                      <ArrowRight className="h-3.5 w-3.5 text-[#635BFF] group-hover:translate-x-1 transition-transform" />
                      <span className="group-hover:text-[#0A2540] transition-colors">تقديم مقترحات للمشاريع (حتى 3 مشاريع)</span>
                    </li>
                    <li className="flex items-center gap-3 group">
                      <ArrowRight className="h-3.5 w-3.5 text-[#635BFF] group-hover:translate-x-1 transition-transform" />
                      <span className="group-hover:text-[#0A2540] transition-colors">متابعة حالة المقترحات واختيار المشروع النهائي</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-8 flex items-start gap-5">
                <div className="bg-[#635BFF]/15 p-4 rounded-full shadow-inner">
                  <User className="h-7 w-7 text-[#635BFF]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0A2540]">للأساتذة</h3>
                  <ul className="mt-4 text-sm text-[#0A2540]/70 space-y-3">
                    <li className="flex items-center gap-3 group">
                      <ArrowRight className="h-3.5 w-3.5 text-[#635BFF] group-hover:translate-x-1 transition-transform" />
                      <span className="group-hover:text-[#0A2540] transition-colors">إنشاء وإدارة مشاريع التخرج</span>
                    </li>
                    <li className="flex items-center gap-3 group">
                      <ArrowRight className="h-3.5 w-3.5 text-[#635BFF] group-hover:translate-x-1 transition-transform" />
                      <span className="group-hover:text-[#0A2540] transition-colors">مراجعة مقترحات الطلاب والموافقة عليها</span>
                    </li>
                    <li className="flex items-center gap-3 group">
                      <ArrowRight className="h-3.5 w-3.5 text-[#635BFF] group-hover:translate-x-1 transition-transform" />
                      <span className="group-hover:text-[#0A2540] transition-colors">متابعة المشاريع المعتمدة ووضعها الحالي</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#635BFF]/10 bg-background/50 backdrop-blur-sm mt-auto">
        <div className="container flex flex-col gap-2 sm:flex-row py-8 text-center sm:text-right justify-between items-center">
          <p className="text-sm text-[#0A2540]/70">
            &copy; {new Date().getFullYear()} منصة التأطير. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
