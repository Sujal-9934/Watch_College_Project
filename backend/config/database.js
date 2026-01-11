const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'watch_store',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  reconnect: true,
  idleTimeout: 600000, // 10 minutes
  timeout: 60000 // 60 seconds
};

// Create connection pool
let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      
      // Handle pool errors
      pool.on('connection', (connection) => {
        console.log('🔌 New database connection established');
      });

      pool.on('error', (err) => {
        console.error('❌ Database pool error:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('🔄 Attempting to reconnect to database...');
          // Pool will automatically try to reconnect
        } else {
          throw err;
        }
      });
    }

    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');

    // Release the connection back to the pool
    connection.release();

    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);

    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('🔄 Retrying database connection...');
      connectDB();
    }, 5000);

    throw error;
  }
};

// Get pool instance
const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

// Execute query with connection from pool
const executeQuery = async (query, params = []) => {
  try {
    const pool = getPool();
    // pool.execute() automatically handles connection acquisition and release
    const [rows, fields] = await pool.execute(query, params);
    return { rows, fields };
  } catch (error) {
    // Handle connection errors
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
      console.error('❌ Database connection lost, attempting to reconnect...');
      // Pool will automatically try to reconnect on next query
    }
    console.error('Query execution error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Query:', query);
      console.error('Params:', params);
    }
    throw error;
  }
};

// Execute transaction
const executeTransaction = async (queries) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const results = [];

    for (const { query, params = [] } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await executeQuery('SELECT 1 as test');
    return result.rows[0].test === 1;
  } catch (error) {
    console.error('Database test failed:', error.message);
    return false;
  }
};

// Graceful shutdown
const closeConnection = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

module.exports = {
  connectDB,
  getPool,
  executeQuery,
  executeTransaction,
  testConnection,
  closeConnection
};
