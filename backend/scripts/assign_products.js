const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

const assignProductsToSeller = async () => {
    try {
        await connectDB();

        // Get seller ID for sujalvadhaiya531@gmail.com
        const sellerEmail = 'sujalvadhaiya531@gmail.com';
        const sellerRes = await executeQuery('SELECT id FROM users WHERE email = ?', [sellerEmail]);
        if (sellerRes.rows.length === 0) {
            console.log(`❌ Seller not found: ${sellerEmail}`);
            await closeConnection();
            return;
        }
        const sellerId = sellerRes.rows[0].id;
        console.log(`✅ Found seller ID: ${sellerId}`);

        // Assign products
        const updateRes = await executeQuery('UPDATE products SET seller_id = ? WHERE seller_id IS NULL', [sellerId]);
        console.log(`✅ Successfully assigned ${updateRes.rows.affectedRows} products to seller ID: ${sellerId}`);

        // Show assigned products
        const productsRes = await executeQuery(
            `SELECT p.id, p.name, p.sku, p.price, p.stock_quantity, p.is_active, c.name as category, b.name as brand
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE p.seller_id = ?`,
            [sellerId]
        );
        console.table(productsRes.rows);

        await closeConnection();
        process.exit(0);
    } catch (e) {
        console.error(e);
        await closeConnection();
        process.exit(1);
    }
}
assignProductsToSeller();
