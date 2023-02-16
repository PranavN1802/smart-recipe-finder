// import express into file
// require entire express module in variable express
const express = require('express');

// declare new express variable
// actually a function value so can invoke it w/ parantheses
// creates the application for us
const app = express();

// need to listen to requests so bind web server to a port
// preferably one not being used by many other processes
// uses a callback function
app.listen(3000, () => {
    console.log('Server is running on Port 3000');
});