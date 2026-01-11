const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total products
  const productsResult = await executeQuery('SELECT COUNT(*) as total FROM products');
  const totalProducts = productsResult.rows[0].total;

  // Get active products
  const activeProductsResult = await executeQuery('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
  const activeProducts = activeProductsResult.rows[0].total;

  // Get total users
  const usersResult = await executeQuery('SELECT COUNT(*) as total FROM users');
  const totalUsers = usersResult.rows[0].total;

  // Get active users
  const activeUsersResult = await executeQuery('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
  const activeUsers = activeUsersResult.rows[0].total;

  // Get total orders
  const ordersResult = await executeQuery('SELECT COUNT(*) as total FROM orders');
  const totalOrders = ordersResult.rows[0].total;

  // Get pending orders
  const pendingOrdersResult = await executeQuery("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
  const pendingOrders = pendingOrdersResult.rows[0].total;

  // Get total revenue
  const revenueResult = await executeQuery(
    "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'"
  );
  const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

  // Get recent orders
  const recentOrdersResult = await executeQuery(`
    SELECT o.*, u.first_name, u.last_name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `);

  // Get low stock products
  const lowStockResult = await executeQuery(`
    SELECT id, name, sku, stock_quantity, min_stock_level
    FROM products
    WHERE stock_quantity <= min_stock_level AND is_active = 1
    ORDER BY stock_quantity ASC
    LIMIT 10
  `);

  // Get sales by month (last 6 months)
  const salesByMonthResult = await executeQuery(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as orders,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders
    WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `);

  res.json({
    success: true,
    data: {
      stats: {
        products: {
          total: parseInt(totalProducts),
          active: parseInt(activeProducts),
          inactive: parseInt(totalProducts) - parseInt(activeProducts),
        },
        users: {
          total: parseInt(totalUsers),
          active: parseInt(activeUsers),
          inactive: parseInt(totalUsers) - parseInt(activeUsers),
        },
        orders: {
          total: parseInt(totalOrders),
          pending: parseInt(pendingOrders),
        },
        revenue: {
          total: totalRevenue,
        },
      },
      recentOrders: recentOrdersResult.rows,
      lowStockProducts: lowStockResult.rows,
      salesByMonth: salesByMonthResult.rows,
    },
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, is_active } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (search) {
    whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (role) {
    whereClause += ' AND role = ?';
    params.push(role);
  }

  if (is_active !== undefined) {
    whereClause += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
  const countResult = await executeQuery(countQuery, params);
  const totalUsers = countResult.rows[0].total;
  const totalPages = Math.ceil(totalUsers / limit);

  // Get users
  const usersQuery = `
    SELECT id, first_name, last_name, email, phone, role, is_active, is_email_verified, created_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const usersParams = [...params, parseInt(limit), parseInt(offset)];
  const usersResult = await executeQuery(usersQuery, usersParams);

  res.json({
    success: true,
    data: usersResult.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalUsers: parseInt(totalUsers),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Get single user (admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const userQuery = `
    SELECT id, first_name, last_name, email, phone, date_of_birth, gender, 
           role, is_active, is_email_verified, created_at, updated_at
    FROM users
    WHERE id = ?
  `;
  const userResult = await executeQuery(userQuery, [userId]);

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Get user orders count
  const ordersCountResult = await executeQuery('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);

  res.json({
    success: true,
    data: {
      ...userResult.rows[0],
      ordersCount: parseInt(ordersCountResult.rows[0].total),
    },
  });
});

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, phone, role, is_active, is_email_verified } = req.body;

  // Check if user exists
  const userCheck = await executeQuery('SELECT id FROM users WHERE id = ?', [userId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Build update query
  const updateFields = [];
  const updateValues = [];

  if (first_name !== undefined) {
    updateFields.push('first_name = ?');
    updateValues.push(first_name);
  }
  if (last_name !== undefined) {
    updateFields.push('last_name = ?');
    updateValues.push(last_name);
  }
  if (email !== undefined) {
    updateFields.push('email = ?');
    updateValues.push(email);
  }
  if (phone !== undefined) {
    updateFields.push('phone = ?');
    updateValues.push(phone);
  }
  if (role !== undefined) {
    updateFields.push('role = ?');
    updateValues.push(role);
  }
  if (is_active !== undefined) {
    updateFields.push('is_active = ?');
    updateValues.push(is_active ? 1 : 0);
  }
  if (is_email_verified !== undefined) {
    updateFields.push('is_email_verified = ?');
    updateValues.push(is_email_verified ? 1 : 0);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update',
    });
  }

  updateValues.push(userId);

  const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  await executeQuery(updateQuery, updateValues);

  // Get updated user
  const updatedUserResult = await executeQuery(
    'SELECT id, first_name, last_name, email, phone, role, is_active, is_email_verified FROM users WHERE id = ?',
    [userId]
  );

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUserResult.rows[0],
  });
});

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const userCheck = await executeQuery('SELECT id FROM users WHERE id = ?', [userId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Don't allow deleting admin users
  const adminCheck = await executeQuery('SELECT role FROM users WHERE id = ?', [userId]);
  if (adminCheck.rows[0].role === 'admin' || adminCheck.rows[0].role === 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete admin users',
    });
  }

  // Delete user (cascade will handle related records)
  await executeQuery('DELETE FROM users WHERE id = ?', [userId]);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, payment_status, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status) {
    whereClause += ' AND o.status = ?';
    params.push(status);
  }

  if (payment_status) {
    whereClause += ' AND o.payment_status = ?';
    params.push(payment_status);
  }

  if (search) {
    whereClause += ' AND (o.order_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ${whereClause}
  `;
  const countResult = await executeQuery(countQuery, params);
  const totalOrders = countResult.rows[0].total;
  const totalPages = Math.ceil(totalOrders / limit);

  // Get orders
  const ordersQuery = `
    SELECT 
      o.*,
      u.first_name, u.last_name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const ordersParams = [...params, parseInt(limit), parseInt(offset)];
  const ordersResult = await executeQuery(ordersQuery, ordersParams);

  res.json({
    success: true,
    data: ordersResult.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalOrders: parseInt(totalOrders),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { status, tracking_number } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  // Check if order exists
  const orderCheck = await executeQuery('SELECT id FROM orders WHERE id = ?', [orderId]);
  if (orderCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  const updateFields = ['status = ?'];
  const updateValues = [status];

  if (tracking_number) {
    updateFields.push('tracking_number = ?');
    updateValues.push(tracking_number);
  }

  if (status === 'delivered') {
    updateFields.push('delivered_at = NOW()');
  }

  updateValues.push(orderId);

  await executeQuery(`UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

  // Get updated order
  const updatedOrderResult = await executeQuery(
    'SELECT o.*, u.first_name, u.last_name, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
    [orderId]
  );

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: updatedOrderResult.rows[0],
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrders,
  updateOrderStatus,
};

