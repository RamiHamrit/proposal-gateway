
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
  
  // Wait for auth to initialize
  if (status === 'idle') {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="animate-pulse">جاري التحميل...</span>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }
  
  // Check role access if specified
  if (allowedRole && user && user.role !== allowedRole) {
    // Redirect to the appropriate dashboard based on the user's role
    return <Navigate to={user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'} replace />;
  }
  
  return element;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, status } = useAuth();
  
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
            status === 'idle' ? (
              <div className="min-h-screen flex items-center justify-center">
                <span className="animate-pulse">جاري التحميل...</span>
              </div>
            ) : status === 'authenticated' && user ? (
              <Navigate 
                to={user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'} 
                replace 
              />
            ) : (
              <Index />
            )
          } 
        />
        
        <Route 
          path="/login" 
          element={
            status === 'idle' ? (
              <div className="min-h-screen flex items-center justify-center">
                <span className="animate-pulse">جاري التحميل...</span>
              </div>
            ) : status === 'authenticated' && user ? (
              <Navigate 
                to={user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'} 
                replace 
              />
            ) : (
              <Login />
            )
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            status === 'idle' ? (
              <div className="min-h-screen flex items-center justify-center">
                <span className="animate-pulse">جاري التحميل...</span>
              </div>
            ) : status === 'authenticated' && user ? (
              <Navigate 
                to={user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'} 
                replace 
              />
            ) : (
              <SignUp />
            )
          } 
        />
        
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
      <AuthProvider>
        <AppContent />
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
