const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const createPool = () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'email_confirmation',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('MySQL connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('Error creating MySQL connection pool:', error);
    throw error;
  }
};

const getConnection = async () => {
  try {
    if (!pool) {
      createPool();
    }
    
    const connection = await pool.getConnection();
    console.log('Database connection acquired from pool');
    return connection;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
};

const testConnection = async () => {
  try {
    const connection = await getConnection();
    await connection.execute('SELECT 1 as test');
    connection.release();
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
};

const closePool = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('MySQL connection pool closed');
    }
  } catch (error) {
    console.error('Error closing MySQL connection pool:', error);
  }
};

module.exports = {
  createPool,
  getConnection,
  testConnection,
  closePool,
  pool: () => pool
};