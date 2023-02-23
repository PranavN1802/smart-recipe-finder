var express = require('express');
var router = express.Router();


// SQL Stuff ---------------------------------------------
const mysql = require('mysql');
const fs = require('fs');

var config =
{
  host: 'myfirstexpressappserver.database.windows.net',
  user: 'adminuser',
  password: 'Z6rocks!',
  database: 'TestMySQL',
  port: 3306,
  connectTimeout: 10000,
  ssl: {ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}
};

var conn = new mysql.createConnection(config);

// --------------------------------------------------------

conn.connect(function (err) {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  conn.query('SELECT * FROM inventory', function (err, rows, fields) {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query ' + err);
    } else {
      res.send(rows);
    }
  });
});

/*
conn.query('CREATE TABLE inventory (id serial PRIMARY KEY, name VARCHAR(50), quantity INTEGER);', 
  function (err, results, fields) {
    if (err) throw err;
    console.log('Created inventory table.');
    }
)
*/

module.exports = router;
