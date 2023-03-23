// use http://postman.com to make http requests and other requests
// https://www.youtube.com/watch?v=7iQLkJ3rEQo

// {
//     "name": "Ratatouille",
//     "recRef":"https://beatthebudget.com/recipe/2019-9-28-ratatouille/",
//     "vegetarian":true,
//     "vegan":true,
//     "kosher":false,
//     "halal":false,
//     "serving":4,
//     "time":5,
//     "difficulty":0,
//     "ingredients":["Aubergine","Courgette","Salad Tomato","Mixed Pepper","Passata","Fresh Basil","Fresh Thyme","Olive Oil","Salt"],
//     "quantities":["1","2","6","5","500g",null,null,"3 tbsp",null],
//     "steps":"1: Chop and grill peppers\n2: Chop the other veg\n3: Blend peppers with 100g passata; combine with remaining passata; place in dish; season with salt and thyme.\n4: Place chopped veg in layers in dish\n5: Chop some basil; stir in to 2tbsp olive oil; coat vegetables in mix; season with salt\n6: Cook at 180° for 25 mins\n7: Sprinkle fresh basil on top and serve.",
//     "summary":"Healthy and easy vegan ratatouille!"
// }

// {
//     "name": "Vegan Mushroom Stroganoff",
//     "recRef":"https://beatthebudget.com/recipe/vegan-mushroom-stroganoff/",
//     "vegetarian":true,
//     "vegan":true,
//     "kosher":false,
//     "halal":false,
//     "serving":4,
//     "time":3,
//     "difficulty":0,
//     "ingredients":["Chestnut Mushroom","Cashew","Pasta Shell", "Fresh Thyme", "Aubergine", "Small Onion", "Veggie Stock Cube", "Olive Oil", "Soy Sauce", "Garlic Granule"],
//     "quantities":["500g","150g","500g", null, "1", "2-3", "1", "1 tbsp", "1 tbsp", "1 tsp"],
//     "steps":"1: Soak cashews for an hour before cooking. Chop the mushrooms, aubergine and onions into small to medium-sized pieces\n2: Brown the mushrooms and aubergine in a pan on a high heat, with the oil\n3: Reduce the heat and add the onions and fresh thyme. Continue to fry gently for another 5 minutes. Add the pasta to salted water\n4: When the pasta is nearly ready, drain it and reserve the pasta water for the sauce\n5: Blend the soaked cashews, soy sauce, garlic granules, veggie stock cube and a few ladles of pasta water to make the creamy cashew sauce\n6: Combine the mushroom mix with the pasta, sauce, and 200ml of pasta water. Stir the mix on a low heat until the pasta is al dente. Keep adding pasta water if the sauce seems too thick\n7: Serve with lots of black pepper and a pinch of salt.",
//     "summary":"Creamy and nutritious, vegan mushroom stroganoff made with blended cashews."
// }

// {
//     "name": "Purple Porridge",
//     "recRef":"https://beatthebudget.com/recipe/purple-porridge/",
//     "vegetarian":true,
//     "vegan":true,
//     "kosher":false,
//     "halal":false,
//     "serving":4,
//     "time":1,
//     "difficulty":0,
//     "ingredients":["Frozen Mixed Berry","Oat","Honey"],
//     "quantities":["A handful","250g","1 tbsp"],
//     "steps":"1: Add a handful of berries into a medium saucepan with around 200ml of water. Cook on a medium heat for 5 minutes\n2: Stir and smash the berries a bit into a berry sauce\n3: Add the honey and oats to the sauce with around 50-200ml of water depending on how thick you like your porridge\n4: Stirring continuously, heat the porridge for 3 minutes\n5: Serve up with any additional toppings you want.",
//     "summary":"Sweet and sour, deliciously creamy, purple berry porridge."
// }

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

app.get('/', async(req, res) => {
    response = await db.promise().query(`SHOW TABLES`);
    console.log(response[0]);
    res.send(response);
})

// CREATE DB TABLES
app.get('/createDatabaseTables', (req, res) => {
    db.promise().query(`CREATE TABLE users (userID INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(250), username VARCHAR(20), password VARCHAR(50))`);
    db.promise().query(`CREATE TABLE recipes (recID INT AUTO_INCREMENT PRIMARY KEY, userID INT, FOREIGN KEY(userID) REFERENCES users(userID), name VARCHAR(150), recRef VARCHAR(300), scrambledRef INT, vegetarian TINYINT(1), vegan TINYINT(1), kosher TINYINT(1), halal TINYINT(1), serving INT, time INT, difficulty INT, reports INT, steps MEDIUMTEXT, summary TINYTEXT)`);
    db.promise().query(`CREATE TABLE ingredients (ingID INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50))`);
    db.promise().query(`CREATE TABLE quantities (quantityID INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(20))`);
    db.promise().query(`CREATE TABLE recipe_ingredient_quantity (recID INT, FOREIGN KEY(recID) REFERENCES recipes(recID), ingID INT, FOREIGN KEY(ingID) REFERENCES ingredients(ingID), quantityID INT, FOREIGN KEY(quantityID) REFERENCES quantities(quantityID))`);
    console.log("Tables created");
    res.send({msg: "Tables created"});
});


// CREATE NEW TABLES FOR UPVOTES AND REPORTS AND EDIT RECIPES TO INCLUDE UPVOTES
app.post('/createNewTables', async (req, res) => {
    try {
        db.promise().query(`CREATE TABLE upvotes (recID int, FOREIGN KEY (recID) REFERENCES recipes (recID), userID int, FOREIGN KEY (userID) REFERENCES users (userID))`);
        db.promise().query(`CREATE TABLE reports (recID int, FOREIGN KEY (recID) REFERENCES recipes (recID), userID int, FOREIGN KEY (userID) REFERENCES users (userID))`);
        db.promise().query(`ALTER TABLE recipes ADD upvotes int`);
        console.log('Tables added');
        res.send({msg: 'Tables added'});
    } catch (err) {
        console.log(err);
    }
});



// ADD ACCOUNT DETAILS TO DATABASE
// allows web server to handle post requests
// can specify endpoint to send the post request to
// no conflict btw using the same endpoint for a post and get - dif. methods for same endpoint
app.post('/createUser', async (req, res) => {
    const { email, username, password } = req.body;
    console.log(email);
    console.log(typeof(email));
    console.log(username);
    console.log(password);

    // For password recovery
    // const { email, username, password, question, answer } = req.body;

    if (email && username && password) {
        try {

            // Extract all usernames and email already in the dbss
            let details = await db.promise().query(`SELECT email, username FROM USERS`);
            let usernames = details[0].map( elm => elm.username );
            let emails = details[0].map( elm => elm.email );

            // Check email and username are unique
            if (emails.includes(email)) {
                res.send({msg: "Email taken"});
                console.log("Email taken");
            }
            else if (usernames.includes(username)) {
                res.send({msg: "Username taken"});
                console.log("Username taken");
            }
            else {
                // Only create user if the email and username are unique
                db.promise().query(`INSERT INTO USERS (email, username, password) VALUES ('${email}','${username}', '${password}')`);
                
                // // For password recovery
                // db.promise().query(`INSERT INTO USERS (email, username, password, question, answer) VALUES ('${email}','${username}', '${password}', ${question}, '${answer}')`);

                res.status(201).send({msg: 'Created user'});
                // console.log(req.body);
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
                db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary, upvotes) VALUES ('${userID}', '${name}', '<a href=${recRef}>${name} reference</a>', NULL, '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}', 0)`);
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
// USE FETCH COMPLETE RECIPE DETAILS TO DISPLAY EDITABLE DETAILS TO USER
app.post('/:userID/:recID/scramble', async (req, res) => {

    let userID = req.params.userID;
    let recID = req.params.recID;
    console.log(req.body);

    // Find email, username and password from queries - won't be needed once userID is saved from log in
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

                // Add the recipe details to the recipes table - including recID for scrambledRef
                db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary) VALUES ('${userID}', '${name}', '<a href=${recRef}>${name} reference</a>', ${recID}, '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}')`);
                console.log('Added recipe details');

                // Add to recipe_ingredient_quantity

                // Find new recID

                // Extract recID array
                let recipeDetail = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${name}' AND userID='${userID}'`);
                console.log(recipeDetail);

                // Extract recID integer from recID array
                let newRecID = recipeDetail[0].map( elm => elm.recID )[0];
                console.log(newRecID);
                
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
                        db.promise().query(`INSERT INTO RECIPE_INGREDIENT_QUANTITY (recID, ingID, quantityID) VALUES ('${newRecID}', '${ingID}', '${quantityID}')`);
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

    // THEO - CHANGE RECID AND USERID TO BE RETRIEVED FROM REQ.USER AND COOKIE
    // let recID = req.params.recID; // Would come from complete recipe details
    // let userID = req.params.userID;

    const {cookies} = req;

    let recID = cookies.reportedRecID;
    let userID = req.user.userID;

    // Check if user is logged in
    if (req.user) {
        try{
            // Check if the user has already reported this recipe
            let result = await db.promise().query(`SELECT recID FROM REPORTS WHERE userID=${req.user.userID}`);
            
            if (result[0].length===0) {
                // Find current reports value for the recipe
                let reports = await db.promise().query(`SELECT reports FROM RECIPES WHERE recID=${recID}`);
                
                // Extract reports value form array
                reports = reports[0].map( elm => elm.reports )[0];

                // Increment the number of reports by 1
                db.promise().query(`UPDATE RECIPES SET reports=${reports} + 1 WHERE recID= ${recID}`);
                db.promise().query(`INSERT INTO REPORTS (recID, userID) VALUES (${recID}, ${userID})`);
                console.log('Reported');
                res.status(200).send({msg: "Thank you for your report"});
            } else {
                res.send({msg: 'You may only report a recipe once'});
            }
        }
        catch (err){
            console.log(err);
        }
    } else {
        res.send({msg: 'Log in to use this function'});
    }
});

// CHANGE UPVOTES
app.post("/:userID/recipes/:recID/upvote", async (req,res) => {

    // THEO - CHANGE RECID AND USERID TO BE RETRIEVED FROM REQ.USER AND COOKIE
    // let recID = req.params.recID;
    // let userID = req.params.userID;

    const {cookies} = req;

    let recID = cookies.upvotedRecID;
    let userID = req.user.userID;

    // Check if user is logged in
    if (req.user) {
        try{
            // Check if the user has already reported this recipe
            let result = await db.promise().query(`SELECT recID FROM UPVOTES WHERE userID=${userID}`);
            
            if (result[0].length===0) {
                // Find current upvotes value for the recipe
                let upvotes = await db.promise().query(`SELECT upvotes FROM RECIPES WHERE recID=${recID}`);
                
                // Extract upvotes value form array
                upvotes = upvotes[0].map( elm => elm.upvotes )[0];

                // Increment the number of upvotes by 1
                db.promise().query(`UPDATE RECIPES SET upvotes=${upvotes} + 1 WHERE recID= ${recID}`);
                db.promise().query(`INSERT INTO UPVOTES (recID, userID) VALUES (${recID}, ${userID})`);
                console.log('upvoted');
                res.status(200).send({msg: "Upvoted!"});
            } else {
                res.send({msg: 'You may only upvote a recipe once'});
            }
        }
        catch (err){
            console.log(err);
        }
    } else {
        res.send({msg: 'Log in to use this function'});
    }
});

// FETCH REPORTED RECIPES - can be used by monitoring team to adddress users' concerns - ordered to help with prioritising
app.get("/reportedRecipes", async (req, res) => {
    let reportedRecipes = await db.promise().query(`SELECT recID FROM RECIPES WHERE reports>0 ORDER BY reports DESC`);
    reportedRecipes = reportedRecipes[0].map( elm => elm.recID );
    console.log(reportedRecipes);
    res.send(reportedRecipes);
});

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

//         if (emails.includes(email)) {
//             let question = await db.promise().query(`SELECT question FROM USERS WHERE email='${email}'`);
//             question = question[0].map( elm => elm.question )[0];

//             if (question===0) {
//                 question = "What was the name of your first pet?";
//                 res.status(200).send(question);
//                 console.log(question);
//             }
//             else if (question===1) {
//                 question = "What is your favourite film?";
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

// // CHANGE PASSWORD FOR RECOVERY
// app.post('/forgotPassword', async (req, res) => {
//     let email = req.query.email;
//     let answer = req.body.answer;
//     let newPassword = req.body.answer;

//     try {
//         let dbAnswer = await db.promise().query(`SELECT answer FROM USERS WHERE email='${email}'`);

//         // Change password if answer correct
//         if (answer===dbAnswer) {
//             db.promise().query(`UPDATE USERS SET password='${newPassword}' WHERE email=${email}`);
//             console.log('password changed');
//             res.status(200).send({msg: "password changed"});
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

// DELETE RECIPE - Ritika
app.post('/:recID/deleteRecipe', async (req, res) => {

    let recID = req.params.recID;

    try {
        // Change scrambledRefs
        console.log("change scrambledRef");
        db.promise().query(`UPDATE RECIPES SET scrambledRef=0 WHERE scrambledRef=${recID}`);

        console.log("delete recipe");
        // Delete the record in recicpes with that recID
        db.promise().query(`DELETE FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID}`);
        db.promise().query(`DELETE FROM RECIPES WHERE recID=${recID}`);

        res.status(200).send({msg:'Recipe deleted'});

    }
    catch (err) {
        console.log(err);
    }

});


// DELETE USER
// TODO: SORT OUT A USER'S RECIPES WHEN ACCOUNT IS DELETED
app.post('/:userID/deleteUser', async (req, res) => {

    // if (req.user) {
        // Find userID from query - would be saved somewhere
        let userID = req.params.userID;
        // let userID = req.user.userID;

        try {

            deletedUserID = 1;
            db.promise().query(`UPDATE RECIPES SET userID=${deletedUserID} WHERE userID=${userID}`);


            // Check if the user has already upvoted this recipe
            let upvotedRecipes = await db.promise().query(`SELECT recID FROM UPVOTES WHERE userID=${userID}`);
            upvotedRecipes = upvotedRecipes[0].map( elm => elm.recID );
                        
            if (upvotedRecipes.length===0) {
                console.log('This user has not upvoted any recipes');
            } else {
                for (u=0; u<upvotedRecipes.length; u++) {
                    // Find current upvotes value for the recipe
                    let upvotes = await db.promise().query(`SELECT upvotes FROM RECIPES WHERE recID=${upvotedRecipes[u]}`);
                    
                    // Extract upvotes value form array
                    upvotes = upvotes[0].map( elm => elm.upvotes )[0];

                    // Increment the number of upvotes by 1
                    db.promise().query(`UPDATE RECIPES SET upvotes=${upvotes} - 1 WHERE recID= ${upvotedRecipes[u]}`);
                    db.promise().query(`DELETE FROM UPVOTES WHERE userID=${userID} AND recID=${upvotedRecipes[u]}`);
                    console.log('upvote removed');
                }
                console.log('upvotes all removed');
            }

            // Check if the user has already upvoted this recipe
            let reportedRecipes = await db.promise().query(`SELECT recID FROM REPORTS WHERE userID=${userID}`);
            reportedRecipes = reportedRecipes[0].map( elm => elm.recID );
                        
            if (reportedRecipes.length===0) {
                console.log('This user has not reported any recipes');
            } else {
                for (r=0; r<reportedRecipes.length; r++) {
                    // Find current upvotes value for the recipe
                    let reports = await db.promise().query(`SELECT reports FROM RECIPES WHERE recID=${reportedRecipes[r]}`);
                    
                    // Extract upvotes value form array
                    reports = reports[0].map( elm => elm.reports )[0];

                    // Increment the number of upvotes by 1
                    db.promise().query(`UPDATE RECIPES SET reports=${reports} - 1 WHERE recID= ${reportedRecipes[r]}`);
                    db.promise().query(`DELETE FROM REPORTS WHERE userID=${userID} AND recID=${reportedRecipes[r]}`);
                    console.log('report removed');
                }
                console.log('reports all removed');
            }

            // Delete the record in users with that userID
            db.promise().query(`DELETE FROM USERS WHERE userID=${userID}`);
            
            // ONE POSSIBILITY: DELETE ALL OF THE USER'S RECIPES
            // db.promise().query(`DELETE FROM RECIPE_INGREDIENT_QUANTITY WHERE userID=${userID}`);
            // db.promise().query(`DELETE FROM RECIPES WHERE userID=${userID}`);

            // ALTERNATIVE: REPLACE userID IN ALL OF THE USER'S RECIPES WITH AN ORPHAN ACCOUNT
            // deletedUserID = 1; //TODO: CREATE AN ORPHAN ACCOUNT? - 0 AS PLACEHOLDER
            // db.promise().query(`UPDATE RECIPES SET userID=${orphanUserID} WHERE userID=${userID}`);

            res.status(200).send({msg: 'User deleted'});
        }
        catch (err) {
            console.log(err);
        }
    // } else {
    //     res.redirect('/login');
    // }
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
    // console.log(recipe);

    try {

        // Find complete recipe details with recID
        let recipeDetails = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
        
        // Find recipe ingredients
        let ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS WHERE ingID IN (SELECT ingID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);

        let quantityIDs = await db.promise().query(`SELECT quantityID, ingID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID}`);
        quantityIDs = quantityIDs[0].map( elm => elm.quantityID );
        console.log(quantityIDs);
        
        let quantities =[];
        let quantity = "";

        for (z=0; z<quantityIDs.length; z++) {
            console.log(quantityIDs[z])
            quantity = await db.promise().query(`SELECT name FROM QUANTITIES WHERE quantityID=${quantityIDs[z]}`);
            console.log(quantity[0].map( elm => elm.name )[0]);
            quantities = quantities.concat(quantity[0].map( elm => elm.name )[0]);
            console.log(quantities);
        }

        // Find recipe quantities
        // let quantities = await db.promise().query(`SELECT name FROM QUANTITIES WHERE quantityID IN ${quantityIDs}`);

        console.log(quantities);

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
        // recipeDetails[0].quantities=quantities[0].map( elm => elm.name );
        recipeDetails[0].quantities=quantities;
        
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
    if (emails.includes(email)) {
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
























// ADD DUMMY DATA (RECIPES) TO DATABASE (UNTESTED)
app.post('/addRecipes', async (req, res) => {

    // List of recipes - changed userID to match local db
    // Code will cycle through each recipe and add it to the db
    let recipes = [{
        name: "Ratatouille",
        recRef:"https://beatthebudget.com/recipe/2019-9-28-ratatouille/",
        vegetarian:true,
        vegan:true,
        kosher:false,
        halal:false,
        serving:4,
        time:5,
        difficulty:0,
        ingredients:["Aubergine","Courgette","Salad Tomato","Mixed Pepper","Passata","Fresh Basil","Fresh Thyme","Olive Oil","Salt"],
        quantities:["1","2","6","5","500g",null,null,"3 tbsp",null],
        steps:"1: Chop and grill peppers\n2: Chop the other veg\n3: Blend peppers with 100g passata; combine with remaining passata; place in dish; season with salt and thyme.\n4: Place chopped veg in layers in dish\n5: Chop some basil; stir in to 2tbsp olive oil; coat vegetables in mix; season with salt\n6: Cook at 180° for 25 mins\n7: Sprinkle fresh basil on top and serve.",
        summary:"Healthy and easy vegan ratatouille!",
        userID:2
        },
        {
        name: "Vegan Mushroom Stroganoff",
        recRef:"https://beatthebudget.com/recipe/vegan-mushroom-stroganoff/",
        vegetarian:true,
        vegan:true,
        kosher:false,
        halal:false,
        serving:4,
        time:3,
        difficulty:0,
        ingredients:["Chestnut Mushroom","Cashew","Pasta Shell", "Fresh Thyme", "Aubergine", "Small Onion", "Veggie Stock Cube", "Olive Oil", "Soy Sauce", "Garlic Granule"],
        quantities:["500g","150g","500g", null, "1", "2-3", "1", "1 tbsp", "1 tbsp", "1 tsp"],
        steps:"1: Soak cashews for an hour before cooking. Chop the mushrooms, aubergine and onions into small to medium-sized pieces\n2: Brown the mushrooms and aubergine in a pan on a high heat, with the oil\n3: Reduce the heat and add the onions and fresh thyme. Continue to fry gently for another 5 minutes. Add the pasta to salted water\n4: When the pasta is nearly ready, drain it and reserve the pasta water for the sauce\n5: Blend the soaked cashews, soy sauce, garlic granules, veggie stock cube and a few ladles of pasta water to make the creamy cashew sauce\n6: Combine the mushroom mix with the pasta, sauce, and 200ml of pasta water. Stir the mix on a low heat until the pasta is al dente. Keep adding pasta water if the sauce seems too thick\n7: Serve with lots of black pepper and a pinch of salt.",
        summary:"Creamy and nutritious, vegan mushroom stroganoff made with blended cashews.",
        userID:2
        },
        {
        name: "Purple Porridge",
        recRef:"https://beatthebudget.com/recipe/purple-porridge/",
        vegetarian:true,
        vegan:true,
        kosher:false,
        halal:false,
        serving:4,
        time:1,
        difficulty:0,
        ingredients:["Frozen Mixed Berry","Oat","Honey"],
        quantities:["A handful","250g","1 tbsp"],
        steps:"1: Add a handful of berries into a medium saucepan with around 200ml of water. Cook on a medium heat for 5 minutes\n2: Stir and smash the berries a bit into a berry sauce\n3: Add the honey and oats to the sauce with around 50-200ml of water depending on how thick you like your porridge\n4: Stirring continuously, heat the porridge for 3 minutes\n5: Serve up with any additional toppings you want.",
        summary:"Sweet and sour, deliciously creamy, purple berry porridge.",
        userID:3
        },
        { 
        name: "Butter Chicken", 
        recRef:"https://www.halalgirlabouttown.com/ramadan-routine-anchor-butter/", 
        vegetarian:false, 
        vegan:false, 
        kosher:false, 
        halal:true, 
        serving:2, 
        time:3, 
        difficulty:1, 
        ingredients:["Chicken Breasts","Minced Garlic","Minced Ginger","Butter","Bombay Masala","Cinnamon Sticks","Cardamom","Clove","Tomatoes","Green Chillies","Coriander"], 
        quantities:["2","1 tsp","1 tsp","Half Stick","4 tbsp","2","2","1","Half Tin","2","1 bunch"], 
        steps:"1. Cube chicken and mix with garlic, ginger, and salt. Leave to marinate\n2. In a pan, melt the butter and add the cinnamon, cardamom and clove.\n3. Add the chopped tomatoes and cook until the tomatoes have softened.\n4. Add in the bombay masala, green chillies, and coriander.\n5. Turn the heat on high and add in the chicken.\n6. After 5 minutes, lower the heat and leave to simmer.\n7. Add fresh coriander and serve.", 
        summary:"delicious and hearty version of butter chicken",
        userID:3
        },
        { 
        name: "Lamb Skewers", 
        recRef:"https://www.jamieoliver.com/recipes/lamb-recipes/quick-lamb-kebabs/", 
        vegetarian:false, 
        vegan:false, 
        kosher:true, 
        halal:true, 
        serving:8, 
        time:3, 
        difficulty:0, 
        ingredients:["Garlic","Dried Oregano","Lamb Steaks","Red Peppers","Fresh Bay Leaves","Lemons","Parsley","Olive Oil","Salt"], 
        quantities:["2 cloves","1 tsp","4","2","8","2","2 Sprigs",null,null], 
        steps:"1. Preheat wood-fired oven to 200°C\n2.Peel and bash garlic with sea salt and oregano, add olive oil\n3.Cut lamb into chunks, season with pepper, add marinade and toss to coat\n4.Thread lamb, peppers, bay leaves and lemon wedges onto skewers\n5.Roast skewers in oven for 10-15 minutes, turning occasionally\n6.Keep an eye on skewers to prevent burning\n7.Chop parsley and scatter over skewers\n8.Serve with flatbreads, Greek yoghurt and sliced cucumber.", 
        summary:"Quick Lamb Kebabs",
        userID:3
        }, 
        { 
        name: "Lemon Pepper Salmon", 
        recRef:"https://www.kosher.com/recipe/lemon-pepper-salmon-11069", 
        vegetarian:false, 
        vegan:false, 
        kosher:true, 
        halal:false, 
        serving:4, 
        time:3, 
        difficulty:0, 
        ingredients:["Thick Salmon Fillets","Coconut Aminos","Lemon Pepper","Sesame Seeds","Lemon Juice","Salt","Caesar Dressing","Dry Parsley"], 
        quantities:["4","2 tbsp","2 tsp","2 tbsp","3 tbsp","1 tsp","1/4 cup", "2 tsp"], 
        steps:"1.Marinate fish in lemon juice and coconut aminos for 15 minutes\n2.Place fillets on oiled baking sheet, season and drizzle with creamy dressing\n3.Broil for 8-10 minutes until crispy and cooked through\n4.Remove fish from pan with spatula or fork\n5.Serve warm, cold or at room temperature.", 
        summary:"Delectable salmon recipe",
        userID:4
        },
        { 
        name: "Potato Blintzes", 
        recRef:"https://www.chabad.org/recipes/recipe_cdo/aid/4624402/jewish/Traditional Potato-Blintzes.htm", 
        vegetarian:true, 
        vegan:false, 
        kosher:true,
        halal:true, 
        serving:10, 
        time:7, 
        difficulty:2, 
        ingredients:["Eggs","Milk","Water","Kosher salt","Oil","Flour","Potatoes","Onion","Black Pepper"], 
        quantities:["6","1/2 cup","1/2 cup",null,"4 tbsp","1 cup","700 g","1",null], 
        steps:"1.Combine batter ingredients, let sit for 10 minutes\n2.Heat skillet, spray with non-stick spray, pour in batter, cook 1-2 minutes\n3.Dice and fry onion, boil and mash potatoes, mix with fried onions, salt\n4.pepper and beaten egg\n5.Place filling on crepes and roll up\n6.Fry blintzes until golden and filling is warm\n7.Serve plain or with sauce of choice, such as mushroom sauce.", 
        summary:"Traditional Russian Potato Blintzes",
        userID:4
        },
        {
        name:"Pufferfish Ragu4",
        recRef:null,
        vegetarian:false,
        vegan:false,
        kosher:false,
        halal:false,
        serving:0,
        time:8,
        difficulty:2,
        ingredients:["Pufferfish"],
        quantities:["1"],
        steps:"1: chop\n2: cook\n3: try not to die!",
        summary:"Cook AT YOUR OWN RISK!!!",
        userID:4
        }];

    var name;
    var recRef;
    var vegetarian;
    var vegan;
    var kosher;
    var halal;
    var serving;
    var time;
    var difficulty;
    var ingredients;
    var quantities;
    var steps;
    var summary;
    var userID;


    for (i=0; i<recipes.length; i++) {

        name = recipes[i].name;
        recRef = recipes[i].recRef;
        vegetarian = recipes[i].vegetarian;
        vegan = recipes[i].vegan;
        kosher = recipes[i].kosher;
        halal = recipes[i].halal;
        serving = recipes[i].serving;
        time = recipes[i].time;
        difficulty = recipes[i].difficulty;
        ingredients = recipes[i].ingredients;
        quantities = recipes[i].quantities;
        steps = recipes[i].steps;
        summary = recipes[i].summary;
        userID = recipes[i].userID;

        try {

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
            console.log(recipeFound[0]);

            // Check if recipe is already in db - prevents users from creating two recipes of the same name
            if (recipeFound[0].length===0) {

                // Add the recipe details to the recipes table
                db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary, upvotes) VALUES (${userID}, '${name}', '<a href=${recRef}>${name} reference</a>', NULL, '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}', 0)`);
                console.log('Added recipe details');

                // Add to recipe_ingredient_quantity

                // Find recID

                // Extract recID array
                let recipeDetail = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${name}' AND userID=${userID}`);
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
            // res.status(201).send({msg: 'Recipe Created!'});
        }
        catch (err) {
            console.log(err);
        }
    }  
    res.send({msg:"Recipes added"});  
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