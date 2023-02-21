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
  ssl: {ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}
};

var conn = new mysql.createConnection(config);

// --------------------------------------------------------

/* GET users listing. */
router.get('/', function(req, res, next) {
  conn.connect(
    function (err) { 
    if (err) {
      res.send("!!! Cannot connect !!! Error:");
      throw err;
    } else {
      res.send("Connection established.");
      //queryDatabase();
    }
  });
});

module.exports = router;
