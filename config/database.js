const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// MySQL connection pool yaradırıq
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.127.126.3',
  user: process.env.DB_USER || 'root',
  port: 3306,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'craftnet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise wrapper ilə pool'u export edirik
module.exports = pool.promise(); 