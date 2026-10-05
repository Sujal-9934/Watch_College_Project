import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  updateSliderOrder,
} from '../../redux/slices/adminSlice';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import ImageInput from '../../components/Admin/ImageInput';

const AdminSliders = () => {
  const dispatch = useDispatch();
  const { sliders, loading, error } = useSelector((state) => state.admin);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
    display_order: 0,
  });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminSliders());
  }, [dispatch]);

  const refetchSliders = () => {
    dispatch(fetchAdminSliders());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSlider) {
        await dispatch(updateSlider({ id: editingSlider.id, data: formData })).unwrap();
      } else {
        await dispatch(createSlider(formData)).unwrap();
      }

      setShowModal(false);
      setEditingSlider(null);
      resetForm();
      refetchSliders();
    } catch (error) {
      console.error('Failed to save slider:', error);
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      description: slider.description || '',
      image_url: slider.image_url || '',
      is_active: slider.is_active ?? true,
      display_order: slider.display_order || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        await dispatch(deleteSlider(id)).unwrap();
        refetchSliders();
      } catch (error) {
        console.error('Failed to delete slider:', error);
      }
    }
  };

  const handleDragStart = (e, slider) => {
    setDraggedItem(slider);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetSlider) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetSlider.id) return;

    const newOrder = [...sliders].sort((a, b) => a.display_order - b.display_order);
    const draggedIndex = newOrder.findIndex(s => s.id === draggedItem.id);
    const targetIndex = newOrder.findIndex(s => s.id === targetSlider.id);

    // Remove dragged item and insert at new position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update display_order for all items
    const updatedSliders = newOrder.map((slider, index) => ({
      ...slider,
      display_order: index + 1,
    }));

    try {
      await dispatch(updateSliderOrder(updatedSliders)).unwrap();
      setDraggedItem(null);
    } catch (error) {
      console.error('Failed to update slider order:', error);
      setDraggedItem(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      is_active: true,
      display_order: 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Slider Management</h1>
            <p className="mt-2 text-gray-600">Manage homepage slider images and content</p>
          </div>
          <div className="flex items-center gap-3">
            <button
            onClick={() => {
              setEditingSlider(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Slider
          </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error.message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sliders ({sliders.length})</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sliders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No sliders found. Add your first slider to get started.</p>
              </div>
            ) : (
              [...sliders]
                .sort((a, b) => a.display_order - b.display_order)
                .map((slider) => (
                  <div
                    key={slider.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, slider)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slider)}
                    className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      draggedItem?.id === slider.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="cursor-move">
                        <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {slider.image_url ? (
                          <img
                            src={slider.image_url}
                            alt={slider.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-2xl">📷</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{slider.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{slider.description}</p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slider.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slider.is_active ? (
                              <>
                                <EyeIcon className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeSlashIcon className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            Order: {slider.display_order}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(slider)}
                        className="text-primary-600 hover:text-primary-700 p-2"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingSlider ? 'Edit Slider' : 'Add New Slider'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <ImageInput
                    label="Image"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    placeholder="https://example.com/slider.jpg"
                    previewClassName="w-32 h-20"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Active (visible on homepage)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSlider(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingSlider ? 'Update' : 'Create'}
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

export default AdminSliders;
