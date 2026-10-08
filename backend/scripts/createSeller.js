<<<<<<< HEAD
const bcrypt = require('bcryptjs');
const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

// Create seller user
const createSeller = async () => {
  try {
    // Connect to database first
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    const sellerEmail = 'sujalvadhaiya531@gmail.com';
    const sellerPassword = 'sujal123'; // Updated as requested
    const sellerFirstName = 'Sujal';
    const sellerLastName = 'Vadhaiya';

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id, role FROM users WHERE email = ?',
      [sellerEmail]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user to seller
      const hashedPassword = await bcrypt.hash(sellerPassword, 12);
      await executeQuery(
        `UPDATE users 
         SET password = ?, role = 'seller', is_email_verified = 1, is_active = 1 
         WHERE email = ?`,
        [hashedPassword, sellerEmail]
      );
      console.log(`✅ Seller user updated: ${sellerEmail}`);
    } else {
      // Create new seller user
      const hashedPassword = await bcrypt.hash(sellerPassword, 12);
      await executeQuery(
        `INSERT INTO users (
          first_name, last_name, email, password, role, 
          is_email_verified, is_active
        ) VALUES (?, ?, ?, ?, 'seller', 1, 1)`,
        [sellerFirstName, sellerLastName, sellerEmail, hashedPassword]
      );
      console.log(`✅ Seller user created: ${sellerEmail}`);
    }

    console.log('\n📝 Seller Login Credentials:');
    console.log(`   Email: ${sellerEmail}`);
    console.log(`   Password: ${sellerPassword}`);
    console.log('\n⚠️  Please change the password after first login!');
    
    // Close database connection
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating seller user:', error);
    await closeConnection();
    process.exit(1);
  }
};

createSeller();
=======
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { connectDB, executeQuery, closeConnection } = require('../config/database');

const createSeller = async () => {
  const {
    SELLER_EMAIL,
    SELLER_PASSWORD,
    SELLER_FIRST_NAME,
    SELLER_LAST_NAME,
  } = process.env;

  if (!SELLER_EMAIL || !SELLER_PASSWORD || !SELLER_FIRST_NAME || !SELLER_LAST_NAME) {
    throw new Error(
      'Set SELLER_EMAIL, SELLER_PASSWORD, SELLER_FIRST_NAME, and SELLER_LAST_NAME before creating a seller.'
    );
  }

  try {
    await connectDB();
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [SELLER_EMAIL]
    );
    const hashedPassword = await bcrypt.hash(
      SELLER_PASSWORD,
      Number(process.env.BCRYPT_ROUNDS) || 12
    );

    if (existingUser.rows.length > 0) {
      await executeQuery(
        `UPDATE users
         SET password = ?, role = 'seller', is_email_verified = 1, is_active = 1
         WHERE email = ?`,
        [hashedPassword, SELLER_EMAIL]
      );
      console.log(`Seller account updated: ${SELLER_EMAIL}`);
    } else {
      await executeQuery(
        `INSERT INTO users (
          first_name, last_name, email, password, role, is_email_verified, is_active
        ) VALUES (?, ?, ?, ?, 'seller', 1, 1)`,
        [SELLER_FIRST_NAME, SELLER_LAST_NAME, SELLER_EMAIL, hashedPassword]
      );
      console.log(`Seller account created: ${SELLER_EMAIL}`);
    }
  } finally {
    await closeConnection();
  }
};

createSeller().catch((error) => {
  console.error('Seller account setup failed:', error.message);
  process.exitCode = 1;
});
>>>>>>> ffdff2f (Prepare backend for Render deployment)
