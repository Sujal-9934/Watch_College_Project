import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  clearError,
} from '../../redux/slices/adminSlice';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import ImageInput from '../../components/Admin/ImageInput';

const AdminBrands = () => {
  const dispatch = useDispatch();
  const { brands, loading, error } = useSelector((state) => state.admin);

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    logo: '',
    is_active: true,
    sort_order: '0',
  });

  useEffect(() => {
    dispatch(fetchAdminBrands());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        slug: brand.slug || '',
        logo: brand.logo || '',
        is_active: brand.is_active === 1 || brand.is_active === true,
        sort_order: brand.sort_order?.toString() || '0',
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        description: '',
        slug: '',
        logo: '',
        is_active: true,
        sort_order: '0',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingBrand ? formData.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        sort_order: parseInt(formData.sort_order),
      };

      if (editingBrand) {
        await dispatch(updateBrand({ id: editingBrand.id, data: submitData })).unwrap();
        toast.success('Brand updated successfully');
      } else {
        await dispatch(createBrand(submitData)).unwrap();
        toast.success('Brand created successfully');
      }
      handleCloseModal();
      dispatch(fetchAdminBrands());
    } catch (err) {
      // Error handled in useEffect
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await dispatch(deleteBrand(id)).unwrap();
      toast.success('Brand deleted successfully');
      dispatch(fetchAdminBrands());
    } catch (err) {
      // Error handled in useEffect
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Brand Management</h1>
            <p className="text-gray-600">Manage product brands for My Clock</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-bounce-in"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Brand
          </button>
        </div>

        {/* Brands Grid */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading brands...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏷️</div>
              <p className="text-xl text-gray-500 mb-2">No brands found</p>
              <p className="text-gray-400">Start by adding your first brand</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Brand</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Products</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Sort Order</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((brand, index) => (
                    <tr 
                      key={brand.id} 
                      className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {brand.logo && (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="h-12 w-12 rounded-lg object-contain mr-4 shadow-md hover:scale-110 transition-transform duration-300"
                            />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{brand.name}</div>
                            {brand.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{brand.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {brand.product_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                          brand.is_active 
                            ? 'bg-green-100 text-green-800 shadow-sm' 
                            : 'bg-red-100 text-red-800 shadow-sm'
                        }`}>
                          {brand.is_active ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{brand.sort_order}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(brand)}
                            className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Edit Brand"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Delete Brand"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Brand Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingBrand ? '✏️ Edit Brand' : '➕ Add New Brand'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <ImageInput
                      label="Logo URL or upload"
                      value={formData.logo}
                      onChange={(url) => setFormData({ ...formData, logo: url })}
                      placeholder="https://example.com/logo.png"
                      previewClassName="w-24 h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="mr-2 w-5 h-5 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
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
                    {editingBrand ? '💾 Update Brand' : '✨ Create Brand'}
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

export default AdminBrands;

