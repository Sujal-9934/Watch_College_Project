const { executeQuery } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort = 'created_at',
    order = 'desc',
    featured,
    inStock
  } = req.query;

  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = 'WHERE p.is_active = 1';
  const params = [];

  if (category) {
    whereClause += ' AND p.category_id = ?';
    params.push(category);
  }

  if (brand) {
    whereClause += ' AND p.brand_id = ?';
    params.push(brand);
  }

  if (minPrice) {
    whereClause += ' AND p.price >= ?';
    params.push(minPrice);
  }

  if (maxPrice) {
    whereClause += ' AND p.price <= ?';
    params.push(maxPrice);
  }

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (featured === 'true') {
    whereClause += ' AND p.is_featured = 1';
  }

  if (inStock === 'true') {
    whereClause += ' AND p.stock_quantity > 0';
  }

  // Build ORDER BY clause
  const validSortFields = ['name', 'price', 'created_at', 'stock_quantity'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
  const countResult = await executeQuery(countQuery, params);
  const totalProducts = countResult.rows[0].total;
  const totalPages = Math.ceil(totalProducts / limit);

  // Get products with joins
  const productsQuery = `
    SELECT
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      b.name as brand_name,
      b.slug as brand_slug,
      GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.sort_order, pi.is_primary DESC) as images,
      AVG(pr.rating) as average_rating,
      COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = 1
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const productParams = [...params, parseInt(limit), parseInt(offset)];
  const { rows: products } = await executeQuery(productsQuery, productParams);

  // Process products to format images and ratings
  const formattedProducts = products.map(product => ({
    ...product,
    images: product.images ? product.images.split(',') : [],
    average_rating: parseFloat(product.average_rating) || 0,
    review_count: parseInt(product.review_count) || 0,
    discount_percentage: product.discount_percentage || 0,
    original_price: product.original_price || product.price,
    is_on_sale: product.original_price && product.original_price > product.price,
    price: parseFloat(product.price),
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
      limit: parseInt(limit),
    },
    filters: {
      category: category || null,
      brand: brand || null,
      priceRange: minPrice && maxPrice ? { min: minPrice, max: maxPrice } : null,
      search: search || null,
      featured: featured === 'true',
      inStock: inStock === 'true',
    },
    sort: {
      field: sortField,
      order: sortOrder,
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const productQuery = `
    SELECT
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      b.name as brand_name,
      b.slug as brand_slug,
      AVG(pr.rating) as average_rating,
      COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = 1
    WHERE p.id = ? AND p.is_active = 1
    GROUP BY p.id
  `;

  const { rows } = await executeQuery(productQuery, [productId]);

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  const product = rows[0];

  // Get product images
  const imagesQuery = `
    SELECT id, image_url, alt_text, sort_order, is_primary
    FROM product_images
    WHERE product_id = ?
    ORDER BY sort_order, is_primary DESC
  `;
  const imagesResult = await executeQuery(imagesQuery, [productId]);

  // Get product variants
  const variantsQuery = `
    SELECT id, variant_name, variant_value, price_modifier, stock_quantity, sku_suffix
    FROM product_variants
    WHERE product_id = ?
    ORDER BY variant_name, variant_value
  `;
  const variantsResult = await executeQuery(variantsQuery, [productId]);

  // Get related products (same category, excluding current product)
  const relatedQuery = `
    SELECT
      p.id, p.name, p.price, p.original_price, p.discount_percentage,
      GROUP_CONCAT(pi.image_url ORDER BY pi.is_primary DESC) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1 AND p.stock_quantity > 0
    GROUP BY p.id
    ORDER BY p.is_featured DESC, p.created_at DESC
    LIMIT 4
  `;
  const relatedResult = await executeQuery(relatedQuery, [product.category_id, productId]);

  // Get recent reviews
  const reviewsQuery = `
    SELECT
      pr.id, pr.rating, pr.title, pr.review_text, pr.created_at,
      u.first_name, u.last_name
    FROM product_reviews pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.product_id = ? AND pr.is_approved = 1
    ORDER BY pr.created_at DESC
    LIMIT 5
  `;
  const reviewsResult = await executeQuery(reviewsQuery, [productId]);

  const formattedProduct = {
    ...product,
    images: imagesResult.rows,
    variants: variantsResult.rows,
    related_products: relatedResult.rows.map(p => ({
      ...p,
      images: p.images ? p.images.split(',') : [],
      price: parseFloat(p.price),
      original_price: p.original_price ? parseFloat(p.original_price) : null,
    })),
    reviews: reviewsResult.rows.map(r => ({
      ...r,
      rating: parseInt(r.rating),
    })),
    average_rating: parseFloat(product.average_rating) || 0,
    review_count: parseInt(product.review_count) || 0,
    price: parseFloat(product.price),
    original_price: product.original_price ? parseFloat(product.original_price) : null,
    stock_quantity: parseInt(product.stock_quantity),
    warranty_period: parseInt(product.warranty_period),
    weight: product.weight ? parseFloat(product.weight) : null,
    is_on_sale: product.original_price && product.original_price > product.price,
  };

  res.json({
    success: true,
    data: formattedProduct,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const query = `
    SELECT
      p.id, p.name, p.price, p.original_price, p.discount_percentage, p.short_description, p.stock_quantity,
      GROUP_CONCAT(pi.image_url ORDER BY pi.is_primary DESC) as images,
      b.name as brand_name,
      AVG(pr.rating) as average_rating,
      COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = 1
    WHERE p.is_featured = 1 AND p.is_active = 1
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `;

  const { rows } = await executeQuery(query, [limit]);

  const products = rows.map(product => ({
    ...product,
    images: product.images ? product.images.split(',') : [],
    price: parseFloat(product.price),
    original_price: product.original_price ? parseFloat(product.original_price) : null,
    average_rating: parseFloat(product.average_rating) || 0,
    review_count: parseInt(product.review_count) || 0,
    stock_quantity: parseInt(product.stock_quantity) || 0,
    is_on_sale: product.original_price && product.original_price > product.price,
  }));

  res.json({
    success: true,
    data: products,
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;

  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.json({
      success: true,
      data: [],
      message: 'Search term must be at least 2 characters',
    });
  }

  const searchQuery = `
    SELECT
      p.id, p.name, p.price, p.original_price, p.discount_percentage,
      GROUP_CONCAT(pi.image_url ORDER BY pi.is_primary DESC) as images,
      b.name as brand_name,
      MATCH(p.name, p.description, p.short_description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE MATCH(p.name, p.description, p.short_description) AGAINST(? IN NATURAL LANGUAGE MODE)
      AND p.is_active = 1 AND p.stock_quantity > 0
    GROUP BY p.id
    ORDER BY relevance DESC, p.is_featured DESC
    LIMIT ?
  `;

  const { rows } = await executeQuery(searchQuery, [searchTerm, searchTerm, parseInt(limit)]);

  const products = rows.map(product => ({
    ...product,
    images: product.images ? product.images.split(',') : [],
    price: parseFloat(product.price),
    original_price: product.original_price ? parseFloat(product.original_price) : null,
    is_on_sale: product.original_price && product.original_price > product.price,
  }));

  res.json({
    success: true,
    data: products,
    searchTerm,
    total: products.length,
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categorySlug
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categorySlug } = req.params;
  const { page = 1, limit = 12, sort = 'created_at', order = 'desc' } = req.query;

  const offset = (page - 1) * limit;

  // Get category info
  const categoryQuery = 'SELECT id, name, description FROM categories WHERE slug = ? AND is_active = 1';
  const categoryResult = await executeQuery(categoryQuery, [categorySlug]);

  if (categoryResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  const category = categoryResult.rows[0];

  // Get products in category
  const validSortFields = ['name', 'price', 'created_at', 'stock_quantity'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const productsQuery = `
    SELECT
      p.*,
      b.name as brand_name,
      b.slug as brand_slug,
      GROUP_CONCAT(pi.image_url ORDER BY pi.is_primary DESC) as images,
      AVG(pr.rating) as average_rating,
      COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = 1
    WHERE p.category_id = ? AND p.is_active = 1
    GROUP BY p.id
    ORDER BY p.${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const { rows: products } = await executeQuery(productsQuery, [category.id, parseInt(limit), offset]);

  // Get total count
  const countQuery = 'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = 1';
  const countResult = await executeQuery(countQuery, [category.id]);
  const totalProducts = countResult.rows[0].total;
  const totalPages = Math.ceil(totalProducts / limit);

  const formattedProducts = products.map(product => ({
    ...product,
    images: product.images ? product.images.split(',') : [],
    average_rating: parseFloat(product.average_rating) || 0,
    review_count: parseInt(product.review_count) || 0,
    price: parseFloat(product.price),
    stock_quantity: parseInt(product.stock_quantity),
  }));

  res.json({
    success: true,
    data: {
      category,
      products: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: parseInt(totalProducts),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  // Check if product exists
  const productCheck = await executeQuery('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
  if (productCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Get reviews
  const reviewsQuery = `
    SELECT
      pr.id, pr.rating, pr.title, pr.review_text, pr.created_at, pr.likes_count,
      u.first_name, u.last_name, u.profile_image,
      pr.is_verified_purchase
    FROM product_reviews pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.product_id = ? AND pr.is_approved = 1
    ORDER BY pr.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const { rows: reviews } = await executeQuery(reviewsQuery, [productId, parseInt(limit), offset]);

  // Get total count
  const countQuery = 'SELECT COUNT(*) as total FROM product_reviews WHERE product_id = ? AND is_approved = 1';
  const countResult = await executeQuery(countQuery, [productId]);
  const totalReviews = countResult.rows[0].total;
  const totalPages = Math.ceil(totalReviews / limit);

  // Get rating distribution
  const ratingQuery = `
    SELECT rating, COUNT(*) as count
    FROM product_reviews
    WHERE product_id = ? AND is_approved = 1
    GROUP BY rating
    ORDER BY rating DESC
  `;
  const ratingResult = await executeQuery(ratingQuery, [productId]);

  const ratingDistribution = {};
  ratingResult.rows.forEach(row => {
    ratingDistribution[row.rating] = parseInt(row.count);
  });

  res.json({
    success: true,
    data: {
      reviews: reviews.map(review => ({
        ...review,
        rating: parseInt(review.rating),
        likes_count: parseInt(review.likes_count),
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews: parseInt(totalReviews),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      ratingDistribution,
    },
  });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory,
  getProductReviews,
};
