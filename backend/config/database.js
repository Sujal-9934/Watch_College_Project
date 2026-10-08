const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());
  if (missingEnv.length) {
    throw new Error(`Missing required production database environment variables: ${missingEnv.join(', ')}`);
  }
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || (isProduction ? undefined : 'localhost'),
  user: process.env.DB_USER || (isProduction ? undefined : 'root'),
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || (isProduction ? undefined : 'watch_store'),
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  idleTimeout: 600000, // 10 minutes
  connectTimeout: 60000 // 60 seconds
};

// Create connection pool
let pool;
let connectionPromise;

const connectDB = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);

    pool.on('connection', () => {
      console.log('🔌 New database connection established');
    });

    pool.on('error', (error) => {
      console.error('❌ Database pool error:', error.message);
    });
  }

  if (!connectionPromise) {
    connectionPromise = pool.getConnection()
      .then((connection) => {
        connection.release();
        console.log('✅ MySQL database connected successfully');
        return pool;
      })
      .catch(async (error) => {
        const failedPool = pool;
        pool = undefined;
        connectionPromise = undefined;
        try {
          await failedPool.end();
        } catch (closeError) {
          console.error('Database pool cleanup failed:', closeError.message);
        }
        console.error('❌ Database connection failed:', error.message);
        throw error;
      });
  }

  return connectionPromise;
};

// Get pool instance
const getPool = () => {
  if (!pool) {
    const error = new Error('Database is temporarily unavailable. Please try again.');
    error.statusCode = 503;
    throw error;
  }
  return pool;
};

// Execute query with connection from pool
const executeQuery = async (query, params = []) => {
  try {
    const pool = getPool();
    // pool.execute() automatically handles connection acquisition and release
    const [result, fields] = await pool.execute(query, params);

    // For INSERT queries, result contains insertId, affectedRows, etc.
    // For SELECT queries, result is an array of rows
    if (result.insertId !== undefined) {
      // This is an INSERT/UPDATE/DELETE result
      return { rows: result, fields, insertId: result.insertId };
    } else {
      // This is a SELECT result
      return { rows: result, fields };
    }
  } catch (error) {
    // Handle connection errors
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
      console.error('❌ Database connection lost, attempting to reconnect...');
      // Pool will automatically try to reconnect on next query
    }
    console.error('Query execution error:', error.message);
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
  if (!pool) {
    return false;
  }

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
      pool = undefined;
      connectionPromise = undefined;
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
