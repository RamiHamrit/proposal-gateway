
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <div className="text-center max-w-md w-full animate-fade-in">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-6">الصفحة غير موجودة</p>
        <p className="text-muted-foreground mb-8">
          نأسف، لكن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Button asChild size="lg">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى الصفحة الرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
