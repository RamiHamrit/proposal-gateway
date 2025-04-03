
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
  
  if (status === 'idle') {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="animate-pulse">جاري التحميل...</span>
    </div>;
  }
  
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Initialize local storage data
    initializeData();
  }, []);
  
  return (
    <BrowserRouter>
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
