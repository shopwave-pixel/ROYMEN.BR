import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Dashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ProductsManagement from './pages/admin/ProductsManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import Analytics from './pages/admin/Analytics';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          
          {/* Main client application layer */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected Client Routes */}
            <Route 
              path="checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Protected Owner/Admin Dashboard space */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Catch all redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
