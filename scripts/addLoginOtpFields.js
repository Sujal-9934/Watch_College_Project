const { executeQuery } = require('../backend/config/database');

async function addLoginOtpFields() {
  try {
    console.log('🔄 Adding login OTP fields to users table...');

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

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
addLoginOtpFields();
