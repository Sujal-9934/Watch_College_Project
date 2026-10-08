const { executeQuery } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all brands (admin)
// @route   GET /api/admin/brands
// @access  Private/Admin
const getAdminBrands = asyncHandler(async (req, res) => {
  const brandsResult = await executeQuery(`
    SELECT b.*, COUNT(p.id) as product_count
    FROM brands b
    LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = 1
    GROUP BY b.id
    ORDER BY b.sort_order ASC, b.name ASC
  `);

  res.json({
    success: true,
    data: brandsResult.rows.map(brand => ({
      ...brand,
      product_count: parseInt(brand.product_count) || 0,
    })),
  });
});

// @desc    Create brand (admin)
// @route   POST /api/admin/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  const { name, description, slug, logo, is_active, sort_order } = req.body;

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name and slug',
    });
  }

  // Check if slug already exists
  const slugCheck = await executeQuery('SELECT id FROM brands WHERE slug = ?', [slug]);
  if (slugCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Brand with this slug already exists',
    });
  }

  const insertQuery = `
    INSERT INTO brands (name, description, slug, logo, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(insertQuery, [
    name,
    description || null,
    slug,
    logo || null,
    is_active !== false ? 1 : 0,
    sort_order || 0,
  ]);

  const brandId = result.insertId;

  const brandResult = await executeQuery('SELECT * FROM brands WHERE id = ?', [brandId]);

  res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: brandResult.rows[0],
  });
});

// @desc    Update brand (admin)
// @route   PUT /api/admin/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
  const brandId = req.params.id;
  const { name, description, slug, logo, is_active, sort_order } = req.body;

  // Check if brand exists
  const brandCheck = await executeQuery('SELECT id FROM brands WHERE id = ?', [brandId]);
  if (brandCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Brand not found',
    });
  }

  // Check slug uniqueness if slug is being updated
  if (slug) {
    const slugCheck = await executeQuery('SELECT id FROM brands WHERE slug = ? AND id != ?', [slug, brandId]);
    if (slugCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Brand with this slug already exists',
      });
    }
  }

  // Build update query
  const updateFields = [];
  const updateValues = [];

  if (name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  if (description !== undefined) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }
  if (slug !== undefined) {
    updateFields.push('slug = ?');
    updateValues.push(slug);
  }
  if (logo !== undefined) {
    updateFields.push('logo = ?');
    updateValues.push(logo);
  }
  if (is_active !== undefined) {
    updateFields.push('is_active = ?');
    updateValues.push(is_active ? 1 : 0);
  }
  if (sort_order !== undefined) {
    updateFields.push('sort_order = ?');
    updateValues.push(sort_order);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update',
    });
  }

  updateValues.push(brandId);

  await executeQuery(`UPDATE brands SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

  const updatedBrandResult = await executeQuery('SELECT * FROM brands WHERE id = ?', [brandId]);

  res.json({
    success: true,
    message: 'Brand updated successfully',
    data: updatedBrandResult.rows[0],
  });
});

// @desc    Delete brand (admin)
// @route   DELETE /api/admin/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  const brandId = req.params.id;

  // Check if brand exists
  const brandCheck = await executeQuery('SELECT id FROM brands WHERE id = ?', [brandId]);
  if (brandCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Brand not found',
    });
  }

  // Check if brand has products
  const productsCheck = await executeQuery(
    'SELECT COUNT(*) as total FROM products WHERE brand_id = ?',
    [brandId]
  );
  const hasProducts = parseInt(productsCheck.rows[0].total) > 0;

  if (hasProducts) {
    // Soft delete - just mark as inactive
    await executeQuery('UPDATE brands SET is_active = 0 WHERE id = ?', [brandId]);
    return res.json({
      success: true,
      message: 'Brand deactivated (has products). Cannot permanently delete.',
    });
  }

  // Hard delete - brand has no products
  await executeQuery('DELETE FROM brands WHERE id = ?', [brandId]);

  res.json({
    success: true,
    message: 'Brand deleted successfully',
  });
});

module.exports = {
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};

