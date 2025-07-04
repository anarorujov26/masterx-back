const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Anar29092006',
  database: process.env.DB_NAME || 'craftnet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
