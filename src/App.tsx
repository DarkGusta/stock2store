
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/components/auth/Login';
import MainLayout from '@/components/layout/MainLayout';
import Warehouse from '@/pages/Warehouse';
import Store from '@/pages/Store';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Analytics from '@/pages/Analytics';
import Profile from '@/pages/Profile';
import Users from '@/pages/Users';
import Orders from '@/pages/Orders';
import Returns from '@/pages/Returns';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Router basename="/stock2store">
                <Routes>
                  {/* Root route redirects to login or appropriate role page */}
                  <Route path="/" element={
                    <ProtectedRoute resource="store" action="view" fallbackPath="/login">
                      <MainLayout>
                        <Store />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/warehouse" element={
                    <ProtectedRoute resource="warehouse" action="view" fallbackPath="/store">
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
                  
                  <Route path="/cart" element={
                    <ProtectedRoute resource="cart" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Cart />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/checkout" element={
                    <ProtectedRoute resource="checkout" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Checkout />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/analytics" element={
                    <ProtectedRoute resource="analytics" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Analytics />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/users" element={
                    <ProtectedRoute resource="users" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Users />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute resource="orders" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Orders />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/returns" element={
                    <ProtectedRoute resource="returns" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Returns />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute resource="profile" action="view" fallbackPath="/store">
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </CartProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
