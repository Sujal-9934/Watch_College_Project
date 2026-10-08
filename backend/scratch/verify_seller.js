<<<<<<< HEAD
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
=======
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { connectDB, executeQuery, closeConnection } = require('../config/database');

const verify = async () => {
  const { VERIFY_EMAIL, VERIFY_PASSWORD } = process.env;
  if (!VERIFY_EMAIL || !VERIFY_PASSWORD) {
    throw new Error('Set VERIFY_EMAIL and VERIFY_PASSWORD before running this check.');
  }

  try {
    await connectDB();
    const result = await executeQuery(
      'SELECT password FROM users WHERE email = ?',
      [VERIFY_EMAIL]
    );

    if (result.rows.length === 0) {
      console.log('User not found.');
      return;
    }

    const matches = await bcrypt.compare(VERIFY_PASSWORD, result.rows[0].password);
    console.log(`Password match: ${matches}`);
  } finally {
    await closeConnection();
  }
};

verify().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
>>>>>>> ffdff2f (Prepare backend for Render deployment)
