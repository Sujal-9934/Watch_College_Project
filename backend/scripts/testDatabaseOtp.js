const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

async function testDatabaseOtp() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('🧪 Testing OTP fields in database...\n');

    // Check if login_otp_token column exists
    const columns = await executeQuery(`
      SHOW COLUMNS FROM users LIKE 'login_otp_token'
    `);

    if (columns.rows.length === 0) {
      console.log('❌ login_otp_token column does not exist!');
      return;
    }

    console.log('✅ login_otp_token column exists');

    // Check if login_otp_expires column exists
    const columns2 = await executeQuery(`
      SHOW COLUMNS FROM users LIKE 'login_otp_expires'
    `);

    if (columns2.rows.length === 0) {
      console.log('❌ login_otp_expires column does not exist!');
      return;
    }

    console.log('✅ login_otp_expires column exists');

    // Check if test user exists
    const userCheck = await executeQuery(`
      SELECT id, email, login_otp_token, login_otp_expires
      FROM users
      WHERE email = 'user@example.com'
    `);

    if (userCheck.rows.length === 0) {
      console.log('⚠️ Test user does not exist. Creating one...');

      // Create test user
      await executeQuery(`
        INSERT INTO users (
          first_name, last_name, email, password, role, is_email_verified, is_active
        ) VALUES (
          'Test', 'User', 'user@example.com',
          '$2b$12$tA8WM4kellHj0os928LKguzRH4/69.8Lpdhi4kvBTb3z.AEc3Go96',
          'user', 1, 1
        )
      `);

      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user exists');
      const user = userCheck.rows[0];
      console.log('📋 Current OTP data:', {
        id: user.id,
        email: user.email,
        login_otp_token: user.login_otp_token,
        login_otp_expires: user.login_otp_expires
      });
    }

    console.log('\n🎉 Database setup looks good!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await closeConnection();
  }
}

// Run the test
testDatabaseOtp();
