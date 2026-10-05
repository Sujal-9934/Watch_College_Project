import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders, cancelOrder } from '../redux/slices/orderSlice';
import { TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error, pagination } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        toast.success('Order cancelled successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to cancel order');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error.message || 'Failed to load orders'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <TruckIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.order_items?.length || 0} item(s)
                    </p>
                  </div>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <div className="space-y-2">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.product_name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.order_items.length - 3} more item(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex-1 text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    View Details
                  </Link>
                  {order.status === 'pending' || order.status === 'confirmed' ? (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  ) : null}
                  {order.status === 'delivered' && (
                    <button className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
