const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminCategoryController');
const {
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/adminBrandController');
const {
  getAdminSliders,
  getAdminSlider,
  createSlider,
  updateSlider,
  deleteSlider,
  updateSliderOrder,
} = require('../controllers/sliderController');

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



// Categories management
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Brands management
router.get('/brands', getAdminBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);



// Sliders management
router.get('/sliders', getAdminSliders);
router.get('/sliders/:id', getAdminSlider);
router.post('/sliders', createSlider);
router.put('/sliders/:id', updateSlider);
router.delete('/sliders/:id', deleteSlider);
router.put('/sliders/order', updateSliderOrder);

module.exports = router;

