// import mysql2
const mysql = require( 'mysql2' );

// module.exports will allow us to import this file w/ the database connection
// create connection and export it so can import it to wherever need to use it
module.exports = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    //password: '15ty34RtE@MpR0JeCt',
    password: 'testdbpassword',
    database: 'RecipeApp'
})