import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const fetchSellerDashboard = createAsyncThunk(
  'seller/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/seller/dashboard`, getAuthHeaders());
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to fetch dashboard';
      return rejectWithValue({ message: msg });
    }
  }
);

export const fetchSellerProducts = createAsyncThunk(
  'seller/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/seller/products`, {
        ...getAuthHeaders(),
        params,
      });
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to fetch products';
      return rejectWithValue({ message: msg });
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'seller/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/seller/orders`, {
        ...getAuthHeaders(),
        params,
      });
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to fetch orders';
      return rejectWithValue({ message: msg });
    }
  }
);

export const updateSellerOrderStatus = createAsyncThunk(
  'seller/updateOrderStatus',
  async ({ id, status, tracking_number }, { rejectWithValue }) => {
    try {
      await axios.put(
        `${API_BASE_URL}/seller/orders/${id}/status`,
        { status, tracking_number },
        getAuthHeaders()
      );
      return { id, status, tracking_number };
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to update order';
      return rejectWithValue({ message: msg });
    }
  }
);

export const updateSellerOrderPaymentStatus = createAsyncThunk(
  'seller/updateOrderPaymentStatus',
  async ({ id, payment_status }, { rejectWithValue }) => {
    try {
      await axios.put(
        `${API_BASE_URL}/seller/orders/${id}/payment`,
        { payment_status },
        getAuthHeaders()
      );
      return { id, payment_status };
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to update payment status';
      return rejectWithValue({ message: msg });
    }
  }
);


export const createSellerProduct = createAsyncThunk(
  'seller/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/seller/products`, productData, getAuthHeaders());
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to create product';
      return rejectWithValue({ message: msg });
    }
  }
);

export const updateSellerProduct = createAsyncThunk(
  'seller/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/seller/products/${id}`, data, getAuthHeaders());
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to update product';
      return rejectWithValue({ message: msg });
    }
  }
);

export const deleteSellerProduct = createAsyncThunk(
  'seller/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/seller/products/${id}`, getAuthHeaders());
      return { id, ...res.data };
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to delete product';
      return rejectWithValue({ message: msg });
    }
  }
);

export const fetchSellerCategories = createAsyncThunk(
  'seller/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to fetch categories';
      return rejectWithValue({ message: msg });
    }
  }
);

export const fetchSellerBrands = createAsyncThunk(
  'seller/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/brands`);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to fetch brands';
      return rejectWithValue({ message: msg });
    }
  }
);

const sellerSlice = createSlice({
  name: 'seller',
  initialState: {
    dashboardStats: null,
    products: [],
    categories: [],
    brands: [],
    orders: [],
    pagination: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerDashboard.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.dashboardStats = payload?.data || null;
      })
      .addCase(fetchSellerDashboard.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload?.data || [];
        state.pagination = payload?.pagination || {};
      })
      .addCase(fetchSellerProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.products = [];
        state.error = payload;
      })
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload?.data || [];
        state.pagination = payload?.pagination || {};
      })
      .addCase(fetchSellerOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.orders = [];
        state.error = payload;
      })
      .addCase(updateSellerOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerOrderStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => String(o.id) === String(payload.id));
        if (idx !== -1) state.orders[idx].status = payload.status;
      })
      .addCase(updateSellerOrderStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateSellerOrderPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerOrderPaymentStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => String(o.id) === String(payload.id));
        if (idx !== -1) state.orders[idx].payment_status = payload.payment_status;
      })
      .addCase(updateSellerOrderPaymentStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchSellerCategories.fulfilled, (state, { payload }) => {
        state.categories = payload?.data || [];
      })
      .addCase(fetchSellerBrands.fulfilled, (state, { payload }) => {
        state.brands = payload?.data || [];
      })
      .addCase(createSellerProduct.fulfilled, (state, { payload }) => {
        state.products.unshift(payload.data);
      })
      .addCase(updateSellerProduct.fulfilled, (state, { payload }) => {
        const idx = state.products.findIndex(p => p.id === payload.data.id);
        if (idx !== -1) state.products[idx] = payload.data;
      })
      .addCase(deleteSellerProduct.fulfilled, (state, { payload }) => {
        state.products = state.products.filter(p => p.id !== payload.id);
      });
  },
});

export const { clearError } = sellerSlice.actions;
export default sellerSlice.reducer;
