const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'db-mysql-nyc3-05415-do-user-14241718-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: '', 
  database: 'nyspecialcare',
  port: 25060,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  },
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000 
});

module.exports = pool.promise(); 

