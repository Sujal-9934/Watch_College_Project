const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
} = require('../controllers/orderController');

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder);

router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router;

