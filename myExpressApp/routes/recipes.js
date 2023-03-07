var express = require('express');
var router = express.Router();

const db = require('./database');
const { request } = require('express');

router.get('/', async(req, res, next) => {
    res.render('recipeList', { title: 'Recipes | Bubble\'N\'Sqeak' });

    response = await db.promise().query(`SHOW TABLES`);
    console.log(response[0]);
});

router.get('/search', async(req, res, next) => {
    recipes = await db.promise().query(`SELECT recID, name, vegetarian, vegan, kosher, halal, serving, time, difficulty, summary FROM RECIPES`);
    console.log(recipes[0]);
    res.status(200).send(recipes[0]);
});

module.exports = router;