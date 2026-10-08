const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

const showSellerProducts = async () => {
  try {
<<<<<<< HEAD
    await connectDB();
    
    // Get seller ID
    const sellerEmail = 'sujalvadhaiya531@gmail.com';
=======
    const sellerEmail = process.env.SELLER_EMAIL;
    if (!sellerEmail) {
      throw new Error('Set SELLER_EMAIL before listing seller products.');
    }

    await connectDB();
    
    // Get seller ID
>>>>>>> ffdff2f (Prepare backend for Render deployment)
    const sellerRes = await executeQuery('SELECT id FROM users WHERE email = ?', [sellerEmail]);
    
    if (sellerRes.rows.length === 0) {
      console.log(`❌ Seller not found: ${sellerEmail}`);
      await closeConnection();
      return;
    }
    
    const sellerId = sellerRes.rows[0].id;
    console.log(`📊 Showing products for seller ID: ${sellerId} (${sellerEmail})`);
    
    // Get products for this seller
    const productsRes = await executeQuery(
      `SELECT p.id, p.name, p.sku, p.price, p.stock_quantity, p.is_active, c.name as category, b.name as brand
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.seller_id = ?`,
      [sellerId]
    );
    
    if (productsRes.rows.length === 0) {
      console.log('📭 No products found for this seller.');
    } else {
      console.log(`\n✅ Found ${productsRes.rows.length} products:`);
      console.table(productsRes.rows);
    }
    
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching seller products:', error);
    await closeConnection();
    process.exit(1);
  }
};

showSellerProducts();
