import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isInWishlist = wishlistItems.some(item => item.product_id === product.id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id)).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(product.id)).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      toast.success('Added to cart');
      // Refresh cart to show updated items
      const { fetchCart } = await import('../../redux/slices/cartSlice');
      dispatch(fetchCart());
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const discountPercentage = product.discount_percentage || 0;
  const originalPrice = product.original_price || product.price;
  const finalPrice = product.price;

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group animate-fade-in-up hover-lift"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* Product Image */}
          {product.images && product.images.length > 0 && product.images[0] ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton animate-shimmer" />
              )}
              <img
                src={product.images[0]}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=Watch';
                  setImageLoaded(true);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-6xl animate-pulse">⌚</span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce-in">
              -{Math.round(discountPercentage)}% OFF
            </div>
          )}

          {/* New Arrival Badge */}
          {product.is_featured && (
            <div className="absolute top-3 right-12 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce-in">
              NEW
            </div>
          )}

          {/* Out of Stock Badge */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold bg-red-600 px-4 py-2 rounded-lg shadow-xl animate-scale-in">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-lg transition-all duration-300 ${
              isInWishlist 
                ? 'bg-red-50 scale-110 animate-bounce-in' 
                : 'hover:bg-red-50 hover:scale-110'
            }`}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500 animate-scale-in" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Quick Add to Cart (visible on hover) */}
          {product.stock_quantity > 0 && (
            <div className={`absolute bottom-0 left-0 right-0 transform transition-all duration-500 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}>
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 font-semibold flex items-center justify-center space-x-2 hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-xl"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand_name && (
            <p className="text-sm text-gray-500 mb-3 font-medium">{product.brand_name}</p>
          )}

          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-4 w-4 transition-all duration-200 ${
                      star <= product.average_rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{parseFloat(finalPrice).toLocaleString('en-IN')}
            </span>
            {originalPrice && parseFloat(originalPrice) > parseFloat(finalPrice) && (
              <span className="text-sm text-gray-500 line-through">
                ₹{parseFloat(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-3">
            {product.stock_quantity > 10 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ In Stock
              </span>
            ) : product.stock_quantity > 0 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⚠ Only {product.stock_quantity} left
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ✗ Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
