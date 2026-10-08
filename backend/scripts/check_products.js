const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

const checkProducts = async () => {
    try {
        await connectDB();
        const res = await executeQuery('SELECT seller_id, COUNT(*) as count FROM products GROUP BY seller_id');
        console.table(res.rows);
        await closeConnection();
        process.exit(0);
    } catch (e) {
        console.error(e);
        await closeConnection();
        process.exit(1);
    }
}
checkProducts();
