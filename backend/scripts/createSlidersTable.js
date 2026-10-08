const { executeQuery, connectDB } = require('../config/database');
const fs = require('fs');
const path = require('path');

const createSlidersTable = async () => {
  try {
    // Connect to database first
    await connectDB();
    console.log('🚀 Creating sliders table...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'createSlidersTable.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL commands by semicolon and filter out empty ones
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    // Execute each command
    for (const command of sqlCommands) {
      if (command.trim()) {
        console.log(`Executing: ${command.substring(0, 50)}...`);
        await executeQuery(command);
      }
    }

    console.log('✅ Sliders table created successfully!');
    console.log('📊 Default sliders inserted!');

  } catch (error) {
    console.error('❌ Error creating sliders table:', error.message);
    process.exit(1);
  }
};

// Run the migration
createSlidersTable().then(() => {
  console.log('🎉 Migration completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
