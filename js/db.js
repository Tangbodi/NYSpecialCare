const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'db-mysql-nyc3-05415-do-user-14241718-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: '',
  database: 'nyspecialcare',
  port: 25060,
  ssl: {
    rejectUnauthorized: false
}
});

connection.connect(err => {
  if (err) {
    console.error('Connection error:', err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});

module.exports = connection;
