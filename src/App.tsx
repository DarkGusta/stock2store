
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Warehouse from "./pages/Warehouse";
import Store from "./pages/Store";
import Analytics from "./pages/Analytics";
import Login from "./components/auth/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";

// Protected route component
const ProtectedRoute = ({ children, path }: { children: React.ReactNode, path: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect customer users to the store page when they try to access the dashboard
  if (path === '/' && user.role === 'customer') {
    return <Navigate to="/store" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute path="/">
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute path="/products">
          <Products />
        </ProtectedRoute>
      } />
      <Route path="/warehouse" element={
        <ProtectedRoute path="/warehouse">
          <Warehouse />
        </ProtectedRoute>
      } />
      <Route path="/store" element={
        <ProtectedRoute path="/store">
          <Store />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute path="/analytics">
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute path="/profile">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Profile</h1>
            <p>Your profile details will be displayed here.</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute path="/cart">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
            <p>Your shopping cart items will be displayed here.</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/returns" element={
        <ProtectedRoute path="/returns">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Returns</h1>
            <p>Your return requests will be displayed here.</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute path="/settings">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p>Your account settings will be displayed here.</p>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
