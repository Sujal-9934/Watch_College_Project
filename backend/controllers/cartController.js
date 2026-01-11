const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      c.id,
      c.product_id,
      c.variant_id,
      c.quantity,
      p.name as product_name,
      p.sku as product_sku,
      p.price,
      p.original_price,
      p.stock_quantity,
      pv.variant_name,
      pv.variant_value,
      pv.price_modifier,
      pv.stock_quantity as variant_stock_quantity,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM cart c
    JOIN products p ON c.product_id = p.id
    LEFT JOIN product_variants pv ON c.variant_id = pv.id
    WHERE c.user_id = ? AND p.is_active = 1
    ORDER BY c.created_at DESC
  `;

  const { rows } = await executeQuery(query, [userId]);

  const cartItems = rows.map(item => ({
    id: item.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    product_sku: item.product_sku,
    price: parseFloat(item.price) + (parseFloat(item.price_modifier) || 0),
    quantity: item.quantity,
    image: item.image || null,
    stock_quantity: item.variant_id ? item.variant_stock_quantity : item.stock_quantity,
  }));

  res.json({
    success: true,
    data: cartItems,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1, variantId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  // Validate quantity
  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive number',
    });
  }

  if (qty > 100) {
    return res.status(400).json({
      success: false,
      message: 'Maximum quantity per item is 100',
    });
  }

  // Check if product exists and is active
  const productCheck = await executeQuery(
    'SELECT id, stock_quantity, is_active, name FROM products WHERE id = ?',
    [productId]
  );

  if (productCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  if (!productCheck.rows[0].is_active) {
    return res.status(400).json({
      success: false,
      message: 'This product is currently unavailable',
    });
  }

  // Check variant if provided
  if (variantId) {
    const variantCheck = await executeQuery(
      'SELECT id, stock_quantity, variant_name, variant_value FROM product_variants WHERE id = ? AND product_id = ?',
      [variantId, productId]
    );

    if (variantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found',
      });
    }

    const availableStock = variantCheck.rows[0].stock_quantity;
    if (availableStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} item(s) available in stock`,
      });
    }
  } else {
    const availableStock = productCheck.rows[0].stock_quantity;
    if (availableStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} item(s) available in stock`,
      });
    }
  }

  // Check if item already exists in cart
  const existingItem = await executeQuery(
    'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?',
    [userId, productId, variantId || null]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    const currentQuantity = existingItem.rows[0].quantity;
    const newQuantity = currentQuantity + qty;
    
    // Check stock again with new total quantity
    const availableStock = variantId 
      ? (await executeQuery('SELECT stock_quantity FROM product_variants WHERE id = ?', [variantId])).rows[0].stock_quantity
      : productCheck.rows[0].stock_quantity;
    
    if (availableStock < newQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more items. Only ${availableStock} item(s) available in stock (${currentQuantity} already in cart)`,
      });
    }

    await executeQuery(
      'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, existingItem.rows[0].id]
    );
  } else {
    // Add new item
    await executeQuery(
      'INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
      [userId, productId, variantId || null, qty]
    );
  }

  res.json({
    success: true,
    message: 'Item added to cart successfully',
  });
});

// @desc    Update cart item
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1',
    });
  }

  // Get cart item
  const cartItem = await executeQuery(
    `SELECT c.*, p.stock_quantity as product_stock, pv.stock_quantity as variant_stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     LEFT JOIN product_variants pv ON c.variant_id = pv.id
     WHERE c.id = ? AND c.user_id = ?`,
    [cartItemId, userId]
  );

  if (cartItem.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found',
    });
  }

  const item = cartItem.rows[0];
  const availableStock = item.variant_id ? item.variant_stock : item.product_stock;

  if (availableStock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock',
    });
  }

  await executeQuery(
    'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, cartItemId]
  );

  res.json({
    success: true,
    message: 'Cart item updated',
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;

  const result = await executeQuery(
    'DELETE FROM cart WHERE id = ? AND user_id = ?',
    [cartItemId, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found',
    });
  }

  res.json({
    success: true,
    message: 'Item removed from cart',
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await executeQuery('DELETE FROM cart WHERE user_id = ?', [userId]);

  res.json({
    success: true,
    message: 'Cart cleared',
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

