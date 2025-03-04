
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  const handleTeacherLogin = () => {
    navigate('/login?role=teacher');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-10">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold">
            نظام اختيار مشاريع التخرج
          </h1>
          <p className="text-muted-foreground mt-2">
            منصة لإدارة وتسهيل عملية اختيار مشاريع التخرج للطلاب والأساتذة.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">للأساتذة</CardTitle>
              <CardDescription>
                قم بإنشاء مشاريع جديدة وإدارة طلبات الطلاب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2">
                  <li>إنشاء وإدارة المشاريع الخاصة بك.</li>
                  <li>استقبال طلبات الطلاب ومراجعتها.</li>
                  <li>الموافقة على الطلاب وتوجيههم.</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleTeacherLogin}>
                تسجيل الدخول كأستاذ
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">للطلاب</CardTitle>
              <CardDescription>
                تصفح المشاريع المتاحة وقدم طلبك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2">
                  <li>تصفح قائمة المشاريع المتاحة.</li>
                  <li>تقديم طلبات للمشاريع التي تهمك.</li>
                  <li>تتبع حالة طلبك والتواصل مع المشرف.</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/login">تسجيل الدخول كطالب</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
