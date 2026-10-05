import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchSellerProducts,
  fetchSellerCategories,
  fetchSellerBrands,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  clearError,
} from '../../redux/slices/sellerSlice';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import ImageInput from '../../components/Admin/ImageInput';

const SellerProducts = () => {
  const dispatch = useDispatch();
  const { products, categories, brands, loading, error } = useSelector((state) => state.seller);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    min_stock_level: '5',
    category_id: '',
    brand_id: '',
    is_active: true,
    weight: '',
    dimensions: '',
    material: '',
    movement_type: '',
    water_resistance: '',
    warranty_period: '24',
    images: [],
  });

  useEffect(() => {
    const params = { page: 1, limit: 50 };
    if (searchTerm) params.search = searchTerm;
    dispatch(fetchSellerProducts(params));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    dispatch(fetchSellerCategories());
    dispatch(fetchSellerBrands());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const getImageUrl = (product) => {
    const imgs = product.images;
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
    if (typeof imgs === 'string') return imgs.split(',')[0] || '';
    return null;
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        sku: product.sku || '',
        price: product.price || '',
        original_price: product.original_price || '',
        stock_quantity: product.stock_quantity || '',
        min_stock_level: product.min_stock_level || '5',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        is_active: product.is_active === 1 || product.is_active === true,
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        material: product.material || '',
        movement_type: product.movement_type || '',
        water_resistance: product.water_resistance || '',
        warranty_period: product.warranty_period || '24',
        images: product.images || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        short_description: '',
        sku: '',
        price: '',
        original_price: '',
        stock_quantity: '',
        min_stock_level: '5',
        category_id: '',
        brand_id: '',
        is_active: true,
        weight: '',
        dimensions: '',
        material: '',
        movement_type: '',
        water_resistance: '',
        warranty_period: '24',
        images: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_level: parseInt(formData.min_stock_level),
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id, 10) : null,
        warranty_period: parseInt(formData.warranty_period),
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      const imageUrls = (formData.images || []).filter(Boolean);
      if (editingProduct) {
        submitData.images = imageUrls;
      } else {
        submitData.images = imageUrls.map((url) => ({ url, alt: formData.name }));
      }

      if (editingProduct) {
        await dispatch(updateSellerProduct({ id: editingProduct.id, data: submitData })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createSellerProduct(submitData)).unwrap();
        toast.success('Product created successfully');
      }
      handleCloseModal();

      const params = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      dispatch(fetchSellerProducts(params));
    } catch (err) {
      // Error handled in useEffect
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await dispatch(deleteSellerProduct(id)).unwrap();
      toast.success('Product deleted successfully');

      const params = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      dispatch(fetchSellerProducts(params));
    } catch (err) {
      // Error handled in useEffect
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="mt-2 text-gray-600">Manage your product listings</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48 sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors text-sm font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </button>
            <Link
              to="/seller"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">No products found. Start by adding your first product!</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100">
                            <img
                              className="h-10 w-10 object-cover"
                              src={getImageUrl(product) || '/placeholder.jpg'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category_name || 'No category'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-medium text-gray-900">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.stock_quantity > 10 ? 'bg-green-100 text-green-800' : product.stock_quantity > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_active === 1 || product.is_active === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active === 1 || product.is_active === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(product)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category_id === '' || formData.category_id == null ? '' : String(formData.category_id)}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select category</option>
                      {(categories || []).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.slug ? `(${cat.slug})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={formData.brand_id === '' || formData.brand_id == null ? '' : String(formData.brand_id)}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select brand (optional)</option>
                      {(brands || []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.slug ? `(${b.slug})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (URL or upload)</label>
                    <p className="text-xs text-gray-500 mb-2">First image is the main image. Add multiple with URL or file upload.</p>
                    {(formData.images || []).map((url, index) => (
                      <div key={index} className="flex items-start gap-2 mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <ImageInput
                          value={url}
                          onChange={(newUrl) => {
                            const next = [...(formData.images || [])];
                            next[index] = newUrl;
                            setFormData({ ...formData, images: next });
                          }}
                          label=""
                          previewClassName="w-16 h-16"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (formData.images || []).filter((_, i) => i !== index);
                            setFormData({ ...formData, images: next });
                          }}
                          className="mt-1 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove image"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, images: [...(formData.images || []), ''] })}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add image
                    </button>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-4 pb-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
                  >
                    {editingProduct ? '💾 Update Product' : '✨ Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
