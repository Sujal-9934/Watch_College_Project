const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

const showUsers = async () => {
    try {
        await connectDB();
        const res = await executeQuery('SELECT id, first_name, email, role FROM users');
        console.table(res.rows);
        await closeConnection();
        process.exit(0);
    } catch (e) {
        console.error(e);
        await closeConnection();
        process.exit(1);
    }
}
showUsers();
