require('dotenv').config();
const pg = require('pg');

const db_config = {
  host: process.env.DB_URI,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

console.log(db_config);
const pool = new pg.Pool(db_config);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

module.exports = pool;