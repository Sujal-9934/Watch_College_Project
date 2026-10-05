import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PhotoIcon, LinkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const isValidImageUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Reusable ImageInput: supports both Image URL and File upload.
 * - value: current image URL (string)
 * - onChange: (url) => void
 * - label, placeholder, previewClassName, required
 */
const ImageInput = ({
  value = '',
  onChange,
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
  previewClassName = 'w-24 h-24',
  required = false,
}) => {
  const [mode, setMode] = useState('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const displayUrl = value || urlInput;
  const showPreview = displayUrl && (displayUrl.startsWith('http') || displayUrl.startsWith('/'));

  const handleUrlChange = (e) => {
    const v = e.target.value.trim();
    setUrlInput(v);
    setPreviewError(false);
    if (mode === 'url') onChange(v || '');
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setPreviewError(false);
    if (newMode === 'url') {
      onChange(urlInput || '');
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post(`${API_BASE_URL}/admin/upload`, formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      const url = res.data?.data?.url;
      if (url) {
        onChange(url);
        setUrlInput(url);
        setPreviewError(false);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewError = () => setPreviewError(true);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-3 items-start">
        <div
          className={`flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center ${previewClassName}`}
        >
          {showPreview && !previewError ? (
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          ) : (
            <span className="text-gray-400">
              <PhotoIcon className="w-10 h-10" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'url'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LinkIcon className="w-4 h-4 mr-1.5" />
              URL
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('file')}
              disabled={uploading}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'file'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {mode === 'url' && (
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              onBlur={() => {
                if (urlInput.trim()) onChange(urlInput.trim());
              }}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          )}

          {displayUrl && (
            <p className="text-xs text-gray-500 truncate max-w-md" title={displayUrl}>
              {displayUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageInput;
