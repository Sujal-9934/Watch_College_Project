import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  sidebarOpen: false,
  cartDrawerOpen: false,
  searchModalOpen: false,
  authModalOpen: false,
  authModalTab: 'login', // 'login', 'register', or 'otp-verification'
  authEmail: '', // Store email for OTP verification
  notifications: [],
  loading: false,
  theme: 'light', // 'light' or 'dark'
  language: 'en',
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setCartDrawerOpen: (state, action) => {
      state.cartDrawerOpen = action.payload;
    },
    toggleSearchModal: (state) => {
      state.searchModalOpen = !state.searchModalOpen;
    },
    setSearchModalOpen: (state, action) => {
      state.searchModalOpen = action.payload;
    },
    toggleAuthModal: (state) => {
      state.authModalOpen = !state.authModalOpen;
    },
    setAuthModalOpen: (state, action) => {
      state.authModalOpen = action.payload;
    },
    setAuthModalTab: (state, action) => {
      state.authModalTab = action.payload;
    },
    setAuthEmail: (state, action) => {
      state.authEmail = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info', // 'success', 'error', 'warning', 'info'
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    initializeUI: (state) => {
      // Load theme from localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        state.theme = savedTheme;
      }

      // Load language from localStorage
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        state.language = savedLanguage;
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleCartDrawer,
  setCartDrawerOpen,
  toggleSearchModal,
  setSearchModalOpen,
  toggleAuthModal,
  setAuthModalOpen,
  setAuthModalTab,
  setAuthEmail,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setTheme,
  toggleTheme,
  setLanguage,
  initializeUI,
} = uiSlice.actions;

export default uiSlice.reducer;
