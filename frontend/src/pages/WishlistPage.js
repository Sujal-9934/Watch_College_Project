import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import ProductCard from '../components/Product/ProductCard';
import { HeartIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    } else {
      navigate('/login');
    }
  }, [dispatch, user, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
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
            <p className="text-red-600">{error.message || 'Failed to load wishlist'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <HeartIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding products you love to your wishlist!</p>
            <a
              href="/products"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist ({items.length})</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product || item; // Handle both structures
            return (
              <div key={item.id || item.product_id} className="relative">
                <ProductCard product={product} />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors"
                    title="Add to Cart"
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <HeartIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
