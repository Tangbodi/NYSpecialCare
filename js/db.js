const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'db-mysql-nyc3-05415-do-user-14241718-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: '',
  database: 'nyspecialcare',
  port: 25060,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Test the connection
promisePool.getConnection()
  .then((connection) => {
    console.log('Database connected successfully!');
    connection.release();
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

module.exports = promisePool;




