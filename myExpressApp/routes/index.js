var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('about', { title: 'Bubble\'N\'Sqeak | About' });
});

router.get('/recipes', function(req, res, next) {
  res.render('recipeList', { title: 'Bubble\'N\'Sqeak | Recipes' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Bubble\'N\'Sqeak | Register' });
});

router.get('/suggest', function(req, res, next) {
  res.render('suggestPage', { title: 'Bubble\'N\'Sqeak | Suggest' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Bubble\'N\'Sqeak | Login' });
});

module.exports = router;
