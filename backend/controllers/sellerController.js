const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const sellerId = (req) => req.user?.id;

// @desc    Get seller dashboard statistics
// @route   GET /api/seller/dashboard
// @access  Private/Seller
const getDashboardStats = asyncHandler(async (req, res) => {
  const sid = sellerId(req);
  const productsCount = await executeQuery(
    'SELECT COUNT(*) as total FROM products WHERE seller_id = ?',
    [sid]
  );
  const activeCount = await executeQuery(
    'SELECT COUNT(*) as total FROM products WHERE seller_id = ? AND is_active = 1',
    [sid]
  );
  const ordersCount = await executeQuery(
    `SELECT COUNT(DISTINCT o.id) as total FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     WHERE o.payment_status = 'paid'`,
    [sid]
  );
  const pendingCount = await executeQuery(
    `SELECT COUNT(DISTINCT o.id) as total FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     WHERE o.status = 'pending'`,
    [sid]
  );
  const revResult = await executeQuery(
    `SELECT COALESCE(SUM(oi.quantity * oi.unit_price * 1.18), 0) as total
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     INNER JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'paid'`,
    [sid]
  );
  const recentResult = await executeQuery(
    `SELECT o.id, o.order_number, o.status, o.created_at,
            sa.first_name, sa.last_name, sa.email,
            ROUND(SUM(oi.quantity * oi.unit_price) * 1.18, 2) as total_amount
     FROM orders o
     JOIN addresses sa ON o.shipping_address_id = sa.id
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT 10`,
    [sid]
  );
  const lowResult = await executeQuery(
    `SELECT id, name, sku, stock_quantity, min_stock_level
     FROM products
     WHERE seller_id = ? AND stock_quantity <= min_stock_level AND is_active = 1
     ORDER BY stock_quantity ASC
     LIMIT 10`,
    [sid]
  );
  const salesResult = await executeQuery(
    `SELECT
       DATE_FORMAT(o.created_at, '%Y-%m') as month,
       COUNT(DISTINCT o.id) as orders,
       COALESCE(SUM(oi.quantity * oi.unit_price * 1.18), 0) as revenue
     FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     WHERE o.payment_status = 'paid' AND o.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
     ORDER BY month ASC`,
    [sid]
  );

  res.json({
    success: true,
    data: {
      stats: {
        products: {
          total: parseInt(productsCount.rows[0].total),
          active: parseInt(activeCount.rows[0].total),
        },
        orders: {
          total: parseInt(ordersCount.rows[0].total),
          pending: parseInt(pendingCount.rows[0].total),
        },
        revenue: { total: parseFloat(revResult.rows[0].total) || 0 },
      },
      recentOrders: recentResult.rows,
      lowStockProducts: lowResult.rows,
      salesByMonth: salesResult.rows,
    },
  });
});

// @desc    Get seller products
// @route   GET /api/seller/products
// @access  Private/Seller
const getSellerProducts = asyncHandler(async (req, res) => {
  const sid = sellerId(req);
  const { page = 1, limit = 20, search, is_active } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE p.seller_id = ?';
  const params = [sid];

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (is_active !== undefined && is_active !== '') {
    whereClause += ' AND p.is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  const countResult = await executeQuery(
    `SELECT COUNT(*) as total FROM products p ${whereClause}`,
    params
  );
  const totalProducts = parseInt(countResult.rows[0].total);

  const totalPages = Math.ceil(totalProducts / limit) || 1;

  const productsQuery = `
    SELECT p.*, c.name as category_name, b.name as brand_name,
           GROUP_CONCAT(pi.image_url ORDER BY pi.is_primary DESC) as images
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const productsResult = await executeQuery(productsQuery, [...params, parseInt(limit), parseInt(offset)]);
  const formattedProducts = productsResult.rows.map((p) => ({
    ...p,
    images: p.images ? p.images.split(',') : [],
    price: parseFloat(p.price),
    original_price: p.original_price ? parseFloat(p.original_price) : null,
    stock_quantity: parseInt(p.stock_quantity),
  }));

  res.json({
    success: true,
    data: formattedProducts,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Get seller orders
// @route   GET /api/seller/orders
// @access  Private/Seller
const getSellerOrders = asyncHandler(async (req, res) => {
  const sid = sellerId(req);
  const { page = 1, limit = 20, status, payment_status, search } = req.query;
  const offset = (page - 1) * limit;
  let whereClause = `
    INNER JOIN order_items oi ON oi.order_id = o.id
    INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
  `;
  const params = [sid];

  if (status) {
    whereClause += ' AND o.status = ?';
    params.push(status);
  }
  if (payment_status) {
    whereClause += ' AND o.payment_status = ?';
    params.push(payment_status);
  }
  if (search) {
    whereClause += ' AND (o.order_number LIKE ? OR sa.email LIKE ? OR sa.first_name LIKE ? OR sa.last_name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const countResult = await executeQuery(
    `SELECT COUNT(DISTINCT o.id) as total FROM orders o JOIN addresses sa ON o.shipping_address_id = sa.id ${whereClause}`,
    params
  );
  const totalOrders = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(totalOrders / limit) || 1;
  const ordersResult = await executeQuery(
    `SELECT
       o.id, o.order_number, o.status, o.payment_status, o.payment_method, o.created_at, o.updated_at,
       sa.first_name, sa.last_name, sa.email,
       SUM(oi.quantity * oi.unit_price) as seller_subtotal,
       SUM(oi.quantity * oi.unit_price) * 0.18 as seller_tax,
       ROUND(SUM(oi.quantity * oi.unit_price) * 1.18, 2) as total_amount
     FROM orders o
     JOIN addresses sa ON o.shipping_address_id = sa.id
     ${whereClause}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  res.json({
    success: true,
    data: ordersResult.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalOrders,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Update order status (seller - only for own orders)
// @route   PUT /api/seller/orders/:id/status
// @access  Private/Seller
const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const sid = sellerId(req);
  const { status, tracking_number } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  const orderCheck = await executeQuery(
    `SELECT o.id FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     WHERE o.id = ?`,
    [sid, orderId]
  );
  if (orderCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const updates = ['status = ?'];
  const params = [status];
  if (tracking_number !== undefined) {
    updates.push('tracking_number = ?');
    params.push(tracking_number);
  }
  params.push(orderId);

  await executeQuery(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  res.json({
    success: true,
    message: 'Order status updated',
  });
});

// @desc    Update order payment status (seller)
// @route   PUT /api/seller/orders/:id/payment
// @access  Private/Seller
const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const sid = sellerId(req);
  const { payment_status } = req.body;

  const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
  if (!payment_status || !validStatuses.includes(payment_status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment status',
    });
  }

  const orderCheck = await executeQuery(
    `SELECT o.id FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.seller_id = ?
     WHERE o.id = ?`,
    [sid, orderId]
  );
  if (orderCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  await executeQuery(
    `UPDATE orders SET payment_status = ? WHERE id = ?`,
    [payment_status, orderId]
  );

  res.json({
    success: true,
    message: 'Order payment status updated',
  });
});

// @desc    Create product (seller)
// @route   POST /api/seller/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const sid = sellerId(req);
  const {
    name, description, short_description, sku, price, original_price,
    discount_percentage, stock_quantity, min_stock_level, category_id,
    brand_id, is_active, weight, dimensions, material, movement_type,
    water_resistance, warranty_period, images
  } = req.body;

  if (!name || !sku || !price || stock_quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide name, sku, price, and stock_quantity' });
  }

  const skuCheck = await executeQuery('SELECT id FROM products WHERE sku = ?', [sku]);
  if (skuCheck.rows.length > 0) return res.status(400).json({ success: false, message: 'Product with this SKU already exists' });

  let calculatedDiscount = discount_percentage || 0;
  if (original_price && original_price > price) calculatedDiscount = ((original_price - price) / original_price) * 100;

  const insertQuery = `
    INSERT INTO products (
      seller_id, name, description, short_description, sku, price, original_price,
      discount_percentage, stock_quantity, min_stock_level, category_id,
      brand_id, is_active, weight, dimensions, material, movement_type,
      water_resistance, warranty_period
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const productValues = [
    sid, name, description || null, short_description || null, sku,
    parseFloat(price), original_price ? parseFloat(original_price) : null,
    calculatedDiscount, parseInt(stock_quantity), min_stock_level || 5,
    category_id || null, brand_id || null, is_active !== false ? 1 : 0,
    weight || null, dimensions || null, material || null, movement_type || null,
    water_resistance || null, warranty_period || 24
  ];

  const result = await executeQuery(insertQuery, productValues);
  const productId = result.insertId;

  if (images && images.length > 0) {
    const imageQueries = images.map((image, index) => ({
      query: 'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
      params: [productId, image.url || image, image.alt || name, index, index === 0 ? 1 : 0],
    }));
    await executeTransaction(imageQueries);
  }

  const productResult = await executeQuery(
    `SELECT p.*, c.name as category_name, b.name as brand_name FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.id = ? AND p.seller_id = ?`,
    [productId, sid]
  );

  res.status(201).json({ success: true, message: 'Product created successfully', data: productResult.rows[0] });
});

// @desc    Update product (seller)
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
  const sid = sellerId(req);
  const productId = req.params.id;
  const updateData = req.body;

  const productCheck = await executeQuery('SELECT id FROM products WHERE id = ? AND seller_id = ?', [productId, sid]);
  if (productCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found or not authorized' });

  if (updateData.sku) {
    const skuCheck = await executeQuery('SELECT id FROM products WHERE sku = ? AND id != ?', [updateData.sku, productId]);
    if (skuCheck.rows.length > 0) return res.status(400).json({ success: false, message: 'Product with this SKU already exists' });
  }

  if (updateData.original_price && updateData.price && updateData.original_price > updateData.price) {
    updateData.discount_percentage = ((updateData.original_price - updateData.price) / updateData.original_price) * 100;
  }

  const allowedFields = [
    'name', 'description', 'short_description', 'sku', 'price', 'original_price',
    'discount_percentage', 'stock_quantity', 'min_stock_level', 'category_id',
    'brand_id', 'is_active', 'weight', 'dimensions', 'material', 'movement_type',
    'water_resistance', 'warranty_period'
  ];

  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      if (field === 'is_active') updateValues.push(updateData[field] ? 1 : 0);
      else if (['price', 'original_price', 'discount_percentage', 'weight'].includes(field)) updateValues.push(parseFloat(updateData[field]));
      else if (['stock_quantity', 'min_stock_level', 'warranty_period'].includes(field)) updateValues.push(parseInt(updateData[field]));
      else updateValues.push(updateData[field]);
    }
  });

  if (updateFields.length > 0) {
    updateValues.push(productId, sid);
    await executeQuery(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ? AND seller_id = ?`, updateValues);
  }

  if (updateData.images !== undefined && Array.isArray(updateData.images)) {
    await executeQuery('DELETE FROM product_images WHERE product_id = ?', [productId]);
    if (updateData.images.length > 0) {
      const imageQueries = updateData.images.map((img, index) => {
        const url = typeof img === 'string' ? img : (img.url || img);
        const alt = typeof img === 'string' ? updateData.name || '' : (img.alt || updateData.name || '');
        return {
          query: 'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
          params: [productId, url, alt, index, index === 0 ? 1 : 0],
        };
      });
      await executeTransaction(imageQueries);
    }
  }

  const updatedProductResult = await executeQuery(
    `SELECT p.*, c.name as category_name, b.name as brand_name FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.id = ? AND p.seller_id = ?`,
    [productId, sid]
  );

  res.json({ success: true, message: 'Product updated successfully', data: updatedProductResult.rows[0] });
});

// @desc    Delete product (seller)
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
  const sid = sellerId(req);
  const productId = req.params.id;

  const productCheck = await executeQuery('SELECT id FROM products WHERE id = ? AND seller_id = ?', [productId, sid]);
  if (productCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found or not authorized' });

  const ordersCheck = await executeQuery('SELECT COUNT(*) as total FROM order_items WHERE product_id = ?', [productId]);
  const hasOrders = parseInt(ordersCheck.rows[0].total) > 0;

  if (hasOrders) {
    await executeQuery('UPDATE products SET is_active = 0 WHERE id = ? AND seller_id = ?', [productId, sid]);
    return res.json({ success: true, message: 'Product deactivated (has orders). Cannot permanently delete.' });
  }

  await executeQuery('DELETE FROM products WHERE id = ? AND seller_id = ?', [productId, sid]);
  res.json({ success: true, message: 'Product deleted successfully' });
});

module.exports = {
  getDashboardStats,
  getSellerProducts,
  getSellerOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  createProduct,
  updateProduct,
  deleteProduct,
};
