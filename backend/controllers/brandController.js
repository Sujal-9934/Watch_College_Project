const { executeQuery } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all active brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brandsResult = await executeQuery(`
    SELECT 
      b.*, 
      COUNT(DISTINCT p.id) as product_count,
      MIN(p.price) as min_price
    FROM brands b
    LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = 1
    WHERE b.is_active = 1
    GROUP BY b.id
    ORDER BY b.sort_order ASC, b.name ASC
  `);

  res.json({
    success: true,
    data: brandsResult.rows.map(brand => ({
      ...brand,
      product_count: parseInt(brand.product_count) || 0,
      min_price: brand.min_price ? parseFloat(brand.min_price) : null,
    })),
  });
});

// @desc    Get single brand by slug
// @route   GET /api/brands/:slug
// @access  Public
const getBrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const brandResult = await executeQuery(
    'SELECT * FROM brands WHERE slug = ? AND is_active = 1',
    [slug]
  );

  if (brandResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Brand not found',
    });
  }

  res.json({
    success: true,
    data: brandResult.rows[0],
  });
});

module.exports = {
  getBrands,
  getBrandBySlug,
};

