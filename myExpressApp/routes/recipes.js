var express = require('express');
var request = require('request');
var router = express.Router();

const db = require('./database');

router.get('/', async(req, res, next) => {
    res.render('recipeList', { title: 'Recipes | Bubble\'N\'Sqeak' });

    //response = await db.promise().query(`SHOW TABLES`);

    /*
    request.post('http://localhost:3000/recipes/search',
        { json: { search: null, ingredients: null, vegetarian: null, vegan: null, kosher: null, halal: null, serving: null, time: null, difficulty: null, sortBy: null }},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
    */
});

router.get('/search', async(req, res, next) => {
    recipes = await db.promise().query(`SELECT recID, name, vegetarian, vegan, kosher, halal, serving, time, difficulty, summary FROM RECIPES`);
    console.log(recipes[0]);
    res.status(200).send(recipes[0]);
});

router.post('/search', async(req, res, next) => {
    let recipes = null;

    // Extract values from request body
    let { type, search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy } = req.body;
    console.log("Request to recipes/search:", search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

    // For allergies
    // let { search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy } = req.body;
    // console.log(search, ingredients, allergies, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

    // Replace null values with wildcards that will match any value for that attribute in the db
    // % => any number of characters
    // _  => 1 character (used for the integer values here)
    if (search===null || type == "initial") search=["%"];
    else search = "%"+search+"%";

    // Replace booleans with 1 or 0 for mysql
    if (vegetarian===null || type == "initial") vegetarian="_";
    else if (vegetarian===true) vegetarian=1;
    else if (vegetarian===false) vegetarian=0;

    if (vegan===null || type == "initial") vegan="_";
    else if (vegan===true) vegan=1;
    else if (vegan===true) vegan=0;

    if (kosher===null || type == "initial") kosher="_";
    else if (kosher===true) kosher=1;
    else if (kosher===true) kosher=0;

    if (halal===null || type == "initial") halal="_";
    else if (halal===true) halal=1;
    else if (halal===true) halal=0;

    if (serving===null || type == "initial") serving="_";
    else if (serving===true) serving=1;
    else if (serving===true) serving=0;

    if (time===null || type == "initial") time="_";
    else if (time===true) time=1;
    else if (time===true) time=0;

    if (difficulty===null || type == "initial") difficulty="_";
    else if (difficulty===true) difficulty=1;
    else if (difficulty===true) difficulty=0;

    try {

        // Find summary recipe details with filters - included recID - wouldn't be displayed but can be used to fetch complete recipe details
        
        // If ingredients is null, replace it with every ingredient in the ingredients table (any are possible)
        if (ingredients===null || type == "initial") {
            ingredients = await db.promise().query(`SELECT name FROM INGREDIENTS`);
            ingredients = ingredients[0].map( elm => elm.name );
        }

        // // For allergies
        // if (allergies===null) {
        //     allergies=[];
        // }

        console.log("Request reformatted to:", search, ingredients, vegetarian, vegan, kosher, halal, serving, time, difficulty, sortBy);

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
            //console.log(recIDs);
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
        
        console.log(recipes[0]);

        res.status(200).send(recipes[0]);
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;