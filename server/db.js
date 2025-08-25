const mysql = require('mysql2');

// Using a connection pool is a best practice for handling transient connection errors
// and managing connections efficiently. The pool will automatically handle disconnections
// and re-connections.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'survey_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// The pool will emit an 'error' event for any fatal errors, but for transient errors
// like disconnection, it will attempt to reconnect automatically. We can still log these.
pool.on('error', (err) => {
  console.error('MySQL Pool Error:', err);
});

module.exports = pool;
