import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import CartDrawer from '../Cart/CartDrawer';
import SearchModal from '../Search/SearchModal';
import AuthModal from '../Auth/AuthModal';

const Layout = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isInitialized } = useSelector((state) => state.cart);

  useEffect(() => {
    // Restore user session on app load if token exists and user is not already loaded
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Fetch cart when user is authenticated and cart is not initialized
    if (isAuthenticated && user && !isInitialized) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, user, isInitialized, dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Global Modals and Drawers */}
      <CartDrawer />
      <SearchModal />
      <AuthModal />

    </div>
  );
};

export default Layout;
