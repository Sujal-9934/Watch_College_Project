const express = require('express');
const { protect, sellerOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getSellerProducts,
  getSellerOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/sellerController');

const router = express.Router();

router.use(protect);
router.use(sellerOnly);

router.get('/dashboard', getDashboardStats);

// Products
router.get('/products', getSellerProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updateOrderPaymentStatus);

module.exports = router;
