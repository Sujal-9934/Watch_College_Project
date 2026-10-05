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
