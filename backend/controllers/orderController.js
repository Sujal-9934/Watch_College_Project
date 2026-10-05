const { executeQuery, getPool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

  // Validate required fields
  if (!shippingAddress) {
    return res.status(400).json({
      success: false,
      message: 'Shipping address is required',
    });
  }

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
      p.stock_quantity as product_stock,
      pv.price_modifier,
      pv.stock_quantity as variant_stock
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

  // Validate stock availability
  for (const item of cartItems) {
    const availableStock = item.variant_id ? item.variant_stock : item.product_stock;
    if (availableStock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.product_name}. Only ${availableStock} available.`,
      });
    }
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

  // Use manual transaction with connection
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert shipping address
    let shippingAddressId = null;
    const [shippingResult] = await connection.execute(
      `INSERT INTO addresses (user_id, first_name, last_name, email, phone, address, city, state, zip_code, country, type)
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
    shippingAddressId = shippingResult.insertId;

    // Insert billing address (use shipping if not provided)
    let billingAddressId = null;
    const billingData = billingAddress || shippingAddress;
    const [billingResult] = await connection.execute(
      `INSERT INTO addresses (user_id, first_name, last_name, email, phone, address, city, state, zip_code, country, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'billing')`,
      [
        userId,
        billingData.firstName || shippingAddress.firstName,
        billingData.lastName || shippingAddress.lastName,
        billingData.email || shippingAddress.email,
        billingData.phone || shippingAddress.phone,
        billingData.address || shippingAddress.address,
        billingData.city || shippingAddress.city,
        billingData.state || shippingAddress.state,
        billingData.zipCode || shippingAddress.zipCode,
        billingData.country || shippingAddress.country || 'India',
      ]
    );
    billingAddressId = billingResult.insertId;

    // Create order
    const orderNumber = generateOrderNumber();
    let razorpayOrderId = null;

    if (paymentMethod === 'razorpay') {
      // Check if we have valid razorpay keys - ensure we trim to avoid whitespace issues
      const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

      const hasValidKeys = keyId &&
        keyId !== 'rzp_test_your_key_id' &&
        keySecret !== 'your_razorpay_secret' &&
        keyId.startsWith('rzp_');

      if (hasValidKeys) {
        try {
          const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // amount in paise
            currency: 'INR',
            receipt: orderNumber,
          });
          razorpayOrderId = razorpayOrder.id;
        } catch (err) {
          console.error('Razorpay order creation failed:', err.message);
          throw new Error('Failed to initiate payment. Please try again.');
        }
      } else {
        console.log('⚠️ Using dummy Razorpay ID because keys are not configured');
        razorpayOrderId = 'dummy_razorpay_' + Date.now();
      }
    }

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (order_number, user_id, status, payment_status, payment_method, payment_id, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id, billing_address_id, order_notes)
       VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        paymentMethod,
        razorpayOrderId,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        shippingAddressId,
        billingAddressId,
        orderNotes || null,
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of cartItems) {
      const itemPrice = parseFloat(item.price) + (parseFloat(item.price_modifier) || 0);
      const totalPrice = itemPrice * item.quantity;

      await connection.execute(
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
        await connection.execute(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      } else {
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Clear cart
    await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

    // Commit transaction
    await connection.commit();

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

    const orderData = {
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
    };

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail } = require('../utils/email');
      const userEmail = req.user.email || shippingAddress.email;

      if (userEmail) {
        await sendOrderConfirmationEmail(userEmail, {
          orderNumber: order.order_number,
          orderDate: new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          items: itemsRows.map(item => ({
            product_name: item.product_name,
            product_sku: item.product_sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
          subtotal: order.subtotal,
          taxAmount: order.tax_amount,
          shippingAmount: order.shipping_amount,
          totalAmount: order.total_amount,
          shippingAddress: orderData.shipping_address,
          paymentMethod: order.payment_method,
        });
        console.log('✅ Order confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send order confirmation email:', emailError.message);
      // Don't fail the order creation if email fails
    }

    res.json({
      success: true,
      message: 'Order placed successfully',
      data: orderData,
    });
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Order creation error:', error);
    throw error;
  } finally {
    // Release connection
    connection.release();
  }
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

  // Restore stock for cancelled order items
  try {
    const itemsQuery = 'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?';
    const { rows: items } = await executeQuery(itemsQuery, [orderId]);

    for (const item of items) {
      if (item.variant_id) {
        await executeQuery(
          'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      } else {
        await executeQuery(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }
  } catch (stockError) {
    console.error('Failed to restore stock for cancelled order:', stockError);
    // Don't fail the response if stock restoration fails, but log it
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
  });
});

// @desc    Download order receipt as PDF
// @route   GET /api/orders/:id/receipt
// @access  Private
const downloadOrderReceipt = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  // Get order with all details
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
      sa.phone as shipping_phone,
      u.email as user_email
    FROM orders o
    LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
    LEFT JOIN users u ON o.user_id = u.id
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

  // Prepare order data for PDF
  const orderData = {
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
  };

  // Generate PDF
  const { generateOrderReceipt } = require('../utils/pdfGenerator');
  const pdfBuffer = await generateOrderReceipt(orderData);

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Order-${order.order_number}-Receipt.pdf"`);
  res.setHeader('Content-Length', pdfBuffer.length);

  // Send PDF
  res.send(pdfBuffer);
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  downloadOrderReceipt,
};
