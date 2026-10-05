import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../redux/slices/productSlice';
import { addToCart, fetchCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../redux/slices/wishlistSlice';
import ProductCard from '../components/Product/ProductCard';
import { HeartIcon, ShoppingCartIcon, StarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [id, dispatch, user]);

  const isInWishlist = product && wishlistItems.some(item => item.product_id === product.id);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
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
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    // Validate quantity
    if (!quantity || quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    if (quantity > 100) {
      toast.error('Maximum quantity per item is 100');
      return;
    }

    // Check stock availability
    const availableStock = selectedVariant?.stock_quantity || product?.stock_quantity || 0;
    if (availableStock < quantity) {
      toast.error(`Only ${availableStock} item(s) available in stock`);
      return;
    }

    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity: parseInt(quantity),
        variantId: selectedVariant?.id
      })).unwrap();
      toast.success('Added to cart successfully!');
      // Refresh cart to show updated items
      dispatch(fetchCart());
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity,
        variantId: selectedVariant?.id
      })).unwrap();
      // Refresh cart before navigating to checkout
      await dispatch(fetchCart());
      navigate('/checkout');
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error?.message || 'Product not found'}</p>
            <Link to="/products" className="text-primary-600 hover:text-primary-700">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImageIndex]?.image_url || images[selectedImageIndex] || '';
  const finalPrice = selectedVariant 
    ? product.price + (selectedVariant.price_modifier || 0)
    : product.price;
  const originalPrice = product.original_price || product.price;
  const discountPercentage = product.discount_percentage || 0;
  const isOutOfStock = (selectedVariant?.stock_quantity || product.stock_quantity) === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-primary-600">Products</Link></li>
            {product.category_name && (
              <>
                <li>/</li>
                <li><Link to={`/category/${product.category_slug}`} className="hover:text-primary-600">{product.category_name}</Link></li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=Watch';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">⌚</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, index) => {
                  const imgUrl = img.image_url || img;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-2xl">⌚</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              {product.brand_name && (
                <Link
                  to={`/products?brand=${product.brand_slug}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {product.brand_name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>
              
              {/* Rating */}
              {product.average_rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= product.average_rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.average_rating.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > finalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="text-sm font-medium text-red-600">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock_quantity === 0}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : variant.stock_quantity === 0
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-primary-600'
                      }`}
                    >
                      {variant.variant_name}: {variant.variant_value}
                      {variant.stock_quantity === 0 && ' (Out of Stock)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedVariant?.stock_quantity || product.stock_quantity}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const max = selectedVariant?.stock_quantity || product.stock_quantity;
                    setQuantity(Math.min(Math.max(1, val), max));
                  }}
                  className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => {
                    const max = selectedVariant?.stock_quantity || product.stock_quantity;
                    setQuantity(Math.min(quantity + 1, max));
                  }}
                  disabled={quantity >= (selectedVariant?.stock_quantity || product.stock_quantity)}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {selectedVariant?.stock_quantity || product.stock_quantity} available
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Out of Stock
                </span>
              ) : (selectedVariant?.stock_quantity || product.stock_quantity) < 10 ? (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Only {(selectedVariant?.stock_quantity || product.stock_quantity)} left
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  In Stock
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 transition-colors"
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Product Details */}
            {product.short_description && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.short_description}</p>
              </div>
            )}

            {product.description && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Description</h3>
                <div className="text-gray-600 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.related_products.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
