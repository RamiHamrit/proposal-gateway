
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthProviders } from '@/components/SupabaseAuthProvider';
import { initializeData } from "@/utils/api";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import NotFound from "./pages/NotFound";

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ 
  element, 
  allowedRole 
}: { 
  element: JSX.Element; 
  allowedRole?: 'student' | 'teacher';
}) => {
  const { user, status } = useAuth();
  
  // Added extra logging for debugging auth state
  console.log("ProtectedRoute check - Status:", status, "User:", user?.id);
  
  if (status === 'idle') {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="animate-pulse">جاري التحميل...</span>
    </div>;
  }
  
  if (status === 'unauthenticated') {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    console.log(`User role ${user?.role} does not match required role ${allowedRole}, redirecting to home`);
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, status } = useAuth();
  
  useEffect(() => {
    // Initialize local storage data
    initializeData();
    
    // Log auth status changes for debugging
    console.log("App auth status changed:", status, user?.id);
  }, [user, status]);
  
  // Force re-evaluate routes when auth status changes
  const key = `auth-${status}-${user?.id || "none"}`;
  
  return (
    <BrowserRouter key={key}>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate 
                to={user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'} 
                replace 
              />
            ) : (
              <Index />
            )
          } 
        />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute 
              element={<StudentDashboard />} 
              allowedRole="student" 
            />
          }
        />
        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute 
              element={<TeacherDashboard />} 
              allowedRole="teacher" 
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProviders>
        <AppContent />
        <Toaster />
        <Sonner />
      </AuthProviders>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
