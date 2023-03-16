// New file for passport authentication
// Router to set up any route that's needed to deal with authentication

const { Router } = require('express');

// install passport and passport local for user authentication
// passport is an authentication middleware that allows the handling of everything to do with authentication
// also takes care of saving sessions into the request object so don't have to implement own sessions
// passport local is the strategy planning to use to authenticate user (i.e. username and password)
// lots of different strategy options on passport.js e.g. with google
const passport = require('passport');

const router = Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.send(200);
});

module.exports = router;