
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import InventoryManagement from "./pages/InventoryManagement";
import InventoryAnalytics from "./pages/InventoryAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

const App = () => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/management/:id" element={<InventoryManagement />} />
            <Route path="/inventory/analytics" element={<InventoryAnalytics />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
