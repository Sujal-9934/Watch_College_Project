import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setSearchModalOpen } from '../../redux/slices/uiSlice';
import { searchProducts } from '../../redux/slices/productSlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SearchModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchModalOpen } = useSelector((state) => state.ui);
  const { brands } = useSelector((state) => state.brands);
  const { categories } = useSelector((state) => state.categories);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    products: [],
    brands: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Load brands and categories on mount
  useEffect(() => {
    if (searchModalOpen) {
      dispatch(fetchBrands());
      dispatch(fetchCategories());
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [searchModalOpen, dispatch]);

  // Debounced search
  useEffect(() => {
    if (!searchModalOpen) return;

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm.trim());
      } else {
        setSearchResults({ products: [], brands: [], categories: [] });
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchModalOpen]);

  const performSearch = async (term) => {
    setLoading(true);
    setShowResults(true);
    setError(null);

    try {
      // Search products
      const productsResponse = await axios.get(`${API_BASE_URL}/products/search`, {
        params: { q: term, limit: 8 },
      });

      console.log('Search API Response:', productsResponse.data); // Debug log

      // Filter brands and categories locally
      const filteredBrands = (brands || []).filter(
        (brand) =>
          brand.name?.toLowerCase().includes(term.toLowerCase()) ||
          brand.description?.toLowerCase().includes(term.toLowerCase())
      );

      const filteredCategories = (categories || []).filter(
        (category) =>
          category.name?.toLowerCase().includes(term.toLowerCase()) ||
          category.description?.toLowerCase().includes(term.toLowerCase())
      );

      // Handle different response formats
      let products = [];
      if (productsResponse.data) {
        if (Array.isArray(productsResponse.data)) {
          products = productsResponse.data;
        } else if (productsResponse.data.data) {
          products = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [];
        } else if (productsResponse.data.success && productsResponse.data.data) {
          products = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [];
        }
      }

      console.log('Parsed products:', products); // Debug log

      setSearchResults({
        products: products,
        brands: filteredBrands.slice(0, 5),
        categories: filteredCategories.slice(0, 5),
      });
    } catch (error) {
      console.error('Search error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.message || 'Search failed');
      setSearchResults({ products: [], brands: [], categories: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleProductClick = (productId) => {
    dispatch(setSearchModalOpen(false));
    navigate(`/products/${productId}`);
  };

  const handleBrandClick = (brandSlug) => {
    dispatch(setSearchModalOpen(false));
    navigate(`/products?brand=${brandSlug}`);
  };

  const handleCategoryClick = (categorySlug) => {
    dispatch(setSearchModalOpen(false));
    navigate(`/products?category=${categorySlug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      dispatch(setSearchModalOpen(false));
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleClose = () => {
    dispatch(setSearchModalOpen(false));
    setSearchTerm('');
    setSearchResults({ products: [], brands: [], categories: [] });
    setShowResults(false);
  };

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.brands.length > 0 ||
    searchResults.categories.length > 0;

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-20 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
          onClick={handleClose}
        ></div>

        {/* Modal Content */}
        <div className="inline-block align-top bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative">
          {/* Search Input */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="Search Product, Brands..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all duration-300"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setShowResults(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </form>
          </div>

          {/* Search Results */}
          {showResults && (
            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Searching...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 mb-2">⚠️</div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <p className="text-sm text-gray-500 mt-2">Please try again</p>
                </div>
              ) : hasResults ? (
                <div className="p-4">
                  {/* Products Section */}
                  {searchResults.products.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 px-2">
                        Products ({searchResults.products.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.products.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group animate-fade-in-up"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100?text=Watch';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ClockIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                {product.name}
                              </h4>
                              {product.brand_name && (
                                <p className="text-sm text-gray-500 truncate">{product.brand_name}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-gray-900">
                                  ₹{parseFloat(product.price).toLocaleString('en-IN')}
                                </span>
                                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                                  </span>
                                )}
                                {product.discount_percentage > 0 && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                                    -{Math.round(product.discount_percentage)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands Section */}
                  {searchResults.brands.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 px-2">
                        Brands ({searchResults.brands.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {searchResults.brands.map((brand) => (
                          <div
                            key={brand.id}
                            onClick={() => handleBrandClick(brand.slug)}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all group animate-fade-in-up"
                          >
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-10 h-10 object-contain rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xl">⌚</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                {brand.name}
                              </h4>
                              {brand.product_count > 0 && (
                                <p className="text-xs text-gray-500">{brand.product_count} products</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories Section */}
                  {searchResults.categories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 px-2">
                        Categories ({searchResults.categories.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {searchResults.categories.map((category) => (
                          <div
                            key={category.id}
                            onClick={() => handleCategoryClick(category.slug)}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all group animate-fade-in-up"
                          >
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-10 h-10 object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xl">📂</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                {category.name}
                              </h4>
                              {category.product_count > 0 && (
                                <p className="text-xs text-gray-500">{category.product_count} products</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Results */}
                  {searchTerm.trim().length >= 2 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        View All Results for "{searchTerm}"
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No results found for "{searchTerm}"</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try searching with different keywords or check if products are active
                  </p>
                  <button
                    onClick={handleSearchSubmit}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View all products →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Popular Searches (when no search term) */}
          {!showResults && !searchTerm && (
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Smart Watch', 'Luxury Watch', 'Sports Watch', 'Men Watch', 'Women Watch', 'Casio', 'Titan'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setSearchTerm(term)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
