import mysql from 'mysql2/promise'; // Note: using promise variant here

const pool = mysql.createPool({
  host: 'db-mysql-nyc3-05415-do-user-14241718-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: '', 
  database: 'nyspecialcare',
  port: 25060,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

export default pool;


