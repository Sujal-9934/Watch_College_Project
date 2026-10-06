import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../redux/slices/adminSlice';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Crunching your data...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardStats?.stats || {};
  const recentOrders = dashboardStats?.recentOrders || [];
  const lowStockProducts = dashboardStats?.lowStockProducts || [];
  const salesByMonth = dashboardStats?.salesByMonth || [];
  const categoryStats = dashboardStats?.categoryStats || [];

  const statCards = [
    {
      name: 'Total Revenue',
      value: `₹${(stats.revenue?.total || 0).toLocaleString('en-IN')}`,
      icon: CurrencyDollarIcon,
      color: 'bg-indigo-600',
      link: '/admin/orders',
      trend: '+12.5%',
    },
    {
      name: 'Total Orders',
      value: stats.orders?.total || 0,
      icon: ChartBarIcon,
      color: 'bg-primary-600',
      link: '/admin/orders',
      trend: '+5.2%',
    },
    {
      name: 'Active Products',
      value: stats.products?.active || 0,
      icon: ShoppingBagIcon,
      color: 'bg-emerald-600',
      link: '/admin/products',
    },
    {
      name: 'Total Users',
      value: stats.users?.total || 0,
      icon: UserGroupIcon,
      color: 'bg-violet-600',
      link: '/admin/users',
    },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Overview of your online store performance</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={() => dispatch(fetchDashboardStats())}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                to={stat.link}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 group"
              >
                <dt>
                  <div className={`absolute ${stat.color} rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend && (
                    <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" aria-hidden="true" />
                      <span className="sr-only"> Increased by </span>
                      {stat.trend}
                    </p>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <span className="font-medium text-primary-600 hover:text-primary-500">View detailed reports</span>
                    </div>
                  </div>
                </dd>
              </Link>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
              <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-1">
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByMonth}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                    tickFormatter={(value) => `₹${value >= 1000 ? value / 1000 + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
              <Link to="/admin/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 6).map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {order.first_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">#{order.order_number}</p>
                        <p className="text-xs text-gray-500">{order.first_name} {order.last_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent transactions to show</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Inventory Alerts</h2>
              <Link to="/admin/products" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
                Manage Stock
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${parseInt(product.stock_quantity) === 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 italic">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${parseInt(product.stock_quantity) === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock_quantity} left
                      </p>
                      <p className="text-xs text-gray-400">Restock Soon</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">All products are well stocked!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
