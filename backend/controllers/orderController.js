const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const crypto = require('crypto');

// Generate unique order number
const generateOrderNumber = () => {
  return 'ORD' + Date.now() + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, billingAddress, paymentMethod = 'cod', orderNotes } = req.body;

  // Get cart items
  const cartQuery = `
    SELECT 
      c.id,
      c.product_id,
      c.variant_id,
      c.quantity,
      p.name as product_name,
      p.sku as product_sku,
      p.price,
      pv.price_modifier
    FROM cart c
    JOIN products p ON c.product_id = p.id
    LEFT JOIN product_variants pv ON c.variant_id = pv.id
    WHERE c.user_id = ? AND p.is_active = 1
  `;

  const { rows: cartItems } = await executeQuery(cartQuery, [userId]);

  if (cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty',
    });
  }

  // Calculate totals
  let subtotal = 0;
  cartItems.forEach(item => {
    const itemPrice = parseFloat(item.price) + (parseFloat(item.price_modifier) || 0);
    subtotal += itemPrice * item.quantity;
  });

  const taxAmount = subtotal * 0.18; // 18% GST
  const shippingAmount = 0; // Free shipping
  const totalAmount = subtotal + taxAmount + shippingAmount;

  // Create address records
  let shippingAddressId = null;
  let billingAddressId = null;

  await executeTransaction(async (connection) => {
    // Insert shipping address
    if (shippingAddress) {
      const shippingResult = await connection.query(
        `INSERT INTO addresses (user_id, first_name, last_name, email, phone, address, city, state, zip_code, country, address_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'shipping')`,
        [
          userId,
          shippingAddress.firstName,
          shippingAddress.lastName,
          shippingAddress.email,
          shippingAddress.phone,
          shippingAddress.address,
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.zipCode,
          shippingAddress.country || 'India',
        ]
      );
      shippingAddressId = shippingResult[0].insertId;
    }

    // Insert billing address
    if (billingAddress) {
      const billingResult = await connection.query(
        `INSERT INTO addresses (user_id, first_name, last_name, email, phone, address, city, state, zip_code, country, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'billing')`,
        [
          userId,
          billingAddress.firstName || shippingAddress.firstName,
          billingAddress.lastName || shippingAddress.lastName,
          billingAddress.email || shippingAddress.email,
          billingAddress.phone || shippingAddress.phone,
          billingAddress.address || shippingAddress.address,
          billingAddress.city || shippingAddress.city,
          billingAddress.state || shippingAddress.state,
          billingAddress.zipCode || shippingAddress.zipCode,
          billingAddress.country || shippingAddress.country || 'India',
        ]
      );
      billingAddressId = billingResult[0].insertId;
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await connection.query(
      `INSERT INTO orders (order_number, user_id, status, payment_status, payment_method, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id, billing_address_id, order_notes)
       VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        paymentMethod,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        shippingAddressId,
        billingAddressId,
        orderNotes || null,
      ]
    );

    const orderId = orderResult[0].insertId;

    // Create order items
    for (const item of cartItems) {
      const itemPrice = parseFloat(item.price) + (parseFloat(item.price_modifier) || 0);
      const totalPrice = itemPrice * item.quantity;

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, product_sku, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id || null,
          item.product_name,
          item.product_sku,
          item.quantity,
          itemPrice,
          totalPrice,
        ]
      );

      // Update product stock
      if (item.variant_id) {
        await connection.query(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      } else {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Clear cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    // Get created order with details
    const orderQuery = `
      SELECT 
        o.*,
        sa.first_name as shipping_first_name,
        sa.last_name as shipping_last_name,
        sa.address as shipping_address,
        sa.city as shipping_city,
        sa.state as shipping_state,
        sa.zip_code as shipping_zip_code,
        sa.country as shipping_country,
        sa.phone as shipping_phone
      FROM orders o
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      WHERE o.id = ?
    `;

    const { rows: orderRows } = await executeQuery(orderQuery, [orderId]);
    const order = orderRows[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as product_image
      FROM order_items oi
      WHERE oi.order_id = ?
    `;

    const { rows: itemsRows } = await executeQuery(itemsQuery, [orderId]);

    res.json({
      success: true,
      data: {
        ...order,
        shipping_address: {
          first_name: order.shipping_first_name,
          last_name: order.shipping_last_name,
          address: order.shipping_address,
          city: order.shipping_city,
          state: order.shipping_state,
          zip_code: order.shipping_zip_code,
          country: order.shipping_country,
          phone: order.shipping_phone,
        },
        order_items: itemsRows,
      },
    });
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
  const countResult = await executeQuery(countQuery, [userId]);
  const totalOrders = countResult.rows[0].total;
  const totalPages = Math.ceil(totalOrders / limit);

  const ordersQuery = `
    SELECT 
      o.*,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const { rows: orders } = await executeQuery(ordersQuery, [userId, parseInt(limit), parseInt(offset)]);

  // Get order items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
      const { rows: items } = await executeQuery(itemsQuery, [order.id]);
      return { ...order, order_items: items };
    })
  );

  res.json({
    success: true,
    data: ordersWithItems,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalOrders: parseInt(totalOrders),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const orderQuery = `
    SELECT 
      o.*,
      sa.first_name as shipping_first_name,
      sa.last_name as shipping_last_name,
      sa.address as shipping_address,
      sa.city as shipping_city,
      sa.state as shipping_state,
      COALESCE(sa.zip_code, sa.postal_code) as shipping_zip_code,
      sa.country as shipping_country,
      sa.phone as shipping_phone
    FROM orders o
    LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
    WHERE o.id = ? AND o.user_id = ?
  `;

  const { rows: orderRows } = await executeQuery(orderQuery, [orderId, userId]);

  if (orderRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  const order = orderRows[0];

  // Get order items
  const itemsQuery = `
    SELECT 
      oi.*,
      (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as product_image
    FROM order_items oi
    WHERE oi.order_id = ?
  `;

  const { rows: itemsRows } = await executeQuery(itemsQuery, [orderId]);

  res.json({
    success: true,
    data: {
      ...order,
      shipping_address: {
        first_name: order.shipping_first_name,
        last_name: order.shipping_last_name,
        address: order.shipping_address,
        city: order.shipping_city,
        state: order.shipping_state,
        zip_code: order.shipping_zip_code,
        country: order.shipping_country,
        phone: order.shipping_phone,
      },
      order_items: itemsRows,
    },
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  const { reason } = req.body;

  // Check if order exists and belongs to user
  const orderCheck = await executeQuery(
    'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );

  if (orderCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  const order = orderCheck.rows[0];

  if (order.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Order is already cancelled',
    });
  }

  if (order.status === 'delivered' || order.status === 'shipped') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel order that is already shipped or delivered',
    });
  }

  await executeQuery(
    `UPDATE orders 
     SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, cancelled_reason = ?
     WHERE id = ?`,
    [reason || 'Cancelled by user', orderId]
  );

  res.json({
    success: true,
    message: 'Order cancelled successfully',
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
};

