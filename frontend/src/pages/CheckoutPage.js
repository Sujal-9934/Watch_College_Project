import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { CreditCardIcon, BanknotesIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import OrderSuccessModal from '../components/Checkout/OrderSuccessModal';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totals, loading: cartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading: orderLoading } = useSelector((state) => state.orders);

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'cod',
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [orderInProgress, setOrderInProgress] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [dispatch, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a more detailed address';
    }

    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    // Zip code validation (India: 6 digits)
    const zipRegex = /^\d{6}$/;
    if (!formData.zipCode) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit zip code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    if (formData.paymentMethod === 'razorpay') {
      setShowQRModal(true);
      return;
    }

    processOrder();
  };

  const processOrder = async () => {
    try {
      setOrderInProgress(true);
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        orderNotes: formData.orderNotes || '',
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      
      if (result.success) {
        setPlacedOrderDetails(result.data);
        setShowSuccessModal(true);
        dispatch(clearCart());
        // We handle navigation in the modal's onClose handler
      } else {
        toast.error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setOrderInProgress(false);
      setShowQRModal(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                  formData.paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <BanknotesIcon className="h-6 w-6 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive</div>
                  </div>
                </label>
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                  formData.paymentMethod === 'razorpay' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={formData.paymentMethod === 'razorpay'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <CreditCardIcon className="h-6 w-6 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">Razorpay</div>
                    <div className="text-sm text-gray-600">Pay with card, UPI, or wallet</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                name="orderNotes"
                value={formData.orderNotes || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Any special instructions for delivery..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 18%)</span>
                  <span>₹{totals.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{totals.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* QR Code Modal for Payment */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Scan to Pay</h2>
              <p className="text-sm text-gray-600 mb-6">Total: <span className="font-bold text-primary-600 text-lg">₹{totals.total.toLocaleString('en-IN')}</span></p>
              
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=sujalvadhaiya531@okicici&pn=Sujal%20Vadhaiya&tn=Order%20Payment&am=${totals.total}&cu=INR`}
                  alt="Payment QR Code"
                  className="mx-auto w-full max-w-[200px]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-blue-50 py-2 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Waiting for transaction...
                </div>
                
                <button
                  onClick={processOrder}
                  disabled={orderInProgress}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {orderInProgress ? 'Processing...' : 'I Have Paid'}
                </button>
                
                <p className="text-[10px] text-gray-400">
                  Scan the QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Animation Modal */}
      <OrderSuccessModal 
        isOpen={showSuccessModal} 
        orderDetails={placedOrderDetails}
        onClose={(toOrderDetails) => {
          setShowSuccessModal(false);
          if (toOrderDetails) {
            navigate(`/orders/${placedOrderDetails?.id}`);
          } else {
            navigate('/products');
          }
        }}
      />
    </div>
  );
};

export default CheckoutPage;
