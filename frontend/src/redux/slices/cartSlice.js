import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch cart' });
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, variantId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/cart`,
        { productId, quantity, variantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add to cart' });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/cart/${itemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update cart item' });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { itemId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove from cart' });
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to clear cart' });
    }
  }
);

// Helper function to calculate cart totals
const calculateTotals = (items) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
  };
};

// Initial state
const initialState = {
  items: [],
  totals: {
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  },
  loading: false,
  error: null,
  isInitialized: false,
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.totals = {
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      };
      state.isInitialized = false;
    },
    addToCartLocal: (state, action) => {
      const { product, quantity = 1, variantId } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product_id === product.id && item.variant_id === variantId
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({
          id: Date.now(), // Temporary ID for local state
          product_id: product.id,
          variant_id: variantId,
          product_name: product.name,
          product_sku: product.sku,
          price: product.price,
          quantity,
          image: product.images?.[0] || '/placeholder.jpg',
        });
      }

      state.totals = calculateTotals(state.items);
    },
    updateCartItemLocal: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === itemId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
        state.totals = calculateTotals(state.items);
      }
    },
    removeFromCartLocal: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      state.totals = calculateTotals(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.totals = calculateTotals(state.items);
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Cart will be refetched automatically by component or Layout
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Note: Cart will be refetched by component
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload.itemId);
        state.totals = calculateTotals(state.items);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totals = {
          subtotal: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        };
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCartLocal,
  addToCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
} = cartSlice.actions;
export default cartSlice.reducer;
