import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { setCartDrawerOpen, setSearchModalOpen, setAuthModalOpen, toggleSidebar } from '../../../redux/slices/uiSlice';
import { logoutUser } from '../../../redux/slices/authSlice';
import { clearCartLocal } from '../../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import NavigationMenu from './NavigationMenu';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart.totals);

  const handleLogout = async () => {
    try {
      dispatch(clearCartLocal());
      await dispatch(logoutUser());
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      dispatch(clearCartLocal());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row - Logo, Search, Icons */}
        <div className="flex items-center justify-between h-20 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors duration-300">
              My Clock
              <span className="text-primary-600 ml-1 animate-pulse">⏰</span>
            </h1>
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Q Search Product, Brands"
                onClick={() => dispatch(setSearchModalOpen(true))}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search - Mobile */}
            <button
              onClick={() => dispatch(setSearchModalOpen(true))}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
            >
              <HeartIcon className="h-6 w-6" />
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(setCartDrawerOpen(true))}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.first_name || 'Account'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === 'seller' && (
                    <Link
                      to="/seller"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => dispatch(setAuthModalOpen(true))}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <UserIcon className="h-6 w-6" />
                <span className="hidden sm:block text-sm font-medium">Account</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                dispatch(toggleSidebar());
              }}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Links Row with Dropdown Menus */}
        <NavigationMenu />
      </div>
    </header>
  );
};

export default Header;
