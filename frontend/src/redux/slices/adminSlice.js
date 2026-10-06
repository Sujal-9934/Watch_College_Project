import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

// Get auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' });
    }
  }
);

// Products CRUD
export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
  }
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/products`, productData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create product' });
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/products/${id}`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update product' });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/products/${id}`, getAuthHeaders());
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete product' });
    }
  }
);

// Users Management
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' });
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user' });
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`, getAuthHeaders());
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete user' });
    }
  }
);

// Categories CRUD
export const fetchAdminCategories = createAsyncThunk(
  'admin/fetchAdminCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/categories`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch categories' });
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/categories`, categoryData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create category' });
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/categories/${id}`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update category' });
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/categories/${id}`, getAuthHeaders());
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete category' });
    }
  }
);

// Brands CRUD
export const fetchAdminBrands = createAsyncThunk(
  'admin/fetchAdminBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/brands`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch brands' });
    }
  }
);

export const createBrand = createAsyncThunk(
  'admin/createBrand',
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/brands`, brandData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create brand' });
    }
  }
);

export const updateBrand = createAsyncThunk(
  'admin/updateBrand',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/brands/${id}`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update brand' });
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'admin/deleteBrand',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/brands/${id}`, getAuthHeaders());
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete brand' });
    }
  }
);

// Orders Management
export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status, tracking_number }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/orders/${id}/status`,
        { status, tracking_number },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update order status' });
    }
  }
);

// Sliders Management
export const fetchAdminSliders = createAsyncThunk(
  'admin/fetchAdminSliders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/sliders`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sliders' });
    }
  }
);

export const createSlider = createAsyncThunk(
  'admin/createSlider',
  async (sliderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/sliders`, sliderData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create slider' });
    }
  }
);

export const updateSlider = createAsyncThunk(
  'admin/updateSlider',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/sliders/${id}`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update slider' });
    }
  }
);

export const deleteSlider = createAsyncThunk(
  'admin/deleteSlider',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/sliders/${id}`, getAuthHeaders());
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete slider' });
    }
  }
);

export const updateSliderOrder = createAsyncThunk(
  'admin/updateSliderOrder',
  async (sliders, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/sliders/order`, { sliders }, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update slider order' });
    }
  }
);

// Initial state
const initialState = {
  dashboardStats: null,
  products: [],
  users: [],
  categories: [],
  brands: [],
  orders: [],
  sliders: [],
  loading: false,
  error: null,
  pagination: {},
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload.data);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.data.id);
        if (index !== -1) {
          state.products[index] = action.payload.data;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload.id);
      })
      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.data.id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload.id);
      })
      // Categories
      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload.data);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.data.id);
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload.id);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Brands
      .addCase(fetchAdminBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.data;
      })
      .addCase(fetchAdminBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload.data);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex((b) => b.id === action.payload.data.id);
        if (index !== -1) {
          state.brands[index] = action.payload.data;
        }
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b.id !== action.payload.id);
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.data.id);
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Sliders
      .addCase(fetchAdminSliders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSliders.fulfilled, (state, action) => {
        state.loading = false;
        state.sliders = action.payload.data;
      })
      .addCase(fetchAdminSliders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSlider.fulfilled, (state, action) => {
        state.sliders.push(action.payload.data);
      })
      .addCase(createSlider.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateSlider.fulfilled, (state, action) => {
        const index = state.sliders.findIndex((s) => s.id === action.payload.data.id);
        if (index !== -1) {
          state.sliders[index] = action.payload.data;
        }
      })
      .addCase(updateSlider.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteSlider.fulfilled, (state, action) => {
        state.sliders = state.sliders.filter((s) => s.id !== action.payload.id);
      })
      .addCase(deleteSlider.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateSliderOrder.fulfilled, (state, action) => {
        state.sliders = action.payload.data;
      })
      .addCase(updateSliderOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
