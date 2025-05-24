
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/components/auth/Login';
import MainLayout from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import Warehouse from '@/pages/Warehouse';
import Store from '@/pages/Store';
import Analytics from '@/pages/Analytics';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute resource="dashboard" action="view" fallbackPath="/login">
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/warehouse" element={
                <ProtectedRoute resource="warehouse" action="view" fallbackPath="/login">
                  <MainLayout>
                    <Warehouse />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/store" element={
                <ProtectedRoute resource="store" action="view" fallbackPath="/login">
                  <MainLayout>
                    <Store />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute resource="analytics" action="view" fallbackPath="/login">
                  <MainLayout>
                    <Analytics />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute resource="profile" action="view" fallbackPath="/login">
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
