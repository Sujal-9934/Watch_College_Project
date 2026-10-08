const express = require('express');
const { getActiveSliders } = require('../controllers/sliderController');

const router = express.Router();

// @desc    Get active sliders for homepage
// @route   GET /api/sliders/active
// @access  Public
router.get('/active', getActiveSliders);

module.exports = router;
