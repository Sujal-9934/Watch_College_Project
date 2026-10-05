import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setCartDrawerOpen } from '../../redux/slices/uiSlice';
import { fetchCart, updateCartItem, removeFromCart } from '../../redux/slices/cartSlice';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { cartDrawerOpen } = useSelector((state) => state.ui);
  const { items, totals, loading } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (cartDrawerOpen && isAuthenticated && user) {
      dispatch(fetchCart());
    }
  }, [cartDrawerOpen, isAuthenticated, user, dispatch]);

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

  if (!cartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => dispatch(setCartDrawerOpen(false))}
        ></div>

        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <button
                    onClick={() => dispatch(setCartDrawerOpen(false))}
                    className="ml-3 h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="mt-8">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500">Loading cart...</p>
                    </div>
                  ) : !isAuthenticated || !user ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Please login to view your cart</p>
                      <Link
                        to="/login"
                        onClick={() => dispatch(setCartDrawerOpen(false))}
                        className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        Login
                      </Link>
                    </div>
                  ) : !items || items.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🛒</div>
                      <p className="text-gray-500">Your cart is empty</p>
                      <Link
                        to="/products"
                        onClick={() => dispatch(setCartDrawerOpen(false))}
                        className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {items.map((item) => (
                          <li key={item.id} className="py-6 flex">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.image || item.product_image || 'https://via.placeholder.com/100?text=Watch'}
                                alt={item.product_name || 'Product'}
                                className="h-full w-full object-cover object-center"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/100?text=Watch';
                                }}
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.product_name || 'Product'}</h3>
                                  <p className="ml-4">₹{parseFloat(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                </div>
                                {item.variant_name && (
                                  <p className="mt-1 text-sm text-gray-500">{item.variant_name}: {item.variant_value}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} each</p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </button>
                                  <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isAuthenticated && user && items && items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                    <p>Subtotal</p>
                    <p>₹{parseFloat(totals.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <p>Tax (GST)</p>
                    <p>₹{parseFloat(totals.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-4 pt-2 border-t border-gray-200">
                    <p>Total</p>
                    <p>₹{parseFloat(totals.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
                  <div className="space-y-3">
                    <Link
                      to="/checkout"
                      onClick={() => dispatch(setCartDrawerOpen(false))}
                      className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors text-center block"
                    >
                      Checkout
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => dispatch(setCartDrawerOpen(false))}
                      className="w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center block"
                    >
                      View Cart
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CartDrawer;
