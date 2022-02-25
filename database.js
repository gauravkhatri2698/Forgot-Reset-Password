var mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

var connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});
connection.connect(function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Connected!:)');
  }
});
module.exports = connection; 