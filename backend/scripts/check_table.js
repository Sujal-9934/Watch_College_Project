const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

const checkTable = async () => {
    try {
        await connectDB();
        const res = await executeQuery('SHOW CREATE TABLE users');
        console.log(res.rows[0]['Create Table']);
        await closeConnection();
        process.exit(0);
    } catch (e) {
        console.error(e);
        await closeConnection();
        process.exit(1);
    }
}
checkTable();
