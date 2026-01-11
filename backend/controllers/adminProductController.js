const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products (admin - includes inactive)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, brand, is_active } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category) {
    whereClause += ' AND p.category_id = ?';
    params.push(category);
  }

  if (brand) {
    whereClause += ' AND p.brand_id = ?';
    params.push(brand);
  }

  if (is_active !== undefined) {
    whereClause += ' AND p.is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
  const countResult = await executeQuery(countQuery, params);
  const totalProducts = countResult.rows[0].total;
  const totalPages = Math.ceil(totalProducts / limit);

  // Get products
  const productsQuery = `
    SELECT 
      p.*,
      c.name as category_name,
      b.name as brand_name,
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
  const productsParams = [...params, parseInt(limit), parseInt(offset)];
  const productsResult = await executeQuery(productsQuery, productsParams);

  const formattedProducts = productsResult.rows.map(product => ({
    ...product,
    images: product.images ? product.images.split(',') : [],
    price: parseFloat(product.price),
    original_price: product.original_price ? parseFloat(product.original_price) : null,
    stock_quantity: parseInt(product.stock_quantity),
  }));

  res.json({
    success: true,
    data: formattedProducts,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalProducts: parseInt(totalProducts),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Create product (admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    short_description,
    sku,
    price,
    original_price,
    discount_percentage,
    stock_quantity,
    min_stock_level,
    category_id,
    brand_id,
    is_featured,
    is_active,
    weight,
    dimensions,
    material,
    movement_type,
    water_resistance,
    warranty_period,
    images,
  } = req.body;

  // Validation
  if (!name || !sku || !price || stock_quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, sku, price, and stock_quantity',
    });
  }

  // Check if SKU already exists
  const skuCheck = await executeQuery('SELECT id FROM products WHERE sku = ?', [sku]);
  if (skuCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Product with this SKU already exists',
    });
  }

  // Calculate discount percentage if original_price is provided
  let calculatedDiscount = discount_percentage || 0;
  if (original_price && original_price > price) {
    calculatedDiscount = ((original_price - price) / original_price) * 100;
  }

  // Insert product
  const insertQuery = `
    INSERT INTO products (
      name, description, short_description, sku, price, original_price,
      discount_percentage, stock_quantity, min_stock_level, category_id,
      brand_id, is_featured, is_active, weight, dimensions, material,
      movement_type, water_resistance, warranty_period
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const productValues = [
    name,
    description || null,
    short_description || null,
    sku,
    parseFloat(price),
    original_price ? parseFloat(original_price) : null,
    calculatedDiscount,
    parseInt(stock_quantity),
    min_stock_level || 5,
    category_id || null,
    brand_id || null,
    is_featured ? 1 : 0,
    is_active !== false ? 1 : 0,
    weight || null,
    dimensions || null,
    material || null,
    movement_type || null,
    water_resistance || null,
    warranty_period || 24,
  ];

  const result = await executeQuery(insertQuery, productValues);
  const productId = result.rows.insertId;

  // Insert images if provided
  if (images && images.length > 0) {
    const imageQueries = images.map((image, index) => ({
      query: 'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
      params: [productId, image.url, image.alt || name, index, index === 0 ? 1 : 0],
    }));
    await executeTransaction(imageQueries);
  }

  // Get created product
  const productResult = await executeQuery(
    `SELECT p.*, c.name as category_name, b.name as brand_name 
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.id = ?`,
    [productId]
  );

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: productResult.rows[0],
  });
});

// @desc    Update product (admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const updateData = req.body;

  // Check if product exists
  const productCheck = await executeQuery('SELECT id FROM products WHERE id = ?', [productId]);
  if (productCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check SKU uniqueness if SKU is being updated
  if (updateData.sku) {
    const skuCheck = await executeQuery('SELECT id FROM products WHERE sku = ? AND id != ?', [updateData.sku, productId]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
      });
    }
  }

  // Calculate discount if original_price and price are provided
  if (updateData.original_price && updateData.price && updateData.original_price > updateData.price) {
    updateData.discount_percentage = ((updateData.original_price - updateData.price) / updateData.original_price) * 100;
  }

  // Build update query
  const allowedFields = [
    'name', 'description', 'short_description', 'sku', 'price', 'original_price',
    'discount_percentage', 'stock_quantity', 'min_stock_level', 'category_id',
    'brand_id', 'is_featured', 'is_active', 'weight', 'dimensions', 'material',
    'movement_type', 'water_resistance', 'warranty_period'
  ];

  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      if (field === 'is_featured' || field === 'is_active') {
        updateValues.push(updateData[field] ? 1 : 0);
      } else if (field === 'price' || field === 'original_price' || field === 'discount_percentage' || field === 'weight') {
        updateValues.push(parseFloat(updateData[field]));
      } else if (field === 'stock_quantity' || field === 'min_stock_level' || field === 'warranty_period') {
        updateValues.push(parseInt(updateData[field]));
      } else {
        updateValues.push(updateData[field]);
      }
    }
  });

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update',
    });
  }

  updateValues.push(productId);

  await executeQuery(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

  // Update images if provided
  if (updateData.images) {
    // Delete existing images
    await executeQuery('DELETE FROM product_images WHERE product_id = ?', [productId]);

    // Insert new images
    if (updateData.images.length > 0) {
      const imageQueries = updateData.images.map((image, index) => ({
        query: 'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
        params: [productId, image.url, image.alt || updateData.name || '', index, index === 0 ? 1 : 0],
      }));
      await executeTransaction(imageQueries);
    }
  }

  // Get updated product
  const updatedProductResult = await executeQuery(
    `SELECT p.*, c.name as category_name, b.name as brand_name 
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.id = ?`,
    [productId]
  );

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProductResult.rows[0],
  });
});

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Check if product exists
  const productCheck = await executeQuery('SELECT id FROM products WHERE id = ?', [productId]);
  if (productCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check if product has orders
  const ordersCheck = await executeQuery(
    'SELECT COUNT(*) as total FROM order_items WHERE product_id = ?',
    [productId]
  );
  const hasOrders = parseInt(ordersCheck.rows[0].total) > 0;

  if (hasOrders) {
    // Soft delete - just mark as inactive
    await executeQuery('UPDATE products SET is_active = 0 WHERE id = ?', [productId]);
    return res.json({
      success: true,
      message: 'Product deactivated (has orders). Cannot permanently delete.',
    });
  }

  // Hard delete - product has no orders
  await executeQuery('DELETE FROM products WHERE id = ?', [productId]);

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

