const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'database',
  port: process.env.DB_PORT || 3306, 
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;