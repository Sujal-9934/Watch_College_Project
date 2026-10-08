const { executeQuery } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      w.id,
      w.product_id,
      w.created_at,
      p.name,
      p.sku,
      p.price,
      p.original_price,
      p.stock_quantity,
      p.is_active,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
      b.name as brand_name,
      c.name as category_name
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE w.user_id = ? AND p.is_active = 1
    ORDER BY w.created_at DESC
  `;

  const { rows } = await executeQuery(query, [userId]);

  const wishlistItems = rows.map(item => ({
    id: item.id,
    product_id: item.product_id,
    product: {
      id: item.product_id,
      name: item.name,
      sku: item.sku,
      price: parseFloat(item.price),
      original_price: item.original_price ? parseFloat(item.original_price) : null,
      stock_quantity: item.stock_quantity,
      image: item.image || null,
      brand_name: item.brand_name,
      category_name: item.category_name,
    },
    created_at: item.created_at,
  }));

  res.json({
    success: true,
    data: wishlistItems,
  });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  // Check if product exists
  const productCheck = await executeQuery(
    'SELECT id, is_active FROM products WHERE id = ?',
    [productId]
  );

  if (productCheck.rows.length === 0 || !productCheck.rows[0].is_active) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check if already in wishlist
  const existingItem = await executeQuery(
    'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existingItem.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Product already in wishlist',
    });
  }

  await executeQuery(
    'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  );

  res.json({
    success: true,
    message: 'Product added to wishlist',
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  const result = await executeQuery(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found in wishlist',
    });
  }

  res.json({
    success: true,
    message: 'Product removed from wishlist',
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

