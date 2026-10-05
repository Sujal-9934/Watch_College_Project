import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { initializeUI } from './redux/slices/uiSlice';

// Layout Components
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/AdminLayout';
import SellerLayout from './components/Seller/SellerLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import SellerRoute from './components/Auth/SellerRoute';

// Page Components
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import BoutiquesPage from './pages/BoutiquesPage';
import RewardsPage from './pages/RewardsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminBrands from './pages/Admin/AdminBrands';
import AdminSliders from './pages/Admin/AdminSliders';

// Seller Pages
import SellerDashboard from './pages/Seller/SellerDashboard';
import SellerProducts from './pages/Seller/SellerProducts';
import SellerOrders from './pages/Seller/SellerOrders';
import SellerAnalytics from './pages/Seller/SellerAnalytics';
import SellerSettings from './pages/Seller/SellerSettings';

function App() {
  useEffect(() => {
    // Initialize UI settings
    store.dispatch(initializeUI());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Admin Routes - Separate Layout with Sidebar */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="sliders" element={<AdminSliders />} />
            </Route>

            {/* Seller Routes - Separate Layout with Sidebar */}
            <Route path="/seller" element={
              <SellerRoute>
                <SellerLayout />
              </SellerRoute>
            }>
              <Route index element={<SellerDashboard />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="analytics" element={<SellerAnalytics />} />
              <Route path="settings" element={<SellerSettings />} />
            </Route>

            {/* Public & User Routes - Regular Layout with Header/Footer */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="category/:categorySlug" element={<ProductListPage />} />
              <Route path="search" element={<ProductListPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="boutiques" element={<BoutiquesPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route path="checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="orders/:id" element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />
              <Route path="rewards" element={
                <ProtectedRoute>
                  <RewardsPage />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
