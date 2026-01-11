const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrders,
  updateOrderStatus,
} = require('../controllers/adminController');
const {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/adminProductController');
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminCategoryController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Products management
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories management
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders management
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;

