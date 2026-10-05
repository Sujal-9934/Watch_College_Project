import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder } from '../redux/slices/orderSlice';
import OrderTracker from '../components/Order/OrderTracker';
import { MapPinIcon, CreditCardIcon, DocumentArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [id, dispatch, user, navigate]);

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(currentOrder.id)).unwrap();
        toast.success('Order cancelled successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to cancel order');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 text-lg mb-4">{error?.message || 'Order not found'}</p>
            <Link
              to="/orders"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/orders"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors"
          >
            <span className="mr-2">←</span> Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{currentOrder.order_number}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                  const token = localStorage.getItem('token');
                  const response = await axios.get(`${API_BASE_URL}/orders/${currentOrder.id}/receipt`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `Order-${currentOrder.order_number}-Receipt.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  toast.success('Receipt downloaded successfully');
                } catch (error) {
                  console.error('Download error:', error);
                  toast.error('Failed to download receipt');
                }
              }}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              Download Receipt
            </button>
            {(currentOrder.status === 'pending' || currentOrder.status === 'confirmed') && (
              <button
                onClick={handleCancelOrder}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium shadow-sm"
              >
                <XCircleIcon className="h-5 w-5" />
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Tracker */}
        <OrderTracker order={currentOrder} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-6">
                {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                  currentOrder.order_items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b last:border-0 last:pb-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Watch';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">⌚</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/products/${item.product_id}`}
                          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors block mb-2"
                        >
                          {item.product_name}
                        </Link>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p>SKU: {item.product_sku}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Unit Price: ₹{parseFloat(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{parseFloat(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No items found</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-primary-600" />
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{parseFloat(currentOrder.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {currentOrder.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span className="font-medium">₹{parseFloat(currentOrder.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {currentOrder.shipping_amount > 0 ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">₹{parseFloat(currentOrder.shipping_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-green-600">
                    <span>Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                )}
                {currentOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{parseFloat(currentOrder.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">₹{parseFloat(currentOrder.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {currentOrder.shipping_address && (
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Shipping Address
                </h2>
                <div className="text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-900">
                    {currentOrder.shipping_address.first_name} {currentOrder.shipping_address.last_name}
                  </p>
                  <p>{currentOrder.shipping_address.address}</p>
                  <p>
                    {currentOrder.shipping_address.city}, {currentOrder.shipping_address.state} -{' '}
                    {currentOrder.shipping_address.zip_code}
                  </p>
                  <p>{currentOrder.shipping_address.country}</p>
                  {currentOrder.shipping_address.phone && (
                    <p className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-medium">Phone:</span> {currentOrder.shipping_address.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">{currentOrder.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span
                    className={`font-semibold ${
                      currentOrder.payment_status === 'paid'
                        ? 'text-green-600'
                        : currentOrder.payment_status === 'failed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {currentOrder.payment_status.charAt(0).toUpperCase() + currentOrder.payment_status.slice(1)}
                  </span>
                </div>
                {currentOrder.payment_id && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Payment ID:</p>
                    <p className="font-mono text-sm break-all">{currentOrder.payment_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {currentOrder.order_notes && (
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes</h2>
                <p className="text-gray-600">{currentOrder.order_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
