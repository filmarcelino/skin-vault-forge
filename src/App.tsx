import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import InventoryManagement from "./pages/InventoryManagement";
import InventoryAnalytics from "./pages/InventoryAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import SteamAuth from "./pages/SteamAuth";
import Login from "./pages/Login";
import { supabase } from "@/integrations/supabase/client";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (!session && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/auth')) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (!isAuthenticated && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/auth')) {
      navigate('/login');
      return null;
    }

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/steam-auth" element={<SteamAuth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/management/:id"
              element={
                <ProtectedRoute>
                  <InventoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/analytics"
              element={
                <ProtectedRoute>
                  <InventoryAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
