const bcrypt = require('bcryptjs');
const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

const verify = async () => {
    await connectDB();
    const email = 'sujalvadhaiya531@gmail.com';
    const password = 'sujal123';
    
    const res = await executeQuery('SELECT password FROM users WHERE email = ?', [email]);
    if (res.rows.length === 0) {
        console.log('User not found');
        await closeConnection();
        return;
    }
    
    const hash = res.rows[0].password;
    console.log('Stored Hash:', hash);
    
    const match = await bcrypt.compare(password, hash);
    console.log('Password Match:', match);
    
    await closeConnection();
}

verify();
