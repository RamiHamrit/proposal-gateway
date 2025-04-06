
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import UserSettingsDialog from "./UserSettingsDialog";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Navbar: Logout button clicked");
      
      // Show logout toast immediately for better UX
      toast({
        title: "جاري تسجيل الخروج",
        description: "جاري تسجيل خروجك من النظام...",
      });
      
      await logout();
      console.log("Navbar: Logout completed");
      
      // Force page reload after a short delay to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error("Navbar: Logout error:", error);
      
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج. جاري إعادة التحميل...",
        variant: "destructive",
      });
      
      // Force a page reload to clear all state if there was an error
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-heading font-bold">
            {title || "نظام اختيار مشاريع التخرج"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {user.name}
                  <span className="text-xs text-muted-foreground mr-2">
                    ({user.role === 'student' ? 'طالب' : 'أستاذ'})
                  </span>
                </span>
              </div>
              
              {user.role === 'student' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 ml-2" />
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </Button>
              
              {user && user.role === 'student' && (
                <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">إنشاء حساب</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
