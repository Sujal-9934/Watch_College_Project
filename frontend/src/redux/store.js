import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';
import sellerReducer from './slices/sellerSlice';
import homepageReducer from './slices/homepageSlice';
import categoryReducer from './slices/categorySlice';
import brandReducer from './slices/brandSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    ui: uiReducer,
    admin: adminReducer,
    seller: sellerReducer,
    homepage: homepageReducer,
    categories: categoryReducer,
    brands: brandReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
