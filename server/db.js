const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'survey_db'
});

// The connection is automatically established when the first query is made.
// No need for an explicit connection.connect() call, which can crash the server
// on a bad configuration. The error will be caught by the query callback instead.

module.exports = connection;
