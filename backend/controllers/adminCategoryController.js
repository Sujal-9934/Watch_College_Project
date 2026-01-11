const { executeQuery } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all categories (admin)
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAdminCategories = asyncHandler(async (req, res) => {
  const categoriesResult = await executeQuery(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `);

  res.json({
    success: true,
    data: categoriesResult.rows.map(cat => ({
      ...cat,
      product_count: parseInt(cat.product_count) || 0,
    })),
  });
});

// @desc    Create category (admin)
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, image, is_active, sort_order } = req.body;

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name and slug',
    });
  }

  // Check if slug already exists
  const slugCheck = await executeQuery('SELECT id FROM categories WHERE slug = ?', [slug]);
  if (slugCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Category with this slug already exists',
    });
  }

  const insertQuery = `
    INSERT INTO categories (name, description, slug, image, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(insertQuery, [
    name,
    description || null,
    slug,
    image || null,
    is_active !== false ? 1 : 0,
    sort_order || 0,
  ]);

  const categoryId = result.rows.insertId;

  const categoryResult = await executeQuery('SELECT * FROM categories WHERE id = ?', [categoryId]);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: categoryResult.rows[0],
  });
});

// @desc    Update category (admin)
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const { name, description, slug, image, is_active, sort_order } = req.body;

  // Check if category exists
  const categoryCheck = await executeQuery('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (categoryCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  // Check slug uniqueness if slug is being updated
  if (slug) {
    const slugCheck = await executeQuery('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, categoryId]);
    if (slugCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists',
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
  if (image !== undefined) {
    updateFields.push('image = ?');
    updateValues.push(image);
  }
  if (is_active !== undefined) {
    updateFields.push('is_active = ?');
    updateValues.push(is_active ? 1 : 0);
  }
  if (sort_order !== undefined) {
    updateFields.push('sort_order = ?');
    updateValues.push(parseInt(sort_order));
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update',
    });
  }

  updateValues.push(categoryId);

  await executeQuery(`UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

  const updatedCategoryResult = await executeQuery('SELECT * FROM categories WHERE id = ?', [categoryId]);

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategoryResult.rows[0],
  });
});

// @desc    Delete category (admin)
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  // Check if category exists
  const categoryCheck = await executeQuery('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (categoryCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  // Check if category has products
  const productsCheck = await executeQuery('SELECT COUNT(*) as total FROM products WHERE category_id = ?', [categoryId]);
  const hasProducts = parseInt(productsCheck.rows[0].total) > 0;

  if (hasProducts) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with associated products',
    });
  }

  await executeQuery('DELETE FROM categories WHERE id = ?', [categoryId]);

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

