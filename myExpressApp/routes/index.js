var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('about', { title: 'About | Bubble\'N\'Sqeak' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register | Bubble\'N\'Sqeak' });
});

router.get('/ethics', function(req, res, next) {
  res.render('ethics', { title: 'Ethics | Bubble\'N\'Sqeak' })
})

router.get('/suggest', function(req, res, next) {
  res.render('suggestPage', { title: 'Suggest | Bubble\'N\'Sqeak' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login | Bubble\'N\'Sqeak' });
});

router.get('/account', function(req, res, next) {
  return res.redirect('/users/account');
});

router.get('/references', function(req, res, next) {
  res.render('references', { title: 'References | Bubble\'N\'Sqeak' })
})

module.exports = router;
