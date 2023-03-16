// use http://postman.com to make http requests and other requests
// https://www.youtube.com/watch?v=7iQLkJ3rEQo

// import express into file
// require entire express module in variable express
const express = require('express');

// SESSIONS CREATION/TESTING
// install and require cookie-parser (can be removed once express-session imported) - express-session parses cookies
// const cookieParser = require('cookie-parser');

// install and require express-session to handle generating session ids and signing session ids with cookies
const session = require('express-session');

const passport = require('passport');
const local = require('./strategies/local');

const authRoute = require('./auth');

// use a store for sessions
const store = new session.MemoryStore();

// NOT SESSIONS WORK
// needed to parse post payload
let bodyParser = require('body-parser');

// declare new express variable
// actually a function value so can invoke it w/ parantheses
// creates the application for us
const app = express();

// import mysql connection
const db = require('./database');

// const { request } = require('express');
// const { json } = require('express');


// SESSIONS CREATION/TESTING
// app.use(cookieParser());

// register session middleware
// pass in object
// takes in secret (used to sign the session id cookie)
// and cookie property
app.use(session({
    secret: 'some secret',
    cookie: { maxAge: 30000 }, // max age 30 seconds
    saveUninitialized: false, // necessary for log in system, otherwise a new session id will be generated every time a request is made to server
    store // set up a new store
}));


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


// SESSIONS CREATION/TESTING
app.use((req, res, next) => {
    console.log(store); // print out store every time a request is made
    console.log(`'${req.method}'-'${req.url}'`);
    next();
});

// SESSION CREATION/TESTING
app.use(passport.initialize());
app.use(passport.session());

// SESSION CREATION/TESTING
app.use('/auth', authRoute);


// PREVIOUS TESTING
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


// SESSIONS CREATION/TESTING

// Every time user makes a request, want to validate cookie and make sure the cookie actually exists
// next is a function to be invoked
function validateCookie(req, res, next) {
    // get the cookie
    const{cookies} = req;
    console.log(cookies);
    if ( 'session_id' in cookies ) {
        // i.e. client sent a cookie to the server
        console.log( 'session id exists' );
        // need to ensure cookie is actually valid otherwise vulnerability e.g. to act as other accounts
        if ( cookies.session_id === '123456') next();
        else res.status(403).send({msg: "Not authenticated"});
    }   
    else res.status(403).send({msg: "Not authenticated"});
}

// Creates a cookie which lives on the client side
// mount validate middleware function to sign in route
// sign in route should be a post request
app.get('/signin', (req, res) => {
    res.cookie('session_id', '123456');
    res.status(200).json({msg: 'Logged In.'})
});


// Visit 'protected' route
app.get('/protected', validateCookie, (req, res) => {
    res.status(200).json({msg: 'You are authorised'});
});

app.post('/loginTest', (req, res) => {
    console.log(req.sessionID)
    const { username, password } = req.body;
    if (username && password) {
        if (req.session.authenticated) {
            res.json(req.session);
        } else {
            if (password == '123')  {
                req.session.authenticated = true;
                req.session.user = {
                    username, password
                };
                res.json(req.session);
            } else {
                res.status(403).json({msg: 'Bad Credentials'});
            }
        }
    } else res.status(403).json({msg: 'Bad Credentials'});
});


// whenever log in, send back cookie
// cookie = unique id that server generates
// generate unique session id to be saved on server - shouldn't be easy to guess or cookies could just be sent to server as if logging in
// every time a request is made to the app., check session id is valid
// cookie sent back, stored on client, can be sent back to server to access protected routes

// sessions allow maintenace of the state of http requests 
// sessions live on server
// cookies live on client side

// main use of sessions: don't want to save any sensitive data like passwords as a cookie on the client
// should be saved on db so session knows which user is making request
// so sessions are more secure because they are stored on the server rather than having everything stored on client



// ADD ACCOUNT DETAILS TO DATABASE
// allows web server to handle post requests
// can specify endpoint to send the post request to
// no conflict btw using the same endpoint for a post and get - dif. methods for same endpoint
app.post('/createUser', async (req, res) => {
    const { email, username, password } = req.body;

    // For password recovery
    // const { email, username, password, question, answer } = req.body;

    if (email && username && password) {
        try {

            // Extract all usernames and email already in the dbss
            let details = await db.promise().query(`SELECT email, username FROM USERS`);
            let usernames = details[0].map( elm => elm.username );
            let emails = details[0].map( elm => elm.email );

            // Check email and username are unique
            if (email in emails) {
                res.send({msg: "Email taken"});
                console.log("Email taken");
            }
            else if (username in usernames) {
                res.send({msg: "Username taken"});
                console.log("Username taken");
            }
            else {
                // Only create user if the email and username are unique
                db.promise().query(`INSERT INTO USERS (email, username, password) VALUES ('${email}','${username}', '${password}')`);
                
                // // For password recovery
                // db.promise().query(`INSERT INTO USERS (email, username, password, question, answer) VALUES ('${email}','${username}', '${password}', ${question}, '${answer}')`);

                res.status(201).send({msg: 'Created user'});
                console.log(req.body);
            }
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
app.post('/:userID/createRecipe', async (req, res) => {

    console.log(req.body);

    // Find email, username and password from queries - won't be needed once userID is saved from log in
    let userID = req.params.userID;
    let { name, recRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, ingredients, quantities, steps, summary } = req.body;
    // name = name.charAt(0).toUpperCase()+name.slice(1);

    try {

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
                db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary) VALUES ('${userID}', '${name}', '<a href=${recRef}>${name} reference</a>', NULL, '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}')`);
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

// EDIT RECIPE
app.post('/:userID/:recID/edit', async (req, res) => {
    console.log(req.body);

    // Find userID and recID from queries - won't be needed once userID is saved from log in
    let userID = req.params.userID;
    let recID = req.params.recID;

    // Can't change scrambledRef
    let { name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, ingredients, quantities, steps, summary } = req.body;

    try {

        // Add any new ingredients which aren't in db to db
        if ( name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, ingredients, quantities, steps, summary ) {
            
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

            // Add any new quantities which aren't in db to db
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

            // Edit recipe details

            // Convert booleans values to 1 and 0 for storage in mysql db
            if (vegetarian===true) vegetarian=1;
            else vegetarian=0;

            if (vegan===true) vegan=1;
            else vegan=0;

            if (kosher===true) kosher=1;
            else kosher=0;

            if (halal===true) halal=1;
            else halal=0;

            // Find recID for recipe with same name and userID but different recID (empty array if recipe not present in db)
            recipeFound = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${name}' AND userID='${userID}' AND recID NOT IN (${recID})`);
            console.log(recipeFound);

            // Check if recipe is already in db - prevents users from creating two recipes of the same name
            if (recipeFound[0].length===0) {

                // Update the recipe record in the db
                // TODO: FRONT END NEEDS TO REQUIRE SOMETHING IN EVERY FIELD IN RECIPE CREATION (NOT SCRAMBLED REF FOR ORIGINAL CREATION?)
                db.promise().query(`UPDATE RECIPES SET name='${name}', recRef='${recRef}', vegetarian='${vegetarian}', vegan='${vegan}', kosher='${kosher}', halal='${halal}', serving='${serving}', time='${time}', difficulty='${difficulty}', steps='${steps}', summary='${summary}' WHERE recID=${recID}`);

                // Update records in recipe_ingredient_quantity
                
                // Check each ingredient in the ingredients array has a corresponding quantity in the quantities array
                if (ingredients.length==quantities.length) {

                    // Delete all records with that recID from recipe_ingredient_quantity
                    db.promise().query(`DELETE FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID}`);
                    
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
            res.status(201).send({msg: 'Recipe Edited!'});
        }
        else {
            console.log("Value not present")
        }
    }
    catch (err) {
        console.log(err);
    }
});

// CHANGE REPORTS
app.post("/:userID/recipes/:recID/report", async (req,res) => {

    let recID = req.params.recID; // Would come from complete recipe details

    try{
        // Find current reports value for the recipe
        let reports = await db.promise().query(`SELECT reports FROM RECIPES WHERE recID=${recID}`);
        
        // Extract reports value form array
        reports = reports[0].map( elm => elm.reports )[0];

        // Increment the number of reports by 1
        db.promise().query(`UPDATE RECIPES SET reports=${reports} + 1 WHERE recID= ${recID}`);
        console.log('reported');
        res.status(200).send({msg: "reported"});
    }
    catch (err){
        console.log(err);
    }
});

// FETCH REPORTED RECIPES
app.get("/reportedRecipes", async (req, res) => {
    // Select recIDs of recipes with more than 0 reports, ordered in descending order by the number of reports
    let recIDs = await db.promise().query(`SELECT recID FROM RECIPES WHERE reports>0 ORDER BY reports DESC`);
    recIDs = recIDs[0].map( elm => elm.recID );
    res.status(200).send(recIDs);
    console.log(recIDs);
});

// CHANGE UPVOTES
// app.post("/:userID/recipes/:recID/upvote", async (req,res) => {

//     let recID = req.params.recID; // Would come from complete recipe details

//     try{
//         // Find current upvotes value for the recipe
//         let upvotes = await db.promise().query(`SELECT upvotes FROM RECIPES WHERE recID=${recID}`);
        
//         // Extract upvotes value form array
//         upvotes = upvotes[0].map( elm => elm.upvotes )[0];

//         // Increment the number of upvotes by 1
//         db.promise().query(`UPDATE RECIPES SET upvotes=${upvotes} + 1 WHERE recID= ${recID}`);
//         console.log('upvoted');
//         res.status(200).send({msg: "upvoted"});
//     }
//     catch (err){
//         console.log(err);
//     }
// });

// CHANGE ACCOUNT DETAILS

// CHANGE USERNAME DETAILS
app.post('/:userID/changeUsername', async (req,res) => {
    let userID = req.params.userID;
    let {username} = req.body;

    try{
        // Find all the usernames in use
        let usernames = await db.promise().query(`SELECT username FROM USERS`);
        usernames = usernames[0].map( elm => elm.username);

        // Check the new username isn't already in use
        if (username in usernames) {
            res.send({msg: "Username taken"});
        }
        else {
            // Change the username
            db.promise().query(`UPDATE USERS SET username='${username}' WHERE userID= ${userID}`);
            console.log('username changed');
            res.status(200).send({msg: "username changed"});
        }
    }
    catch(err){
        console.log(err);
    }
});

// CHANGE PASSWORD DETAILS
app.post('/:userID/changePassword', async (req,res) => {
    let userID = req.params.userID;
    let {email, password, newPassword} = req.body;

    try{

        // Find the email and password for this user
        let details = await db.promise().query(`SELECT email, password FROM USERS WHERE userID=${userID}`);
        let userEmail = details[0].map(elm => elm.email)[0];
        let userPassword= details[0].map(elm => elm.password)[0];

        // If the email and password entered are correct, change the password
        if (email == userEmail && password == userPassword){
            db.promise().query(`UPDATE USERS SET password='${newPassword}' WHERE userID=${userID}`);
            console.log('password changed');
            res.status(200).send({msg: "password changed"});
        }
        else{
            res.send({msg: 'Incorrect password or email'});
        }

    }
    catch(err){
        console.log(err);
    }


});

// // ASK SECURITY QUESTION
// app.get('/forgotPassword', async (req, res) => {
//     let email = req.query.email;

//     try {

//         let emails = await db.promise().query(`SELECT email FROM USERS`);
//         emails = emails[0].map( elm => elm.email );

//         if (email in emails) {
//             let question = await db.promise().query(`SELECT question FROM USERS WHERE email='${email}'`);
//             question = question[0].map( elm => elm.question )[0];

//             if (question===0) {
//                 question = "What was the name of your first pet?";
//                 res.status(200).send(question);
//                 console.log(question);
//             }
//             else if (question===1) {
//                 question = "What age were you when you lost your first tooth?";
//                 res.status(200).send(question);
//                 console.log(question);
//             }
//             else if (question===2) {
//                 question = "What is your favourite book?";
//                 res.status(200).send(question);
//                 console.log(question);
//             }
//         }
//         else {
//             res.status(200).send({msg: "Email not found"});
//             console.log("Email not found");
//         }            
//     }
//     catch(err) {
//         console.log(err);
//     }
// });

// // RECOVER PASSWORD
// app.post('/forgotPassowrd', async (req, res) => {
//     let email = req.query.email;
//     let answer = req.body.answer;

//     try {
//         let dbAnswer = await db.promise().query(`SELECT answer FROM USERS WHERE email='${email}'`);

//         if (answer===dbAnswer) {
//             let password = await db.promise().query(`SELECT password FROM USERS WHERE email='${email}'`);
//             res.status(200).send(password);
//             console.log(password);
//         }
//         else {
//             res.status(200).send({msg: "Incorrect response"});
//             console.log("Incorrect response");
//         }
//     }
//     catch (err) {
//         console.log(err);
//     }
// });

// DELETE RECIPE

// DELETE USER
// TODO: SORT OUT A USER'S RECIPES WHEN ACCOUNT IS DELETED
app.post('/:userID/deleteUser', async (req, res) => {

    // Find userID from query - would be saved somewhere
    let userID = req.params.userID;

    try {

        // Delete the record in users with that userID
        db.promise().query(`DELETE FROM USERS WHERE userID=${userID}`);
        
        // ONE POSSIBILITY: DELETE ALL OF THE USER'S RECIPES
        // db.promise().query(`DELETE FROM RECIPE_INGREDIENT_QUANTITY WHERE userID=${userID}`);
        // db.promise().query(`DELETE FROM RECIPES WHERE userID=${userID}`);

        // ALTERNATIVE: REPLACE userID IN ALL OF THE USER'S RECIPES WITH AN ORPHAN ACCOUNT
        // orphanUserID = 0; //TODO: CREATE AN ORPHAN ACCOUNT? - 0 AS PLACEHOLDER
        // db.promise().query(`UPDATE RECIPES SET userID=${orphanUserID} WHERE userID=${userID}`);

        res.status(200).send({msg: 'User deleted'});
    }
    catch (err) {
        console.log(err);
    }
});

// FETCH RECIPE SUMMARIES FROM FILTERS
app.post('/:userID/recipes', async (req, res) => {

    let recipes = null;

    // Extract values from request body
    let { search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy } = req.body;
    console.log(search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

    // For allergies
    // let { search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy } = req.body;
    // console.log(search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

    // Replace null values with wildcards that will match any value for that attribute in the db
    // % => any number of characters
    // _  => 1 character (used for the integer values here)
    if (search===null) search=["%"];
    else search = "%"+search+"%";

    // Replace booleans with 1 or 0 for mysql
    if (vegetarian===null) vegetarian="_";
    else if (vegetarian===true) vegetarian=1;
    else if (vegetarian===false) vegetarian=0;

    if (vegan===null) vegan="_";
    else if (vegan===true) vegan=1;
    else if (vegan===true) vegan=0;

    if (kosher===null) kosher="_";
    else if (kosher===true) kosher=1;
    else if (kosher===true) kosher=0;

    if (halal===null) halal="_";
    else if (halal===true) halal=1;
    else if (halal===true) halal=0;

    if (serving===null) serving="_";
    else if (serving===true) serving=1;
    else if (serving===true) serving=0;

    if (time===null) time="_";
    else if (time===true) time=1;
    else if (time===true) time=0;

    if (difficulty===null) difficulty="_";
    else if (difficulty===true) difficulty=1;
    else if (difficulty===true) difficulty=0;

    try {

        // Find summary recipe details with filters - included recID - wouldn't be displayed but can be used to fetch complete recipe details
        
        // If ingredients is null, replace it with every ingredient in the ingredients table (any are possible)
        if (ingredients===null) {
            ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS`);
            ingredients = ingredients[0].map( elm => elm.name );
        }

        // For allergies
        if (allergies===null) {
            allergies=[];
        }

        console.log(search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

        //For allergies
        // console.log(search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

        // Use ingredients to find an array of recIDs
        let recIDs=[];

        // For allergies
        // let recIDsAllergies = [];

        // For allergies
        // for (let a=0; a<allergies.length; a++) {

        //     // Find an ingID matching a name containing that ingredient (wildcards)
        //     let allergy = "%"+allergies[k]+"%";
        //     let ingID = await db.promise().query(`SELECT ingID FROM INGREDIENTS WHERE name LIKE '${allergy}'`);
        //     ingID = ingID[0].map( elm => elm.ingID )[0];

        //     // Find the recIDs that match that ingID in recipe_ingredient_quantity
        //     let recID = await db.promise().query(`SELECT recID FROM RECIPE_INGREDIENT_QUANTITY WHERE ingID=${ingID}`);

        //     // Add recIDs to an array
        //     for (let r=0; r<recID[0].length; r++) {
        //         recIDCurrent = recID[0].map( elm => elm.recID )[r];
        //         if (recIDsAllergies.includes(recIDCurrent)===false) recIDsAllergies.push(recIDCurrent);

        //     }
        //     console.log(recIDsAllergies);
        // }

        for (let k=0; k<ingredients.length; k++) {

            // Find an ingID matching a name containing that ingredient (wildcards)
            let ingredient = "%"+ingredients[k]+"%";
            let ingID = await db.promise().query(`SELECT ingID FROM INGREDIENTS WHERE name LIKE '${ingredient}'`);
            ingID = ingID[0].map( elm => elm.ingID )[0];

            // Find the recIDs that match that ingID in recipe_ingredient_quantity
            let recID = await db.promise().query(`SELECT recID FROM RECIPE_INGREDIENT_QUANTITY WHERE ingID=${ingID}`);

            // Add recIDs to an array
            for (let r=0; r<recID[0].length; r++) {
                recIDCurrent = recID[0].map( elm => elm.recID )[r];
                if (recIDs.includes(recIDCurrent)===false) recIDs.push(recIDCurrent);

                // For allegies
                // if (recIDs.includes(recIDCurrent)===false && recIDsAllergies.includes(recIDCurrent)===false) recIDs.push(recIDCurrent);

            }
            console.log(recIDs);
        }
        
        // Find summary recipe details from filters
        recipes = await db.promise().query(`SELECT recID, name, vegetarian, vegan, kosher, halal, serving, time, difficulty, summary FROM RECIPES WHERE (name LIKE '${search}' OR summary LIKE '${search}') AND vegetarian LIKE '${vegetarian}' AND vegan LIKE '${vegan}' AND kosher LIKE '${kosher}' AND halal LIKE '${halal}' AND serving LIKE '${serving}' AND time LIKE '${time}' AND difficulty LIKE '${difficulty}' AND recID IN (${recIDs})`);
        
        // Sort the recipes in ascending order by either serving, time or difficulty
        if (sortBy===0) {
            recipes = recipes[0].sort((a, b) => a.serving - b.serving);
        }
        else if (sortBy===1) {
            recipes = recipes[0].sort((a, b) => a.time - b.time);
        }
        else if (sortBy===2) {
            recipes = recipes[0].sort((a, b) => a.difficulty - b.difficulty);
        }
        
        console.log(recipes);

        res.status(200).send(recipes);
    }
    catch (err) {
        console.log(err);
    }
});

// FETCH RECIPE SUMARIES FROM ACCOUNT
app.get('/:userID', async (req, res) => {

    let userID = req.params.userID;

    try {

        // Find summary recipe details with userID - included recID - wouldn't be displayed but can be used to fetch complete recipe details
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

// FETCH COMPLETE RECIPE DETAILS FROM RECID FROM FILTERS
app.get('/:userID/recipes/:recID', async (req, res) => {

    // Use recipe name passed as param to find recID for purposes of development
    // In reality, would use recID from summary data - name too imprecise
    let recID = req.params.recID;
    console.log(recipe);

    try {

        // Find complete recipe details with recID
        let recipeDetails = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
        
        // Find recipe ingredients
        let ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS WHERE ingID IN (SELECT ingID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);
        
        // Find recipe quantities
        let quantities = await db.promise().query(`SELECT name FROM QUANTITIES WHERE quantityID IN (SELECT quantityID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);

        // Extract recipe details as an array - each recipe value can be separately extracted as with userID
        recipeDetails=recipeDetails[0];

        console.log("scrambledRef");
        console.log(recipeDetails[0].scrambledRef);

        // If there is no scrambledRef, change it to an empty string
        if (recipeDetails[0].scrambledRef==null) {
            recipeDetails[0].scrambledRef="";
        }
        // If the scrambledRef is linked to the orphan recipe, change to "Deleted recipe"
        else if (recipeDetails[0].scrambledRef==0) { // create orphan recipe
            recipeDetails[0].scrambledRef="Deleted recipe";
        }
        // Otherwise, change scrambledRef to the recipe name and user
        else {
            scrambledRefRecipe = await db.promise().query(`SELECT name FROM RECIPES WHERE recID=${recipeDetails[0].scrambledRef}`);
            scrambledRefRecipe = scrambledRefRecipe[0].map( elm => elm.name )[0];
            console.log(scrambledRefRecipe)

            scrambledRefUser = await db.promise().query(`SELECT username FROM USERS WHERE userID = (SELECT userID FROM RECIPES WHERE recID=${recipeDetails[0].scrambledRef})`);
            scrambledRefUser = scrambledRefUser[0].map( elm => elm.username )[0];
            console.log(scrambledRefUser)

            recipeDetails[0].scrambledRef=scrambledRefRecipe+" by "+scrambledRefUser;
        }

        // Add ingredients to recipe details
        recipeDetails[0].ingredients=ingredients[0].map( elm => elm.name );
        
        // Add quantities to recipe details
        recipeDetails[0].quantities=quantities[0].map( elm => elm.name );
        
        console.log(recipeDetails);
        res.status(200).send(recipeDetails);
    }
    catch (err) {
        console.log(err);
    }
});

// FETCH COMPLETE RECIPE DETAILS FROM RECID FROM ACCOUNT
app.get('/:userID/:recID', async (req, res) => {

    // Use recipe name passed as param to find recID for purposes of development
    // In reality, would use recID from summary data - name too imprecise
    let recID = req.params.recID;
    console.log(recipe);

    try {

        // Find complete recipe details with recID
        let recipeDetails = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
        
        // Find recipe ingredients
        let ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS WHERE ingID IN (SELECT ingID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);
        
        // Find recipe quantities
        let quantities = await db.promise().query(`SELECT name FROM QUANTITIES WHERE quantityID IN (SELECT quantityID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);

        // Extract recipe details as an array - each recipe value can be separately extracted as with userID
        recipeDetails=recipeDetails[0];

        console.log("scrambledRef");
        console.log(recipeDetails[0].scrambledRef);

        // If there is no scrambledRef, change it to an empty string
        if (recipeDetails[0].scrambledRef==null) {
            recipeDetails[0].scrambledRef="";
        }
        // If the scrambledRef is linked to the orphan recipe, change to "Deleted recipe"
        else if (recipeDetails[0].scrambledRef==0) { // create orphan recipe
            recipeDetails[0].scrambledRef="Deleted recipe";
        }
        // Otherwise, change scrambledRef to the recipe name and user
        else {
            scrambledRefRecipe = await db.promise().query(`SELECT name FROM RECIPES WHERE recID=${recipeDetails[0].scrambledRef}`);
            scrambledRefRecipe = scrambledRefRecipe[0].map( elm => elm.name )[0];
            console.log(scrambledRefRecipe)

            scrambledRefUser = await db.promise().query(`SELECT username FROM USERS WHERE userID = (SELECT userID FROM RECIPES WHERE recID=${recipeDetails[0].scrambledRef})`);
            scrambledRefUser = scrambledRefUser[0].map( elm => elm.username )[0];
            console.log(scrambledRefUser)

            recipeDetails[0].scrambledRef=scrambledRefRecipe+" by "+scrambledRefUser;
        }

        // Add ingredients to recipe details
        recipeDetails[0].ingredients=ingredients[0].map( elm => elm.name );
        
        // Add quantities to recipe details
        recipeDetails[0].quantities=quantities[0].map( elm => elm.name );
        
        console.log(recipeDetails);
        res.status(200).send(recipeDetails);
    }
    catch (err) {
        console.log(err);
    }
});

// FETCH ACCOUNT DETAILS FROM DATABASE
app.get('/:userID', async (req, res) => {
    let userID = req.params.userID;

    // Find username for the userID
    let username = await db.promise().query(`SELECT username FROM USERS WHERE userID=${userID}`);
    username = username[0].map( elm => elm.userID )[0];
    console.log(userID[0]);
    res.status(200).send(userID[0]);
});

// Find userID FROM DATABASE
app.post('/logIn', async (req, res) => {
    // User enters email and password
    let { email, password } = req.body;


    // Find all emails in db
    let emails = await db.promise().query(`SELECT email FROM USERS`);
    emails = emails[0].map( elm => elm.email );

    // Check entered email is in db
    if (email in emails) {
        // Find password for email
        dbPassword = await db.promise().query(`SELECT password FROM USERS WHERE email='${email}'`);
        dbPassword = dbPassword[0].map( elm => elm.password )[0];
    
        // Check if the password is correct
        if (password === dbPassword) {
            let userID = await db.promise().query(`SELECT userID FROM USERS WHERE email='${email}' AND password='${password}'`);
            userID=userID[0].map(elm => elm.userID)[0];
            res.status(200).send(userID);
            console.log(userID);
        }
        else {
            res.status(200).send({msg: "Incorrect email or password"});
            console.log("Incorrect email or username");
        }
    }
    else {
        res.status(200).send({msg: "Incorrect email or password"});
        console.log("Incorrect email or username");
    }
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