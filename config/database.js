const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'craftnet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Promise wrapper ilə pool'u export edirik
module.exports = pool.promise(); 