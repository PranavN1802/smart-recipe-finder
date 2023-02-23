// use http://postman.com to make http requests and other requests
// https://www.youtube.com/watch?v=7iQLkJ3rEQo

// import express into file
// require entire express module in variable express
const express = require('express');

// needed to parse post payload
let bodyParser = require('body-parser');

// declare new express variable
// actually a function value so can invoke it w/ parantheses
// creates the application for us
const app = express();

// import mysql connection
const db = require('./database');
const { request } = require('express');
// const { json } = require('express');

// before every request reaches the callback function, this middleware will detect form data 
// will detect json payloads, parse them correctly and then attach it to recta body
// to be able to send raw data, need to be apply the json middleware
app.use(express.json());

// whenever dealing w/ html forms and sending data from html form to backend
// on server side, need to enable the url encoding middleware
app.use(express.urlencoded({ extended: false }));

// to parse post payload
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// create array of dummy data (stand in for db)
// const users = [
//     {name: 'Luie', age: 18},
//     {name: 'Theo', age: 19},
//     {name: 'Jay', age: 20}
// ]

// const posts = [
//     {title: 'My favourite foods'},
//     {title: 'My favourite games'}
// ]


// ADD ACCOUNT DETAILS TO DATABASE
// allows web server to handle post requests
// can specify endpoint to send the post request to
// no conflict btw using the same endpoint for a post and get - dif. methods for same endpoint
app.post('/createUser', (req, res) => {
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


// CREATE NEW RECIPE
// issues: how to find userID (account details stored at log in?); find pks another way?; how will data be received from html form? 
// Currently, if the same ingredient is typed slightly differently, it will be counted as a separate thing - might not be able to fix this before project over
// ingredients should be in singular - thinging format of ingredient: quantity to ensure that makes sense
app.post('/createRecipe', async (req, res) => {

    console.log(req.body);

    // Find email, username and password from queries - won't be needed once userID is saved from log in
    let email = req.query.email;
    let username = req.query.username;
    let password = req.query.password;
    let { name, recRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, ingredients, quantities, steps, summary } = req.body;

    try {

        // Find userID - would be saved from log in in real version

        // userID array extracted from db
        const user = await db.promise().query(`SELECT userID FROM USERS WHERE email='${email}' AND username='${username}' AND password='${password}'`);
        console.log(user);

        // extract integer for userID from userID array
        const userID = user[0].map( elm => elm.userID )[0];
        console.log(userID);

        // Ensure a value is present in request body for every variable
        if ( name, recRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, ingredients, quantities, steps, summary ) {
            
            // Add ingredients
            for (let i=0; i<ingredients.length; i++) {

                // Find current ingredient
                var ingredient = ingredients[i];
                console.log(ingredient);

                // Find ingID for current ingredient (empty array if ingredient not present in db)
                ingredientFound = await db.promise().query(`SELECT ingID FROM INGREDIENTS WHERE name='${ingredient}'`);
                console.log(ingredientFound[0]);

                // Check if ingredient is already present in db
                if (ingredientFound[0].length===0) {

                    // If not in db, add current ingredient to db
                    db.promise().query(`INSERT INTO INGREDIENTS (name) VALUES ('${ingredients[i]}')`);
                    console.log('Added ingredient');
                }
                else {
                    console.log('Ingredient found in db');
                }
            }

            // Add quantities
            for (let q=0; q<quantities.length; q++) {

                // Find current quantity
                var quantity = quantities[q];
                console.log(quantity);

                // Find quantityID for current quantity (emtpy array if quantity not present in db)
                quantityFound = await db.promise().query(`SELECT quantityID FROM QUANTITIES WHERE name='${quantity}'`);

                // Check if quantity is already present in db
                if (quantityFound[0].length===0) {

                    // If not in db, add current quantity to db
                    db.promise().query(`INSERT INTO QUANTITIES (name) VALUES ('${quantity}')`);
                    console.log('Added quantity');
                }
                else {
                    console.log('Quantity found in db');
                }
            }

            // Add recipe details

            // Convert booleans values to 1 and 0 for storage in mysql db
            if (vegetarian===true) vegetarian=1;
            else vegetarian=0;

            if (vegan===true) vegan=1;
            else vegan=0;

            if (kosher===true) kosher=1;
            else kosher=0;

            if (halal===true) halal=1;
            else halal=0;
            
            // Find recID for recipe (empty array if recipe not present in db)
            recipeFound = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${name}' AND userID='${userID}'`);
            console.log(recipeFound);

            // Check if recipe is already in db - prevents users from creating two recipes of the same name
            if (recipeFound[0].length===0) {

                // Add the recipe details to the recipes table
                db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary) VALUES ('${userID}', '${name}', '<a href=${recRef}>${name} reference</a>', '', '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}')`);
                console.log('Added recipe details');

                // Add to recipe_ingredient_quantity

                // Find recID

                // Extract recID array
                let recipeDetail = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${name}' AND userID='${userID}'`);
                console.log(recipeDetail);

                // Extract recID integer from recID array
                let recID = recipeDetail[0].map( elm => elm.recID )[0];
                console.log(recID);
                
                // Check each ingredient in the ingredients array has a corresponding quantity in the quantities array
                if (ingredients.length==quantities.length) {

                    // Iterate through both arrays
                    for (let j=0; j<ingredients.length; j++) {

                        // Extract ingID array for current ingredient
                        let ingredientDetail = await db.promise().query(`SELECT ingID FROM INGREDIENTS WHERE name='${ingredients[j]}'`);
                        console.log(ingredientDetail);

                        // Extract ingID integer for current ingredient
                        let ingID = ingredientDetail[0].map( elm => elm.ingID )[0];
                        console.log(ingID);

                        // Extract quantityID array for current quantity
                        let quantityDetail = await db.promise().query(`SELECT quantityID FROM QUANTITIES WHERE name='${quantities[j]}'`);
                        console.log(quantityDetail);

                        // Extract quantityID array for current quantity
                        let quantityID = quantityDetail[0].map( elm => elm.quantityID )[0];
                        console.log(quantityID);                    
                        
                        // Use recID, ingID and quantityID to create a new record in recipe_ingredient_quantity
                        db.promise().query(`INSERT INTO RECIPE_INGREDIENT_QUANTITY (recID, ingID, quantityID) VALUES ('${recID}', '${ingID}', '${quantityID}')`);
                        console.log('Added recipe_ingredient_quantity');
                    }
                }
                else {
                    console.log('Different number of ingredients and quantities');
                }
            }
            else {
                console.log('Recipe found in db');
            }
            res.status(201).send({msg: 'Recipe Created!'});
        }
        else {
            console.log("Value not present")
        }
    }
    catch (err) {
        console.log(err);
    }
});


// CREATE SCRAMBLED RECIPE

// FETCH RECIPE SUMMARIES FROM FILTERS

// FETCH RECIPE SUMARIES FROM ACCOUNT
app.get('/:account', async (req, res) => {

    // Find email, username and password from queries - won't be needed once userID is saved from log in
    let email = req.query.email;
    let username = req.query.username;
    let password = req.query.password;

    try {

        // Find userID - would be saved from log in in real version

        // userID array extracted from db
        let userID = await db.promise().query(`SELECT userID FROM USERS WHERE email='${email}' AND username='${username}' AND password='${password}'`);
        console.log(userID);

        // extract integer for userID from userID array
        userID = userID[0].map( elm => elm.userID )[0];
        console.log(userID);

        // Find all recipe details with userID - included recID - wouldn't be displayed but can be used to fetch complete recipe details
        let recipes = await db.promise().query(`SELECT recID, name, vegetarian, vegan, kosher, halal, serving, time, difficulty, summary FROM RECIPES WHERE userID='${userID}'`);
        
        // Extract recipe details as an array - each recipe record is a separate array item - each recipe value can be separately extracted as with userID
        recipes=recipes[0];
        console.log(recipes);
        res.status(200).send(recipes);
    }
    catch (err) {
        console.log(err);
    }
});

// FETCH COMPLETE RECIPE DETAILS FROM RECID
app.get('/recipes/:recipe', async (req, res) => {

    // Use recipe name passed as param to find recID for purposes of development
    // In reality, would use recID from summary data - name too imprecise
    let recipe = req.params.recipe;
    console.log(recipe);

    try {

        // Find recID - would be saved from summary data in real version

        // recID array extracted from db
        let recID = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${recipe}'`);
        console.log(recID);

        // extract integer for recID from recID array
        recID = recID[0].map( elm => elm.recID )[0];
        console.log(recID);

        // Find complete recipe details with recID
        let recipeDetails = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
        
        // Extract recipe details as an array - each recipe value can be separately extracted as with userID
        recipeDetails=recipeDetails[0];
        console.log(recipeDetails);
        res.status(200).send(recipeDetails)
    }
    catch (err) {
        console.log(err);
    }
});

// FETCH ACCOUNT DETAILS FROM DATABASE
// app.get('/:account', async (req, res) => {
//     const { account } = req.params;
//     const accountDetails = await db.promise().query(`SELECT * FROM USERS WHERE username='${account}'`);
//     console.log(accountDetails[0]);
//     res.status(200).send(accountDetails[0]);
// });

// Find userID FROM DATABASE
app.get('/:logIn', async (req, res) => {
    let email=req.query.email;
    let username=req.query.username;
    let password=req.query.password;
    const user = await db.promise().query(`SELECT userID FROM USERS WHERE email='${email}' AND username='${username}' AND password='${password}'`);
    const userID = user[0].map( elm => elm.userID )[0];
    console.log(userID);
    res.status(200).send(`'${userID}'`);
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
// app.get('/', (req, res) => {
//     // res.send(200); // sends back a 200 response (successful)
//     res.send({
//         msg: "Hello!", // return JSON
//         user: {} // send a user acount or object (e.g.)
//     });
// });

// routing allows you to visit different locations in app.
// on server side, each route can represent dif. resources
// handle a route for users e.g. make a get request to the /users route
// /users is the route path
// first call app.get (the route method)
// callback function is the request handler function
// could practice to send a status code
// app.get('/users', (req, res) => {
//     res.status(200).send(users);
// });

// fetch dif. data depending on username entered
// app.get('/users/:name', (req, res) => {
//     console.log(req.params);

//     // find the record in users where name==param and save in user array
//     const { name } = req.params;
//     const user = users.find((user) => user.name === name);

//     if (user) res.status(200).send(user);
//     else res.status(404).send("Not Found");
// });

// first param is endpoint name
// second is the handler function
// app.get('/posts', (req, res) => {
//     console.log(req.query);
//     const { title } = req.query;
//     if (title) {
//         const post = posts.find((post) => post.title === title);
//         if (post) res.status(200).send(post);
//         else res.status(404).send('Not Found');
//     }
//     else res.status(200).send(posts);
// });

// need to listen to requests so bind web server to a port (communication endpoints - numeric val.s)
// preferably one not being used by many other processes
// uses a callback function - optional
// passes in an error (arrow?) function
app.listen(3000, () => {
    console.log('Server is running on Port 3000');
});