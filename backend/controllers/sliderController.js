const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all sliders (admin)
// @route   GET /api/admin/sliders
// @access  Private/Admin
const getAdminSliders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, is_active } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (is_active === 'true' || is_active === 'false') {
    whereClause += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM sliders ${whereClause}`;
  const countResult = await executeQuery(countQuery, params);
  const totalSliders = countResult.rows[0].total;
  const totalPages = Math.ceil(totalSliders / limit);

  // Get sliders
  const slidersQuery = `
    SELECT id, title, description, image_url, is_active, display_order, created_at, updated_at
    FROM sliders
    ${whereClause}
    ORDER BY display_order ASC, created_at DESC
    LIMIT ? OFFSET ?
  `;
  const slidersParams = [...params, parseInt(limit), parseInt(offset)];
  const slidersResult = await executeQuery(slidersQuery, slidersParams);

  res.json({
    success: true,
    data: slidersResult.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalSliders: parseInt(totalSliders),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Get single slider (admin)
// @route   GET /api/admin/sliders/:id
// @access  Private/Admin
const getAdminSlider = asyncHandler(async (req, res) => {
  const sliderId = req.params.id;

  const sliderQuery = `
    SELECT id, title, description, image_url, is_active, display_order, created_at, updated_at
    FROM sliders
    WHERE id = ?
  `;
  const sliderResult = await executeQuery(sliderQuery, [sliderId]);

  if (sliderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Slider not found',
    });
  }

  res.json({
    success: true,
    data: sliderResult.rows[0],
  });
});

// @desc    Create slider (admin)
// @route   POST /api/admin/sliders
// @access  Private/Admin
const createSlider = asyncHandler(async (req, res) => {
  const { title, description, image_url, is_active = true, display_order = 0 } = req.body;

  // Validate required fields
  if (!title || !image_url) {
    return res.status(400).json({
      success: false,
      message: 'Title and image URL are required',
    });
  }

  // Get the next display order if not provided
  let finalDisplayOrder = display_order;
  if (display_order === 0) {
    const maxOrderResult = await executeQuery('SELECT MAX(display_order) as max_order FROM sliders');
    finalDisplayOrder = (maxOrderResult.rows[0].max_order || 0) + 1;
  }

  const insertQuery = `
    INSERT INTO sliders (title, description, image_url, is_active, display_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const insertResult = await executeQuery(insertQuery, [
    title,
    description || '',
    image_url,
    is_active ? 1 : 0,
    finalDisplayOrder,
  ]);

  // Get the created slider
  const sliderId = insertResult.insertId;
  const createdSliderResult = await executeQuery(
    'SELECT id, title, description, image_url, is_active, display_order, created_at, updated_at FROM sliders WHERE id = ?',
    [sliderId]
  );

  res.status(201).json({
    success: true,
    message: 'Slider created successfully',
    data: createdSliderResult.rows[0],
  });
});

// @desc    Update slider (admin)
// @route   PUT /api/admin/sliders/:id
// @access  Private/Admin
const updateSlider = asyncHandler(async (req, res) => {
  const sliderId = req.params.id;
  const { title, description, image_url, is_active, display_order } = req.body;

  // Check if slider exists
  const sliderCheck = await executeQuery('SELECT id FROM sliders WHERE id = ?', [sliderId]);
  if (sliderCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Slider not found',
    });
  }

  // Build update query
  const updateFields = [];
  const updateValues = [];

  if (title !== undefined) {
    updateFields.push('title = ?');
    updateValues.push(title);
  }
  if (description !== undefined) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }
  if (image_url !== undefined) {
    updateFields.push('image_url = ?');
    updateValues.push(image_url);
  }
  if (is_active !== undefined) {
    updateFields.push('is_active = ?');
    updateValues.push(is_active ? 1 : 0);
  }
  if (display_order !== undefined) {
    updateFields.push('display_order = ?');
    updateValues.push(display_order);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update',
    });
  }

  updateFields.push('updated_at = NOW()');
  updateValues.push(sliderId);

  const updateQuery = `UPDATE sliders SET ${updateFields.join(', ')} WHERE id = ?`;
  await executeQuery(updateQuery, updateValues);

  // Get updated slider
  const updatedSliderResult = await executeQuery(
    'SELECT id, title, description, image_url, is_active, display_order, created_at, updated_at FROM sliders WHERE id = ?',
    [sliderId]
  );

  res.json({
    success: true,
    message: 'Slider updated successfully',
    data: updatedSliderResult.rows[0],
  });
});

// @desc    Delete slider (admin)
// @route   DELETE /api/admin/sliders/:id
// @access  Private/Admin
const deleteSlider = asyncHandler(async (req, res) => {
  const sliderId = req.params.id;

  // Check if slider exists
  const sliderCheck = await executeQuery('SELECT id FROM sliders WHERE id = ?', [sliderId]);
  if (sliderCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Slider not found',
    });
  }

  // Delete slider
  await executeQuery('DELETE FROM sliders WHERE id = ?', [sliderId]);

  res.json({
    success: true,
    message: 'Slider deleted successfully',
  });
});

// @desc    Update slider display order (admin)
// @route   PUT /api/admin/sliders/order
// @access  Private/Admin
const updateSliderOrder = asyncHandler(async (req, res) => {
  const { sliders } = req.body;

  if (!Array.isArray(sliders) || sliders.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Sliders array is required',
    });
  }

  // Update display order for all sliders
  const updatePromises = sliders.map((slider, index) =>
    executeQuery(
      'UPDATE sliders SET display_order = ?, updated_at = NOW() WHERE id = ?',
      [index + 1, slider.id]
    )
  );

  await Promise.all(updatePromises);

  // Get updated sliders
  const updatedSlidersResult = await executeQuery(
    'SELECT id, title, description, image_url, is_active, display_order, created_at, updated_at FROM sliders ORDER BY display_order ASC'
  );

  res.json({
    success: true,
    message: 'Slider order updated successfully',
    data: updatedSlidersResult.rows,
  });
});

// @desc    Get active sliders for homepage (public)
// @route   GET /api/sliders/active
// @access  Public
const getActiveSliders = asyncHandler(async (req, res) => {
  const slidersQuery = `
    SELECT id, title, description, image_url, display_order
    FROM sliders
    WHERE is_active = 1
    ORDER BY display_order ASC
  `;
  const slidersResult = await executeQuery(slidersQuery);

  res.json({
    success: true,
    data: slidersResult.rows,
  });
});

module.exports = {
  getAdminSliders,
  getAdminSlider,
  createSlider,
  updateSlider,
  deleteSlider,
  updateSliderOrder,
  getActiveSliders,
};
