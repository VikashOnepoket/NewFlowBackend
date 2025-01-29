const mysql = require('mysql2');

require('dotenv').config;
console.log(process.env.PASSWORD);

// const db = mysql.createPool({
//   connectionLimit: 100,
//   user: 'admin',
//   host: 'onepoket-production.cjqvltrpc5rg.ap-south-1.rds.amazonaws.com',
//   password: 's9eWbfG9xA8W',
//   database: 'OnePoket',
// });
//  const db = mysql.createPool({
//    connectionLimit: 1000,
//    user: 'admin',
//    host: 'localhost',
//    password: 's9eWbfG9xA8W',
//    database: 'OnePoket',
//  });

const db = mysql.createPool({
 connectionLimit: 1000,
 user: 'root',
 host: 'localhost',
 password: '123456',
 database: 'OnePoket',
});
module.exports = db;
