const express = require('express');
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory,
  getProductReviews,
} = require('../controllers/productController');

const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:categorySlug', getProductsByCategory);
router.get('/:id', optionalAuth, getProduct);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
