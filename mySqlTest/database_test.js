// use http://postman.com to make http requests and other requests

// import express into file
// require entire express module in variable express
const express = require('express');

// declare new express variable
// actually a function value so can invoke it w/ parantheses
// creates the application for us
const app = express();

// import mysql connection
const db = require('./database');

// before every request reaches the callback function, this middleware will detect form data 
// will detect json payloads, parse them correctly and then attach it to recta body
// to be able to send raw data, need to be apply the json middleware
app.use(express.json());

// whenever dealing w/ html forms and sending data from html form to backend
// on server side, need to enable the url encoding middleware
app.use(express.urlencoded({ extended: false }));

// create array of dummy data (stand in for db)
const users = [
    {name: 'Luie', age: 18},
    {name: 'Theo', age: 18},
    {name: 'Jay', age: 20}
]

const posts = [
    {title: 'My favourite foods'},
    {title: 'My favourite games'}
]


// ADD ACCOUNT DETAILS TO DATABASE
// allows web server to handle post requests
// can specify endpoint to send the post request to
// no conflict btw using the same endpoint for a post and get - dif. methods for same endpoint
app.post('/', (req, res) => {
    // console.log(req.body);
    // res.status(201).send('Created user');
    const { _email, _username, _password } = req.body;
    if (_email && _username && _password) {
        try {
            db.promise().query(`INSERT INTO USERS (email, username, password) VALUES ('${_email}','${_username}', '${_password}')`);
            res.status(201).send({msg: 'Created user'});
            console.log(req.body);
        }
        catch (err) {
            console.log(err);
        }
    }
});


// FETCH ACCOUNT DETAILS FROM DATABASE
app.get('/:account', async (req, res) => {
    const { account } = req.params;
    const accountDetails = await db.promise().query(`SELECT * FROM USERS WHERE username='${account}'`);
    console.log(accountDetails[0]);
    res.status(200).send(accountDetails[0]);
});


// when run, can't do anything else until finished - app. blocks entire shell so it's running and ready to handle requests
// need to interact w/ and access app. - type localhost:3000 in browser - cannot get - no endpoints or routes handled yet
// handling a simple route
// app.get registers a route method
// a get request is being made (get requests retrieve resources)
// endpoint or route want to request resources at is '/' so every request that maps to this route (main route) is going to be handled by this callback function
// callback function is invoked and has two parameters - request object and response object
// response object has method called send whcih can be used to send a body back to the client e.g. string or signal
// run in terminal - Invoke-RestMethod http://localhost:3000
app.get('/', (req, res) => {
    // res.send(200); // sends back a 200 response (successful)
    res.send({
        msg: "Hello!", // return JSON
        user: {} // send a user acount or object (e.g.)
    });
});

// routing allows you to visit different locations in app.
// on server side, each route can represent dif. resources
// handle a route for users e.g. make a get request to the /users route
// /users is the route path
// first call app.get (the route method)
// callback function is the request handler function
// could practice to send a status code
app.get('/users', (req, res) => {
    res.status(200).send(users);
});

// fetch dif. data depending on username entered
app.get('/users/:name', (req, res) => {
    console.log(req.params);

    // find the record in users where name==param and save in user array
    const { name } = req.params;
    const user = users.find((user) => user.name === name);

    if (user) res.status(200).send(user);
    else res.status(404).send("Not Found");
});

// first param is endpoint name
// second is the handler function
app.get('/posts', (req, res) => {
    console.log(req.query);
    const { title } = req.query;
    if (title) {
        const post = posts.find((post) => post.title === title);
        if (post) res.status(200).send(post);
        else res.status(404).send('Not Found');
    }
    else res.status(200).send(posts);
});

// need to listen to requests so bind web server to a port (communication endpoints - numeric val.s)
// preferably one not being used by many other processes
// uses a callback function - optional
// passes in an error (arrow?) function
app.listen(3000, () => {
    console.log('Server is running on Port 3000');
});

