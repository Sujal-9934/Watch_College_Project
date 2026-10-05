const express = require('express');
const {
  getBrands,
  getBrandBySlug,
} = require('../controllers/brandController');

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

module.exports = router;

