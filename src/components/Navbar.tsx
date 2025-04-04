
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import UserSettingsDialog from "./UserSettingsDialog";

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Navbar: Logout button clicked");
      await logout();
      console.log("Navbar: Logout completed, redirecting to home");
      
      // Force navigation to home page after successful logout
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Navbar: Logout error:", error);
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
