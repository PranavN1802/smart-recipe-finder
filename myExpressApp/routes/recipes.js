var express = require('express');
var request = require('request');
var router = express.Router();

const db = require('./database');

router.get('/', async(req, res, next) => {
    res.render('recipeList', { title: 'Recipes | Bubble\'N\'Sqeak' });
    //res.render('recipeView', { title: 'View | Bubble\'N\'Sqeak' });

    //response = await db.promise().query(`SHOW TABLES`);
});

router.get('/search', async(req, res, next) => {
    request.post('http://localhost:3000/recipes/search',
        { json: { search: null, ingredients: null, allergies: null, vegetarian: null, vegan: null, kosher: null, halal: null, serving: null, time: null, difficulty: null, sortBy: null }},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).send(body);
            }
        }
    );
});

router.post('/search', async(req, res, next) => {
    let recipes = null;
    let alertText = "";
    let alert = false;

    console.log("Input body: ", req.body);
    // Extract values from request body
    // let { search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy } = req.body;
    // console.log("Request to recipes/search:", search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

    // For allergies
    let { search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy } = req.body;
    console.log("Request to recipes/search:", search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

    // Replace null values with wildcards that will match any value for that attribute in the db
    // % => any number of characters
    // _  => 1 character (used for the integer values here)
    if (search===null ) search=["%"];
    else search = "%"+search+"%";

    // Replace booleans with 1 or 0 for mysql
    if (vegetarian===null) vegetarian="_";
    else if (vegetarian===true) vegetarian=1;
    else if (vegetarian===false) vegetarian=0;

    if (vegan===null) vegan="_";
    else if (vegan===true) vegan=1;
    else if (vegan===false) vegan=0;

    if (kosher===null) kosher="_";
    else if (kosher===true) kosher=1;
    else if (kosher===false) kosher=0;

    if (halal===null) halal="_";
    else if (halal===true) halal=1;
    else if (halal===false) halal=0;

    if (serving===null) serving="_";
    else if (serving===true) serving=1;
    else if (serving===false) serving=0;

    if (time===null) time="_";
    else if (time===true) time=1;
    else if (time===false) time=0;

    if (difficulty===null) difficulty="_";
    else if (difficulty===true) difficulty=1;
    else if (difficulty===false) difficulty=0;

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

        console.log("Request reformatted to:", search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

        // Use ingredients to find an array of recIDs
        let recIDs=[];

        // For allergies
        let recIDsAllergies = [];

        // For allergies
        for (let a=0; a<allergies.length; a++) {

            // Find an ingID matching a name containing that ingredient (wildcards)
            let allergy = "%"+allergies[a]+"%";
            let ingID = await db.promise().query(`SELECT ingID FROM INGREDIENTS WHERE name LIKE '${allergy}'`);
            ingID = ingID[0].map( elm => elm.ingID )[0];

            // Find the recIDs that match that ingID in recipe_ingredient_quantity
            let recID = await db.promise().query(`SELECT recID FROM RECIPE_INGREDIENT_QUANTITY WHERE ingID=${ingID}`);

            // Add recIDs to an array
            for (let r=0; r<recID[0].length; r++) {
                recIDCurrent = recID[0].map( elm => elm.recID )[r];
                if (recIDsAllergies.includes(recIDCurrent)===false) recIDsAllergies.push(recIDCurrent);

            }
            console.log("RecIDsAllergies: ", recIDsAllergies);
        }

        for (let k=0; k<ingredients.length; k++) {

            // Find an ingID matching a name containing that ingredient (wildcards)
            let ingredient = "%"+ingredients[k]+"%";
            let ingIDs = await db.promise().query(`SELECT ingID FROM INGREDIENTS WHERE name LIKE '${ingredient}'`);
            ingIDs = ingIDs[0].map( elm => elm.ingID );
            //console.log(ingredient, ingIDs);

            // Checks if ingredient was found
            if (ingIDs == undefined) {
                alert = true;
                alertText += "Ingredient '" + ingredients[k] + "' was not found in any recipe!\n";
                continue;
            }

            ingSQL = `(ingID='${ingIDs[0]}'`;
            for(var i = 1; i < ingIDs.length; i++) {
                ingSQL += ` OR ingID='${ingIDs[i]}'`;
            }
            ingSQL += `)`;

            // Find the recIDs that match that ingID in recipe_ingredient_quantity
            let recID = await db.promise().query(`SELECT recID FROM RECIPE_INGREDIENT_QUANTITY WHERE ${ingSQL}`);

            // Add recIDs to an array
            for (let r=0; r<recID[0].length; r++) {
                recIDCurrent = recID[0].map( elm => elm.recID )[r];
                //if (recIDs.includes(recIDCurrent)===false) recIDs.push(recIDCurrent);

                // For allegies
                if (recIDs.includes(recIDCurrent)===false && recIDsAllergies.includes(recIDCurrent)===false) recIDs.push(recIDCurrent);
            }

            //console.log(recIDs);
        }

        // Creates potential alert 
        if (alert) {
            alertJSON = ({
                alert: alert,
                text: alertText
            });
        }

        if (recIDs.length > 0) {
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

            // Appends potential alert message to the response
            if (alert) recipes[0].push(alertJSON);
            console.log(recipes[0]);
            res.status(200).send(recipes[0]);
        } else {
            let recipes = [alertJSON];
            console.log(recipes);
            res.status(200).send(recipes);
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/view/:recID', async(req, res, next) => {
    res.render('recipeView', { title: 'View | Bubble\'N\'Sqeak' });
});

router.post('/view/:recID', async(req, res, next) => {
    let recID = req.params.recID;
    res.status(200).send({ recID: recID});
});

router.get('/find', async(req, res, next) => {
    //let recID = req.get(recID);
    const {cookies} = req;
    console.log(cookies);
    console.log(cookies.recID);
    let recID = cookies.recID;
    // console.log(req.headers);

    try {

        // Find complete recipe details with recID
        let recipeDetails = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
        
        // Find recipe ingredients
        let ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS WHERE ingID IN (SELECT ingID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);
        
        // Find recipe quantities
        let quantities = await db.promise().query(`SELECT name FROM QUANTITIES WHERE quantityID IN (SELECT quantityID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);

        // Extract recipe details as an array - each recipe value can be separately extracted as with userID
        recipeDetails=recipeDetails[0];

        let username = await db.promise().query(`SELECT username FROM USERS WHERE userID=${recipeDetails[0].userID}`);
        recipeDetails[0].username = username[0].map( elm => elm.username )[0];

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

router.get('/find/:recID', async(req, res, next) => {
    // Use recipe name passed as param to find recID for purposes of development
    // In reality, would use recID from summary data - name too imprecise
    let recID = req.params.recID;
    console.log(recID);
    console.log(typeof(recID));

    try {

        // Find complete recipe details with recID
        let recipeDetails = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
        
        // Find recipe ingredients
        let ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS WHERE ingID IN (SELECT ingID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);
        
        // Find recipe quantities
        let quantities = await db.promise().query(`SELECT name FROM QUANTITIES WHERE quantityID IN (SELECT quantityID FROM RECIPE_INGREDIENT_QUANTITY WHERE recID=${recID})`);

        // Extract recipe details as an array - each recipe value can be separately extracted as with userID
        recipeDetails=recipeDetails[0];

        let username = await db.promise().query(`SELECT username FROM USERS WHERE userID=${recipeDetails[0].userID}`);
        recipeDetails[0].username = username[0].map( elm => elm.username )[0];

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

router.get('/create', async(req, res, next) => {
    if (req.user) {
        res.render('recipeCreate', { title: 'Create | Bubble\'N\'Sqeak', src: '/functions/recipeCreation.js'});
    } else {
        return res.redirect('/login');
        //console.log('Not logged in');
        //res.status(401).send({msg: 'Not logged in'});
    }
});

router.get('/edit/:recID', async(req, res, next) => {
    if (req.user) {
        let userID = req.user.userID;
        let recID = req.params.recID;
        console.log(userID);

        actualUser = await db.promise().query(`SELECT userID FROM recipes WHERE recID=${recID}`);
        actualUser = actualUser[0].map( elm => elm.userID )[0];
        console.log(actualUser);

        if(userID != actualUser) {
            res.render('cheekyHacker', { message: 'You cannot edit a recipe you did not create!'});
        } else {
            res.cookie('recID', recID);
            res.render('recipeCreate', { title: 'Edit | Bubble\'N\'Sqeak', src: '/functions/editRecipe.js' });
        }
    } else {
        return res.redirect('/login');
        //console.log('Not logged in');
        //res.status(401).send({msg: 'Not logged in'});
    }
});

router.get('/scramble/:recID', async(req, res, next) => {
    if (req.user) {
        res.cookie('recID', req.params.recID);
        res.render('recipeCreate', { title: 'Scramble | Bubble\'N\'Sqeak', src: '/functions/scrambleRecipe.js' });
    } else {
        return res.redirect('/login');
        //console.log('Not logged in');
        //res.status(401).send({msg: 'Not logged in'});
    }
});

router.post('/scramble', async(req, res, next)=>{
    //let userID = req.params.userID;
    const {cookies} = req;
    let recID = cookies.recID;
    //let userID = cookies.userID;

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
            res.status(201).send({text: 'Recipe Created!'});
        }
        else {
            console.log("Value not present")
        }
    }
    catch (err) {
        console.log(err);
    }
})

router.post('/edit', async(req, res, next)=>{
    const {cookies} = req;
    let recID = cookies.recID;

    if (req.user) {
        let userID = req.user.userID;
        console.log(userID);

        actualUser = await db.promise().query(`SELECT userID FROM recipes WHERE recID=${recID}`);
        actualUser = actualUser[0].map( elm => elm.userID )[0];
        console.log(actualUser);

        if(userID != actualUser) {
            res.render('cheekyHacker', { message: 'You cannot edit a recipe you did not create!'});
        } else {

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
                    console.log(recipeFound[0]);

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
                                console.log(ingredientDetail[0]);

                                // Extract ingID integer for current ingredient
                                let ingID = ingredientDetail[0].map( elm => elm.ingID )[0];
                                console.log(ingID);

                                // Extract quantityID array for current quantity
                                let quantityDetail = await db.promise().query(`SELECT quantityID FROM QUANTITIES WHERE name='${quantities[j]}'`);
                                console.log(quantityDetail[0]);

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
                            res.status(500).send({ alert: true, text: "Different number of ingredients and quantities..."});
                        }
                    }
                    else {
                        console.log('Recipe found in db');
                        res.status(500).send({ alert: true, text: "Recipe already exsists!"});
                    }
                    console.log(recID);
                    res.status(201).send({ alert: false, text: 'Recipe Edited!', recID: recID});
                }
                else {
                    console.log("Value not present")
                    res.status(500).send({ alert: true, text: "Missing recipe body..."});
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    } else {
        return res.redirect('/login');
        // console.log('Not logged in');
        // res.status(401).send({msg: 'Not logged in'});
    }
})

router.post('/create', async(req, res, next) => {
    console.log(req.body);

    if (req.user) {

        // TODO: THEO!!! ATTEND
        // You can replace fetching userID from params with:
        // let userID = req.user.userID;
        // :)

        // Find email, username and password from queries - won't be needed once userID is saved from log in
        let userID = req.user.userID;
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
                    if(recRef == 'null' || recRef == null) db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary) VALUES ('${userID}', '${name}', NULL, NULL, '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}')`);
                    else db.promise().query(`INSERT INTO RECIPES (userID, name, recRef, scrambledRef, vegetarian, vegan, kosher, halal, serving, time, difficulty, reports, steps, summary) VALUES ('${userID}', '${name}', '<a href=${recRef}>${name} reference</a>', NULL, '${vegetarian}', '${vegan}', '${kosher}', '${halal}', '${serving}', '${time}', '${difficulty}', 0, '${steps}', '${summary}')`);

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

                        recID = await db.promise().query(`SELECT recID FROM RECIPES WHERE name='${name}' AND userID='${userID}'`);
                        console.log(recID[0]);
                        res.status(201).send({alert: false, text: 'Recipe Created!', recID: recID[0][0]});
                    }
                    else {
                        console.log('Different number of ingredients and quantities');
                        res.status(500).send({ alert: true, text: "Different number of ingredients and quantities..."});
                    }
                }
                else {
                    console.log('Recipe found in db');
                    res.status(500).send({ alert: true, text: "Recipe already exsists!"});
                }
            }
            else {
                console.log("Value not present");
                res.status(500).send({ alert: true, text: "Missing recipe body..."});
            }
        }
        catch (err) {
            console.log(err);
        }
    } else {
        return res.redirect('/login');
        // console.log('Not logged in');
        // res.status(401).send({msg: 'Not logged in'});
    }
});

router.post('/details/:recID', async(req, res, next) => {
    let recID = req.params.recID;

    recipe = await db.promise().query(`SELECT * FROM RECIPES WHERE recID='${recID}'`);
    recipe = recipe[0];

    console.log(recipe);
    res.status(201).send({ recipe: recipe })
});


// CHANGE UPVOTES
router.post("/:recID/report", async (req,res) => {

    // THEO - CHANGE RECID AND USERID TO BE RETRIEVED FROM REQ.USER AND COOKIE
    let recID = req.params.recID;
    console.log(recID);

    console.log(req.user);

    // Check if user is logged in
    if (req.user) {
        let userID = req.user.userID;
        console.log(userID);
        try{
            console.log('retrieve user record');
            // Check if the user has already reported this recipe
            let result = await db.promise().query(`SELECT recID FROM REPORTS WHERE userID=${userID} AND recID=${recID}`);
            
            if (result[0].length===0) {
                // Find current upvotes value for the recipe
                let reports = await db.promise().query(`SELECT reports FROM RECIPES WHERE recID=${recID}`);
                
                // Extract upvotes value form array
                reports = reports[0].map( elm => elm.reports )[0];

                // Increment the number of upvotes by 1
                db.promise().query(`UPDATE RECIPES SET reports=${reports} + 1 WHERE recID= ${recID}`);
                db.promise().query(`INSERT INTO REPORTS (recID, userID) VALUES (${recID}, ${userID})`);
                console.log('reported');
                res.status(200).send({msg: "Reported!"});
            } else {
                res.status(500).send({msg: 'You may only report a recipe once'});
            }
        }
        catch (err){
            console.log(err);
        }
    } else {
        res.status(500).send({msg: 'Log in to use this function'});
    }
});

// CHANGE UPVOTES
router.post("/:recID/upvote", async (req,res) => {

    let recID = req.params.recID;
    console.log(recID);

    console.log(req.user);

    // Check if user is logged in
    if (req.user) {
        let userID = req.user.userID;
        console.log(userID);
        try{
            console.log('retrieve user record');
            // Check if the user has already reported this recipe
            let result = await db.promise().query(`SELECT recID FROM UPVOTES WHERE userID=${userID} AND recID=${recID}`);
            
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
                res.status(500).send({msg: 'You may only upvote a recipe once'});
            }
        }
        catch (err){
            console.log(err);
        }
    } else {
        res.status(500).send({msg: 'Log in to use this function'});
    }
});



module.exports = router;