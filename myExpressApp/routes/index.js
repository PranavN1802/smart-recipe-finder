var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('about_1', { title: 'Bubble\'N\'Sqeak | Recipe List' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Bubble\'N\'Sqeak | Sign In' });
});

module.exports = router;
