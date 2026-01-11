const bcrypt = require('bcryptjs');
const { connectDB, executeQuery, closeConnection } = require('../config/database');
require('dotenv').config();

// Create admin user
const createAdmin = async () => {
  try {
    // Connect to database first
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@watchstore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminFirstName = 'Admin';
    const adminLastName = 'User';

    // Check if admin already exists
    const existingUser = await executeQuery(
      'SELECT id, role FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await executeQuery(
        `UPDATE users 
         SET password = ?, role = 'admin', is_email_verified = 1, is_active = 1 
         WHERE email = ?`,
        [hashedPassword, adminEmail]
      );
      console.log(`✅ Admin user updated: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await executeQuery(
        `INSERT INTO users (
          first_name, last_name, email, password, role, 
          is_email_verified, is_active
        ) VALUES (?, ?, ?, ?, 'admin', 1, 1)`,
        [adminFirstName, adminLastName, adminEmail, hashedPassword]
      );
      console.log(`✅ Admin user created: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }

    console.log('\n📝 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the password after first login!');
    
    // Close database connection
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await closeConnection();
    process.exit(1);
  }
};

createAdmin();

