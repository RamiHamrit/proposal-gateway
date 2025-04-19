import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, Settings, User, GraduationCap } from "lucide-react";
import UserSettingsDialog from "./UserSettingsDialog";

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#635BFF]/10 p-2 rounded-lg border border-[#635BFF]/20">
            <GraduationCap className="h-6 w-6 text-[#635BFF]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#0A2540] to-[#0A2540]/80 bg-clip-text text-transparent font-tajwal">
            {title || "منصة التأطير"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-[#0A2540]">
                <div className="bg-[#635BFF]/10 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-[#635BFF]" />
                </div>
                <span className="text-sm font-medium">
                  <span className="font-inter">{user.name}</span>
                  <span className="text-sm text-[#0A2540]/70 mr-2 font-tajwal">
                    ({user.role === 'student' ? 'طالب' : 'أستاذ'})
                  </span>
                </span>
              </div>
              
              {user.role === 'student' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  className="text-[#0A2540]/70 hover:text-[#0A2540]"
                >
                  <Settings className="h-8 w-8" />
                </Button>
              )}
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={signOut}
                className="btn-secondary shadow-none outline outline-1 outline-sky-100 hover:shadow-none hover:outline-sky-200 hover:bg-sky-50 font-tajwal"
              >
                <LogOut className="h-3 w-3 ml-1" />
                <span>تسجيل الخروج</span>
              </Button>
              
              {user && user.role === 'student' && (
                <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
              )}
            </>
          ) : (
            <div className="flex gap-3">
              <Button asChild size="sm" variant="secondary" className="btn-secondary font-tajwal">
                <Link to="/login"><span> الدخول</span></Link>
              </Button>
              <Button asChild size="sm" className="shadow-sm transition-all hover:shadow-md bg-[#635BFF] hover:bg-[#635BFF]/90 font-tajwal">
                <Link to="/signup"><span>إنشاء حساب</span></Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
