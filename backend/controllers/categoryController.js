const { executeQuery } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categoriesResult = await executeQuery(`
    SELECT 
      c.*, 
      COUNT(DISTINCT p.id) as product_count,
      MIN(p.price) as min_price
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `);

  res.json({
    success: true,
    data: categoriesResult.rows.map(cat => ({
      ...cat,
      product_count: parseInt(cat.product_count) || 0,
      min_price: cat.min_price ? parseFloat(cat.min_price) : null,
    })),
  });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const categoryResult = await executeQuery(
    'SELECT * FROM categories WHERE slug = ? AND is_active = 1',
    [slug]
  );

  if (categoryResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  res.json({
    success: true,
    data: categoryResult.rows[0],
  });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
};

