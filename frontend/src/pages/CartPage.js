import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/slices/cartSlice';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totals, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    } else {
      navigate('/login');
    }
  }, [dispatch, user, navigate]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      dispatch(fetchCart()); // Refresh cart
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      dispatch(fetchCart()); // Refresh cart
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error(error.message || 'Failed to clear cart');
      }
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
            <p className="text-red-600">{error.message || 'Failed to load cart'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBagIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x200?text=Watch';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">⌚</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link to={`/products/${item.product_id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-1">
                        {item.product_name}
                      </h3>
                    </Link>
                    {item.product_sku && (
                      <p className="text-sm text-gray-500 mb-2">SKU: {item.product_sku}</p>
                    )}
                    <p className="text-lg font-bold text-gray-900">
                      ₹{parseFloat(item.price).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 mb-4"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Total: ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 18%)</span>
                  <span>₹{totals.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{totals.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors mb-4"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/products"
                className="block w-full text-center text-gray-600 hover:text-gray-900 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
