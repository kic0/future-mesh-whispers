const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const connection = mysql.createConnection(dbConfig);

const sqlScript = fs.readFileSync(path.join(__dirname, 'database.sql')).toString();

connection.query(sqlScript, (err, results) => {
  if (err) {
    console.error('Error executing SQL script:', err);
    return;
  }
  console.log('Database setup complete.');
  connection.end();
});
