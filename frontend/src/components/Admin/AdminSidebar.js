import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TagIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/admin' },
    { name: 'Categories', icon: TagIcon, path: '/admin/categories' },
    { name: 'Brands', icon: SparklesIcon, path: '/admin/brands' },
    { name: 'Users', icon: UserGroupIcon, path: '/admin/users' },
    { name: 'Sliders', icon: PhotoIcon, path: '/admin/sliders' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link to="/admin" className="block">
          <h2 className="text-xl font-bold text-gray-900">My Clock Admin</h2>
          <p className="text-xs text-gray-500 mt-1">Store Management Panel</p>
        </Link>
      </div>
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.name}</span>
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

export default AdminSidebar;

