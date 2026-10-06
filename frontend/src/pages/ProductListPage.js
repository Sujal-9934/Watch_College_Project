import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import ProductCard from '../components/Product/ProductCard';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const { loading, pagination, error } = useSelector((state) => state.products);
  const products = useSelector((state) => (
    Array.isArray(state.products?.products) ? state.products.products : []
  ));
  const categories = useSelector((state) => (
    Array.isArray(state.categories?.categories) ? state.categories.categories : []
  ));
  const brands = useSelector((state) => (
    Array.isArray(state.brands?.brands) ? state.brands.brands : []
  ));
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();

  const categorySlugFromUrl = searchParams.get('category');
  const brandSlugFromUrl = searchParams.get('brand');
  const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
  const categoryLabel = categorySlugFromUrl && categories?.length
    ? categories.find((c) => norm(c.slug) === norm(categorySlugFromUrl) || c.slug === categorySlugFromUrl)?.name || categorySlugFromUrl
    : null;
  const brandLabel = brandSlugFromUrl && brands?.length
    ? brands.find((b) => norm(b.slug) === norm(brandSlugFromUrl) || b.slug === brandSlugFromUrl)?.name || brandSlugFromUrl
    : null;

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [viewMode, setViewMode] = useState('grid');

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder, categorySlug, searchParams]);

  useEffect(() => {
    if ((categories || []).length === 0) dispatch(fetchCategories());
  }, [dispatch, categories]);

  const loadProducts = () => {
    const params = {
      page: currentPage,
      limit: 12,
      sort: sortBy,
      order: sortOrder,
    };

    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');

    if (search) params.search = search;
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (featured === 'true') params.featured = true;
    if (inStock === 'true') params.inStock = true;

    dispatch(fetchProducts(params));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split('-');
    setSortBy(field);
    setSortOrder(order);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', field);
    newParams.set('order', order);
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryLabel ? `${categoryLabel}` : brandLabel ? `${brandLabel} Watches` : 'All Watches'}
          </h1>
          <p className="text-gray-600">
            {categoryLabel || brandLabel
              ? `Browse our selection of ${categoryLabel || brandLabel} timepieces`
              : 'Discover our complete collection of premium timepieces'}
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search watches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error.message || 'Failed to load products'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              {categoryLabel || brandLabel
                ? `No products in ${categoryLabel || brandLabel} yet`
                : 'No products found'}
            </p>
            <p className="text-gray-400 mb-6">
              {categoryLabel || brandLabel
                ? 'Browse other categories or view all products.'
                : 'Try adjusting your search or filters.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                View all products
              </Link>
            </div>
            {categories?.filter((c) => (Number(c.product_count) || 0) > 0).length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Browse by category</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories
                    .filter((c) => (Number(c.product_count) || 0) > 0)
                    .slice(0, 8)
                    .map((c) => {
                      const slug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
                      return (
                        <Link
                          key={c.id}
                          to={`/products?category=${encodeURIComponent(slug)}`}
                          className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700"
                        >
                          {c.name}
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
