const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

async function addLoginOtpFields() {
  try {
    // Connect to database first
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('🔄 Adding login OTP fields to users table...');

    // Check if columns already exist
    const checkColumns = await executeQuery(`
      SHOW COLUMNS FROM users LIKE 'login_otp_token'
    `);

    if (checkColumns.rows.length > 0) {
      console.log('⚠️  Login OTP fields already exist. Skipping migration.');
      await closeConnection();
      process.exit(0);
    }

    // Add login_otp_token column
    await executeQuery(`
      ALTER TABLE users
      ADD COLUMN login_otp_token VARCHAR(255) NULL AFTER email_verification_expires
    `);

    console.log('✅ Added login_otp_token column');

    // Add login_otp_expires column
    await executeQuery(`
      ALTER TABLE users
      ADD COLUMN login_otp_expires DATETIME NULL AFTER login_otp_token
    `);

    console.log('✅ Added login_otp_expires column');

    // Add index for performance
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_users_login_otp_expires ON users(login_otp_expires)
    `);

    console.log('✅ Added index for login_otp_expires');
    console.log('🎉 Migration completed successfully!');

    // Close database connection
    await closeConnection();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await closeConnection();
    process.exit(1);
  }
}

// Run the migration
addLoginOtpFields();
