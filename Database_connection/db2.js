const mysql2 = require('mysql2/promise');

const db2 = mysql2.createPool({
    connectionLimit : 100,
    user:"admin",
    host: "onepoket-production.cjqvltrpc5rg.ap-south-1.rds.amazonaws.com",
    password: "s9eWbfG9xA8W",
    database:"OnePoket",
});

module.exports = db2;