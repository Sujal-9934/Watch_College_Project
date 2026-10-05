import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const SellerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/seller' },
    { name: 'My Products', icon: CubeIcon, path: '/seller/products' },
    { name: 'Orders', icon: ShoppingBagIcon, path: '/seller/orders' },
    { name: 'Analytics', icon: ChartBarIcon, path: '/seller/analytics' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/seller/settings' },
  ];

  const isActive = (itemPath) => {
    if (itemPath === '/seller') return location.pathname === '/seller';
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link to="/seller" className="block">
          <h2 className="text-xl font-bold text-gray-900">Seller Panel</h2>
          <p className="text-xs text-gray-500 mt-1">Manage Your Store</p>
        </Link>
      </div>
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                active ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600 font-medium' : ''
              }`}
            >
              <Icon className="h-5 w-5 mr-3 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/"
          className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          <span>← Back to Store</span>
        </Link>
      </div>
    </div>
  );
};

export default SellerSidebar;
